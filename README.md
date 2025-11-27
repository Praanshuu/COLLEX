# Collex - College Marketplace 🎓

Collex is a specialized marketplace and connection platform designed exclusively for college students. It provides a secure, trusted environment for buying and selling campus essentials, finding roommates, and connecting with peers.

![Collex Banner](https://via.placeholder.com/1200x400?text=Collex+Marketplace)

## 🚀 Project Status

| Area | Status | Notes |
|------|--------|-------|
| **Frontend** | ✅ Completed | Modern, responsive UI with Tailwind CSS, Framer Motion, and Shadcn UI. |
| **Backend** | ✅ Completed | Server Actions, Prisma ORM, and Neon (PostgreSQL) database fully integrated. |
| **Auth** | ✅ Completed | Clerk authentication with custom Roll Number & ID Card verification (OCR). |
| **Features** | ✅ Completed | Marketplace, Roommate Finder (Tinder-style), Real-time Chat, Notifications. |

## ✨ Key Features

### 🛒 Marketplace
- **Buy & Sell**: Post listings for textbooks, electronics, furniture, and more.
- **Smart Search**: Filter by category, price, and keywords.
- **Verification**: Only verified students can post, ensuring safety.
- **Monetization**: Subscription tiers (Free, Pro, Business) for sellers to boost listings.

### 🤝 Roommate Finder
- **Swipe Interface**: Tinder-style "Swipe Right" to match with potential roommates.
- **Intelligent Matching**: Matches based on preferences (Sleep schedule, cleanliness, etc.).
- **Auto-Connect**: Mutual matches automatically create a chat conversation.

### 💬 Real-time Chat
- **Rich Messaging**: Send text, emojis, images, and documents.
- **Attachments**: Secure local file upload system for sharing files.
- **Notifications**: Instant alerts for new messages and matches.
- **Mobile Optimized**: Responsive chat interface with auto-scroll and read receipts.

### 🔐 Security & Verification
- **Clerk Authentication**: Secure login via Email/Google.
- **Identity Verification**:
    - **OCR Technology**: Uses Tesseract.js to scan College ID cards.
    - **Roll Number Check**: Ensures one account per student.
    - **Phone Verification**: OTP-based verification for trusted contacts.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **OCR**: [Tesseract.js](https://tesseract.projectnaptha.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `date-fns`, `zod`, `react-hook-form`, `sonner`

## 📂 Project Structure

```
collex-marketplace/
├── app/                    # Next.js App Router
│   ├── actions.ts          # Server Actions (Backend Logic)
│   ├── api/                # API Routes (Webhooks, Seed)
│   ├── (auth)/             # Authentication Pages
│   ├── browse/             # Marketplace Browse Page
│   ├── messages/           # Chat System
│   ├── roommate-finder/    # Swipe Interface
│   └── ...
├── components/             # React Components
│   ├── auth/               # Auth Guards & Verification
│   ├── chat/               # Chat UI Components
│   ├── ui/                 # Shadcn UI Primitives
│   └── ...
├── prisma/                 # Database Schema
│   └── schema.prisma
├── public/                 # Static Assets & Uploads
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database (Neon recommended)
- Clerk Account

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/collex-marketplace.git
    cd collex-marketplace
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add:
    ```env
    # Database
    DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    ```

4.  **Database Setup:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🧪 Testing

- **Manual Testing**: The app is fully functional for manual testing.
- **Seed Data**: Use the `/api/seed` route (if enabled) to populate mock data for testing.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
