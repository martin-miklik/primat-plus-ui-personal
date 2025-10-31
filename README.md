# Primát Plus - AI-Powered Learning Platform

> A modern learning platform where students upload study materials and AI generates flashcards, tests, and summaries.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

You should see `[MSW] Mocking enabled.` in the browser console.

## 🏗️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety (strict mode)
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **MSW** - API mocking for development
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **React Hook Form + Zod** - Forms and validation
- **Centrifuge** - Real-time streaming
- **Sentry** - Error tracking

## 📚 Documentation

- **[MSW_DOCUMENTATION.md](./MSW_DOCUMENTATION.md)** - 🔌 Complete MSW guide
- **[MSW_TASK_COMPLETE.md](./MSW_TASK_COMPLETE.md)** - ✅ MSW setup completion status
- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - ✅ Initial setup verification
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 📖 Detailed architecture
- **[QUICK_START.md](./QUICK_START.md)** - 🚀 Quick reference

## 🎯 Development Pattern: MSW-First

This project follows a **MSW-First** development pattern:

1. **Build with MSW** - Create UI and functionality using mock data
2. **Integrate Real API** - Swap mocks for real endpoints (no component changes needed)

**Benefits:**
- Frontend and backend teams work in parallel
- No API blockers during development
- Easy testing and demos
- Well-defined API contracts

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core utilities
│   ├── api/              # API client, queries, mutations
│   ├── centrifuge/       # Real-time client
│   └── validations/      # Zod schemas (7 entities)
├── mocks/                 # MSW mocking
│   ├── browser.ts        # Browser worker
│   ├── server.ts         # Node server (tests)
│   ├── handlers/         # Request handlers (7 entities + upload + auth)
│   └── fixtures/         # Mock data (37+ records)
├── stores/                # Zustand stores
└── hooks/                 # Custom React hooks
```

## 🔧 Available Scripts

```bash
pnpm dev          # Start development server (with MSW)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## 🎨 MSW API Mocking

**All API endpoints are mocked** for development:

### Entities (Full CRUD)
- ✅ **Subjects** (8 records)
- ✅ **Topics** (7 records)
- ✅ **Materials** (8 records)
- ✅ **Flashcards** (8 records) + Spaced Repetition
- ✅ **Tests** (3 records) + Scoring

### Additional Features
- ✅ **Authentication** (Register, Login, Logout)
- ✅ **File Upload** (PDF, DOCX, DOC, TXT)
- ✅ **AI Processing** (Simulated)

### Error Simulations
- ✅ 404, 500, 503 errors
- ✅ Timeout (35s)
- ✅ Slow responses (1-6s)
- ✅ Validation errors

See [MSW_DOCUMENTATION.md](./MSW_DOCUMENTATION.md) for all endpoints.

## 🧪 Test Credentials

```javascript
Email: john@example.com
Password: Password123

Email: jane@example.com  
Password: Password123

Email: test@example.com
Password: Password123
```

## 🌟 Key Features

### State Management
- **Server State** - TanStack Query for API data, caching, and optimistic updates
- **Client State** - Zustand for auth, UI, and upload queue (with persistence)
- **Forms** - React Hook Form + Zod for validation

### Real-time
- Centrifuge client for WebSocket connections
- `useCentrifuge()` hook for connections
- `useSubscription()` hook for channel subscriptions
- Auto-reconnect with exponential backoff

### Error Handling
- Error Boundary for graceful recovery
- Custom error classes
- Toast notifications (Sonner)
- Sentry integration (production)

## 🔐 Environment Variables

See `.env.local.example` for all required variables:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=/api

# Centrifuge (Real-time)
NEXT_PUBLIC_CENTRIFUGE_URL=ws://localhost:8000/connection/websocket

# MSW (API Mocking)
NEXT_PUBLIC_ENABLE_MSW=true

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=
```

## 🔄 Switching to Real API

When backend is ready:

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
```

No code changes needed! See [MSW_DOCUMENTATION.md](./MSW_DOCUMENTATION.md) for details.

## 🛠️ Development Tools

- **React Query Devtools** - Debug queries/mutations (bottom-left in browser)
- **MSW** - Intercepts all `/api/*` requests in development
- **TypeScript** - Strict mode with no `any` types
- **ESLint** - Code linting

## 📦 Adding Components

```bash
# Add shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
```

## 🚀 Building Features

Follow this workflow for any new feature:

1. **Create Zod schema** (`lib/validations/`)
2. **Create mock data** (`mocks/fixtures/`)
3. **Create MSW handlers** (`mocks/handlers/`)
4. **Create query hooks** (`lib/api/queries/`)
5. **Create mutation hooks** (`lib/api/mutations/`)
6. **Build UI** using the hooks

No backend needed! Everything works with mocks initially.

See the **subjects** module as a complete example.

## ✅ What's Ready

- ✅ All dependencies installed and configured
- ✅ MSW initialized for API mocking
- ✅ TanStack Query with retry logic
- ✅ Zustand stores (auth, upload, UI) with DevTools
- ✅ Centrifuge client for real-time
- ✅ Error handling and boundaries
- ✅ UI States (19 components: loading/error/empty)
- ✅ Dashboard & Navigation (sidebar, breadcrumbs, topbar)
- ✅ 7 complete entity implementations
- ✅ 36+ mocked endpoints (incl. dashboard)
- ✅ 37+ mock records
- ✅ Sentry integration (production)
- ✅ Test setup configured (Vitest + Testing Library)

## 🧪 Testing

Complete testing setup with Vitest + Testing Library + MSW:

```bash
pnpm test          # Run in watch mode
pnpm test:run      # Run once
pnpm test:ui       # Run with UI
pnpm test:coverage # Run with coverage
```

See [TESTING.md](./TESTING.md) for complete testing guide.

### Quick Example
```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useSubjects } from "../subjects";

test("fetches subjects", async () => {
  const { result } = renderHook(() => useSubjects(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });
})
```

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query)
- [MSW Documentation](https://mswjs.io)
- [shadcn/ui](https://ui.shadcn.com)
- [Centrifuge](https://centrifugal.dev)

## 🤝 Contributing

This project follows these principles:

- **MSW-First** - Always build with mocks first
- **Type Safety** - No `any` types (strict mode)
- **Error Handling** - All states: loading, error, empty
- **Accessibility** - WCAG AA standards
- **Mobile First** - Responsive design

## 📝 License

Private project - All rights reserved

---

**Built with ❤️ using Next.js 15, TanStack Query, and MSW**

**MSW Setup: ✅ COMPLETE** - See [MSW_TASK_COMPLETE.md](./MSW_TASK_COMPLETE.md)
