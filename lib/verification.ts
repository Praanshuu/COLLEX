import { createWorker } from 'tesseract.js';
import levenshtein from 'fast-levenshtein';
import { prisma } from './db';

interface VerificationResult {
    score: number;
    status: 'VERIFIED' | 'REJECTED' | 'PENDING';
    data: any;
    cleanedRollNumber?: string;
}

interface UserProfileData {
    name: string | null;
    fatherName: string | null;
    admissionNumber: string | null;
    enrollmentNumber: string | null;
    course: string | null;
    rollNumber: string | null;
}

export async function processVerification(
    userId: string,
    imageUrl: string,
    typedRollNumber: string,
    profileData?: UserProfileData
): Promise<VerificationResult> {
    console.log(`Starting verification for user ${userId}`);

    try {
        // 1. OCR Extraction with Timeout
        const worker = await createWorker('eng');

        const ocrPromise = worker.recognize(imageUrl);
        const timeoutPromise = new Promise<any>((_, reject) =>
            setTimeout(() => reject(new Error("OCR Timeout")), 15000)
        );

        const ret = await Promise.race([ocrPromise, timeoutPromise]);
        const ocrText = ret.data.text;
        await worker.terminate();

        console.log("OCR Text:", ocrText);

        // 2. Logic Engine
        // Standardize roll number: Uppercase and remove special chars
        const cleanedTypedRoll = typedRollNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
        console.log(`Cleaned Roll Number: ${cleanedTypedRoll}`);

        // Find potential roll numbers in OCR text
        // 1. Try to find explicit "Roll No" patterns first to boost them
        const explicitMatches = ocrText.match(/(?:Roll|Enroll|Reg|Registration)\s*(?:No\.?|Number)?\s*[:.\-]?\s*([A-Z0-9]{5,20})/gi) || [];
        const explicitCandidates = explicitMatches.map((m: string) => m.replace(/.*[:.\-]\s*/, '').trim());

        // 2. General candidate search: Alphanumeric strings that MUST contain at least one digit
        // This prevents matching "INDIA", "COLLEGE", etc.
        const generalRegex = /\b(?=[A-Z0-9]*\d)[A-Z0-9]{5,15}\b/g;
        const generalCandidates = ocrText.match(generalRegex) || [];

        // Combine candidates, prioritizing explicit ones
        const candidates = [...explicitCandidates, ...generalCandidates];

        // 3. Simplified Logic: Strict Roll Number Match
        // The user requested: "just check if scanned roll number matches roll number field from user profile data"

        let score = 0;
        let isMatch = false;

        // Check if the cleaned roll number is present in the OCR text
        // We check both the raw OCR text and the extracted candidates for robustness
        if (ocrText.toUpperCase().includes(cleanedTypedRoll)) {
            isMatch = true;
            score = 100;
            console.log("Direct match found in OCR text");
        } else {
            // Fallback: Check candidates for fuzzy match (allow 1-2 char error for long IDs)
            const bestCandidate = candidates.find((c: string) => levenshtein.get(cleanedTypedRoll, c) <= 2);
            if (bestCandidate) {
                isMatch = true;
                score = 90; // High confidence fuzzy match
                console.log(`Fuzzy match found: ${bestCandidate}`);
            }
        }

        // 4. Uniqueness Check
        const existingUser = await prisma.user.findUnique({
            where: { rollNumber: cleanedTypedRoll },
        });

        let isUnique = true;
        if (existingUser && existingUser.id !== userId) {
            isUnique = false;
            console.log(`Roll number ${cleanedTypedRoll} already exists for user ${existingUser.id}`);
        }

        // 5. Decision
        let status: 'VERIFIED' | 'REJECTED' | 'PENDING' = 'PENDING';

        if (isMatch && isUnique) {
            status = 'VERIFIED';
        } else if (!isUnique) {
            status = 'PENDING'; // Duplicate ID
        } else {
            status = 'PENDING'; // No match found
        }

        console.log(`Verification Decision: ${status} (Match: ${isMatch}, Unique: ${isUnique})`);

        return {
            score,
            status,
            cleanedRollNumber: cleanedTypedRoll,
            data: {
                ocrText: ocrText.substring(0, 500),
                isMatch,
                isUnique,
                candidates: candidates.slice(0, 5)
            }
        };

    } catch (error) {
        console.error("Verification processing failed:", error);
        return {
            score: 0,
            status: 'PENDING',
            data: { error: String(error) },
            cleanedRollNumber: typedRollNumber
        };
    }
}
