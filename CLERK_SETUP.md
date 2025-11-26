# Clerk Authentication Setup Guide

This guide walks you through setting up Clerk authentication for the Collex Marketplace application.

## Prerequisites

- Node.js 18.18+ installed
- pnpm package manager
- A Clerk account (sign up at [clerk.com](https://clerk.com))

## Step 1: Create a Clerk Application

1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Click "Create application"
3. Name your application (e.g., "Collex Marketplace")
4. Choose your authentication options:
   - Email & Password
   - Google OAuth (recommended for college students)
   - Other OAuth providers as needed
5. Click "Create application"

## Step 2: Get Your API Keys

1. In your Clerk Dashboard, navigate to **API Keys** (or use this [direct link](https://dashboard.clerk.com/last-active?path=api-keys))
2. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` for development)
   - **Secret Key** (starts with `sk_test_` for development)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

2. Replace the placeholder values with your actual keys from Step 2

> **⚠️ Security Warning:** Never commit `.env.local` to version control. The `.gitignore` file already excludes it.

## Step 4: Verify Integration

The Clerk integration is already configured in the following files:

### `middleware.ts`
Uses `clerkMiddleware()` to protect routes and manage authentication state across the app.

### `app/layout.tsx`
Wraps the entire application with `<ClerkProvider>` to enable Clerk features throughout the app.

### `components/navigation.tsx`
Implements Clerk's UI components:
- `<SignInButton>` - Opens sign-in modal
- `<SignUpButton>` - Opens sign-up modal
- `<UserButton>` - Shows user profile menu when signed in
- `<SignedIn>` / `<SignedOut>` - Conditionally render UI based on auth state

## Step 5: Start Development

```bash
pnpm dev
```

Navigate to `http://localhost:3000` and test:
1. Click "Sign Up" to create a new account
2. Complete the sign-up flow
3. Verify you see the `<UserButton>` component in the navigation
4. Click the user button to access profile settings and sign out

## Customization Options

### Protecting Specific Routes

To require authentication for specific routes, update `middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/add-listing(.*)',
  '/my-listings(.*)',
  '/profile(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### Styling the Clerk Components

Customize Clerk component appearance in `components/navigation.tsx`:

```typescript
<UserButton 
  appearance={{
    elements: {
      avatarBox: "h-8 w-8",
      userButtonPopoverCard: "shadow-lg",
      userButtonPopoverActionButton: "hover:bg-accent"
    }
  }}
/>
```

### Using Auth in Server Components

Access user data in Server Components:

```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function MyServerComponent() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome {user?.firstName}!</div>;
}
```

### Using Auth in Client Components

Access user data in Client Components:

```typescript
'use client';

import { useUser } from '@clerk/nextjs';

export default function MyClientComponent() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  if (!isSignedIn) return <div>Please sign in</div>;
  
  return <div>Welcome {user.firstName}!</div>;
}
```

## Production Deployment

1. Create a production instance in Clerk Dashboard
2. Get production API keys (starts with `pk_live_` and `sk_live_`)
3. Add environment variables to your hosting platform (Vercel, Netlify, etc.):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Configure your production domain in Clerk Dashboard under **Domains**

## Troubleshooting

### "Clerk: Missing publishable key"
- Verify `.env.local` exists and contains `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Restart your dev server after adding environment variables

### "Clerk: Middleware is not configured"
- Ensure `middleware.ts` exists at the project root
- Check that it imports from `@clerk/nextjs/server`

### Sign-in modal doesn't open
- Verify `<ClerkProvider>` wraps your app in `app/layout.tsx`
- Check browser console for errors
- Ensure `@clerk/nextjs` is installed: `pnpm list @clerk/nextjs`

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Community](https://clerk.com/community)
- [Clerk Discord](https://clerk.com/discord)
