# HostelExpress

HostelExpress is a campus delivery **demo** with student and store-owner experiences. The web presentation is built with React and Vite. It includes sample stores and products, simulated OTP login, order placement and status updates, inventory management, delivery tracking, and an automated demo workflow.

> **Demo limitations:** The web simulator uses sample data stored in the current browser's `localStorage`, with same-origin browser-tab synchronization. It does not currently send SMS, authenticate through Firebase, or persist simulator orders to a cloud database. The Firebase integration screen is informational only. Supabase client/API helpers are scaffolded, but are not wired into the simulator's data or authentication flow.

## Features

- Dual-pane student and store-owner simulator, with individual student and owner views
- One-click demo sign-in for the sample student and store owner
- Browse sample campus stores, add products to a cart, and place demo orders
- Follow order status changes and simulated delivery tracking
- Manage sample store inventory and availability
- Demo order alerts and a one-click end-to-end workflow
- Reset the simulator to its initial sample data
- Optional Supabase client configuration scaffold
- Flutter mobile app scaffold in `flutter_app/`

## Requirements

- Node.js 20.19+ or 22.12+
- npm (included with Node.js)

## Run the web demo

From the repository root:

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite (normally <http://localhost:5173/>). The root route redirects to `/simulator`.

To present from another device on the same trusted network, run:

```bash
npm run dev -- --host 0.0.0.0
```

Use `Ctrl+C` in the terminal to stop the development server. Do not expose the development server to an untrusted network.

## Demo walkthrough

1. Click **1-Click Demo Login** in the student panel to browse as Thejas, or click the owner demo login to open the store dashboard.
2. In the student view, choose a store, add products to the cart, and place an order.
3. Watch the order appear in the owner view, then change its status.
4. Follow the student's order tracking view as the status and simulated location update.
5. For a quick presentation, click **1-Click Auto Demo** to reset sample data and play through a complete order lifecycle. Click **Reset Demo** to restore the initial state.

The simulator persists changes in the browser. Use **Reset** or **Reset Demo** to return to the sample starting state. Audio alerts may require a click or other interaction in the browser before playback is allowed.

## Optional Supabase scaffold

`.env.example` lists the optional Vite variables:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Copy it to `.env.local` and replace the placeholders only if you are developing the Supabase scaffold. Vite exposes `VITE_*` values to browser code, so never put a Supabase service-role key, password, or other private secret in them. The simulator continues to use local demo data even when these variables are set; configuring Supabase alone does not enable production authentication, database persistence, or realtime sync.

## Build and lint

```bash
npm run build
npm run lint
```

To preview the production build locally:

```bash
npm run preview
```

## Flutter scaffold

The Flutter source is separate from the web demo and requires Flutter and platform-specific Firebase setup:

```bash
cd flutter_app
flutter pub get
flutter run
```

## Project structure

- `src/` — React web simulator, components, sample data, and backend scaffolds
- `public/` — static assets
- `flutter_app/` — Flutter mobile app scaffold
- `package.json` / `package-lock.json` — web dependencies and scripts
