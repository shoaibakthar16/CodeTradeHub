# CodeTradeHub — Source Code Marketplace

## Project Overview
A full-featured digital marketplace for buying and selling source code — website templates, SaaS kits, mobile apps, and full-stack starters. Built with React/Vite + Firebase.

## Architecture
- **Frontend**: React + Vite (TypeScript), TailwindCSS v4, shadcn/ui
- **Auth**: Firebase Auth (Google OAuth + Email/Password)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage (product ZIPs + thumbnails)
- **Payments**: Stripe test-mode simulation (writes paid order to Firestore directly)
- **WhatsApp**: Creates pending order + opens wa.me link
- **Routing**: Wouter

## Monorepo Structure
```
artifacts/
  codemarket-pro/       # Main React/Vite frontend
  api-server/           # Express API server (for future use)
  mockup-sandbox/       # Component preview sandbox
```

## Key Files
- `artifacts/codemarket-pro/src/App.tsx` — All 17 routes
- `artifacts/codemarket-pro/src/lib/firebase.ts` — Firebase init
- `artifacts/codemarket-pro/src/lib/firestore.ts` — All Firestore functions
- `artifacts/codemarket-pro/src/lib/storage.ts` — Firebase Storage upload helpers
- `artifacts/codemarket-pro/src/lib/stripe.ts` — Stripe init + helpers
- `artifacts/codemarket-pro/src/contexts/AuthContext.tsx` — Auth state + userProfile
- `artifacts/codemarket-pro/src/contexts/CartContext.tsx` — Cart state + coupon logic
- `artifacts/codemarket-pro/src/types/index.ts` — All TypeScript types

## Pages Built
### Store
- `/` — HomePage (hero, categories, latest products)
- `/products` — ProductsPage (search, filter, sort)
- `/products/:slug` — ProductDetailPage (gallery, reviews, buy buttons)
- `/cart` — CartPage (coupon code, order summary)
- `/checkout` — CheckoutPage (Stripe test + WhatsApp)
- `/success` — SuccessPage (confirmation + order details)
- `/login` — LoginPage (Google OAuth + email/password tabs)

### User Dashboard
- `/dashboard` — Purchased products + download buttons
- `/dashboard/downloads` — Downloads list with ZIP links
- `/dashboard/orders` — Order history with status badges

### Admin Panel (role-based)
- `/admin` — Stats overview + recent orders
- `/admin/products` — CRUD products (create/edit/delete/publish)
- `/admin/orders` — Update order status (pending/paid/cancelled)
- `/admin/users` — Promote/demote admin roles
- `/admin/coupons` — Create/manage discount coupons
- `/admin/reviews` — Approve/reject/delete user reviews
- `/admin/uploads` — Upload ZIP files + thumbnails to Firebase Storage

## Environment Variables (Secrets)
All set as Replit secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_WHATSAPP_NUMBER`

## Firebase Setup Requirements (Manual Steps)
1. **Firestore**: Enable in Firebase Console → Firestore Database → Create database (production mode)
2. **Auth**: Enable Google provider + Email/Password provider in Firebase Console → Authentication
3. **Storage**: Enable in Firebase Console → Storage → Get started
4. **Admin user**: After first sign-in, set `role: "admin"` on user doc in Firestore `users` collection
5. **Firestore Rules**: Configure read/write rules for security

## Design
- Dark theme: near-black navy background (`#0d1117` range)
- Primary: electric indigo (`hsl(250 90% 64%)`)
- Accent: cyan (`hsl(186 100% 50%)`)
- Fonts: Inter (UI), JetBrains Mono (code/prices)

## Development
```bash
pnpm --filter @workspace/codemarket-pro run dev
```

## Deployment
Ready for Firebase Hosting. Build with:
```bash
pnpm --filter @workspace/codemarket-pro run build
```
