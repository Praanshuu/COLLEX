# Collex Marketplace

A campus-focused marketplace prototype built with the Next.js App Router. The goal is to provide college students with a centralized place to buy, sell, and connect around listings such as textbooks, electronics, furniture, and housing opportunities.

## Project Status

| Area      | Status | Notes |
|-----------|--------|-------|
| Frontend  | ✅ In progress | Core pages implemented with client-side validation, mock listings, and responsive UI built with Tailwind CSS and Radix UI components. |
| Authentication | ✅ Integrated | Clerk authentication configured with modal sign-in/sign-up flows and user management. |
| Backend   | ⚠️ Not started | No database or server-side logic yet. All interactions are simulated on the client. |
| APIs      | ⚠️ Not started | No API routes have been created. Integration with listing persistence and image storage is pending. |

## Implemented Frontend Features

- **Landing page (`/`)** with hero CTA and category shortcuts.
- **Browse listings (`/browse`)** page featuring search, category filtering, and sorting over mock data.
- **Add listing (`/add-listing`)** form with client-side validation, file upload preview, and listing tips.
- **Authentication (Clerk)**
  - Modal-based sign-in and sign-up flows
  - User profile management with UserButton component
  - Protected routes via middleware
  - Session management handled by Clerk
- **My listings (`/my-listings`)** and **profile (`/profile`)** placeholder pages ready for real data wiring.
- **Shared UI components** under `components/ui`, powered by Radix UI and shadcn-styled primitives.

## Outstanding Work

1. Stand up a backend (Next.js Route Handlers or external service) for listings management.
2. Replace mock data with persistent storage (e.g., Postgres, MongoDB, or Supabase).
3. Connect Clerk user data to listings (author attribution, my listings filtering).
4. Implement image storage (e.g., Vercel Blob, Cloudinary, or S3) for listing photos.
5. Add data validation and form submission via API endpoints.
6. Set up testing (unit/integration) for critical flows.
7. Harden accessibility and performance audits.
8. Remove legacy `/login` and `/signup` pages (now handled by Clerk modals).

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Authentication:** Clerk (modal flows, user management, middleware protection)
- **UI & Styling:** Tailwind CSS 4, Radix UI, shadcn-derived components
- **State & Forms:** React 19, React Hook Form, Zod
- **Utilities:** clsx, class-variance-authority, date-fns, embla-carousel
- **Icons:** lucide-react

## Project Structure

```
collex-marketplace/
├─ app/                 # App Router pages and layouts
│  ├─ add-listing/
│  ├─ browse/
│  ├─ login/
│  ├─ my-listings/
│  ├─ profile/
│  └─ signup/
├─ components/
│  ├─ ui/              # Reusable UI primitives
│  ├─ listing-card.tsx
│  └─ navigation.tsx
├─ hooks/              # Custom React hooks (placeholder)
├─ lib/                # Shared utilities
├─ public/             # Static assets
├─ styles/             # Global Tailwind entrypoint
├─ package.json
└─ pnpm-lock.yaml
```

## Getting Started

### Prerequisites

- Node.js 18.18+ (recommend 20 LTS)
- pnpm (`npm install -g pnpm`)

### Installation

```bash
pnpm install
```

> **Note:** pnpm warns that `vaul@0.9.9` expects React 16–18. The app currently uses React 19, and the UI works, but upgrade `vaul` or pin React 18 before production usage.

### Environment Setup

1. Create a `.env.local` file in the project root
2. Get your Clerk API keys from the [Clerk Dashboard](https://dashboard.clerk.com/last-active?path=api-keys)
3. Add the following environment variables:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_here
```

> **Security:** Never commit `.env.local` to version control. The `.gitignore` file excludes all `.env*` files by default.

### Local Development

```bash
pnpm dev
```

- App runs at `http://localhost:3000`
- Mock data and client-side alerts simulate backend responses

### Additional Scripts

| Script        | Description |
|---------------|-------------|
| `pnpm build`  | Create a production build |
| `pnpm start`  | Serve the production build |
| `pnpm lint`   | Run Next.js lint rules |

## Testing

Testing has not been configured. Recommended next steps include:

1. Set up Jest/Testing Library for component coverage.
2. Add Playwright or Cypress for end-to-end flows once APIs exist.

## Deployment Checklist

- Resolve peer dependency warning between React 19 and `vaul`.
- Add Clerk environment variables to production environment.
- Configure Clerk production instance and update API keys.
- Wire API routes for CRUD operations.
- Implement database and connect to Clerk user IDs.
- Configure additional environment variables (database, storage).
- Add monitoring/logging (e.g., Vercel Analytics, Sentry).

## License

This project is currently unlicensed. Add a license file before public release if required.
