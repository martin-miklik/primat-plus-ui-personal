# Primát Plus - Architecture Documentation

## 📚 Overview

This is a modern learning platform built with Next.js 15, following a **MSW-First** development pattern. The architecture is designed for parallel frontend/backend development, with clean separation of concerns.

## 🏗️ Tech Stack

### Core Framework
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React features
- **TypeScript** - Strict mode enabled

### State & Data Management
- **TanStack Query v5** - Server state, caching, optimistic updates
- **Zustand** - Client state (auth, upload queue, UI)
- **React Hook Form + Zod** - Forms and validation

### UI & Styling
- **shadcn/ui** - Component library (built on Radix UI)
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### API & Real-time
- **MSW (Mock Service Worker)** - API mocking for development
- **Centrifuge** - Real-time streaming client
- **Sentry** - Error tracking and monitoring

### Additional
- **react-markdown + remark-gfm** - Markdown rendering with GFM
- **react-dropzone** - File uploads
- **date-fns** - Date utilities
- **sonner** - Toast notifications

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── providers.tsx      # Client providers (Query, MSW, Toast)
│   └── page.tsx           # Home page
│
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── error-boundary.tsx # Error boundary
│
├── lib/                   # Core utilities
│   ├── api/
│   │   ├── client.ts     # Fetch wrapper with retry logic
│   │   ├── queries/      # TanStack Query read hooks
│   │   └── mutations/    # TanStack Query write hooks
│   ├── centrifuge/
│   │   └── client.ts     # Centrifuge client setup
│   ├── validations/      # Zod schemas
│   ├── query-client.ts   # TanStack Query config
│   ├── constants.ts      # App constants
│   ├── errors.ts         # Error classes
│   └── utils.ts          # General utilities
│
├── mocks/                 # MSW mocking
│   ├── browser.ts        # MSW worker setup
│   ├── handlers/         # Request handlers
│   └── fixtures/         # Mock data
│
├── stores/                # Zustand stores
│   ├── auth-store.ts     # Authentication state
│   ├── upload-store.ts   # Upload queue state
│   ├── ui-store.ts       # UI state
│   └── index.ts          # Export all stores
│
└── hooks/                 # Custom React hooks
    └── use-centrifuge.ts # Centrifuge hooks
```

## 🔄 Development Pattern: MSW-First

Every feature MUST be built in 2 phases:

### Phase 1: Build with MSW
1. Create Zod validation schema (`lib/validations/`)
2. Create mock data fixtures (`mocks/fixtures/`)
3. Create MSW handlers (`mocks/handlers/`)
4. Create TanStack Query hooks (`lib/api/queries/`, `lib/api/mutations/`)
5. Build UI components using the hooks
6. Test everything with mocks

### Phase 2: Real API Integration
1. Create separate integration task
2. Swap MSW handlers for real API endpoints
3. No changes needed in components (same hooks)

**Benefits:**
- Frontend and backend teams work in parallel
- No API blockers during development
- Easy to test and demo features
- Consistent API contract via MSW handlers

## 🎯 State Management Strategy

### Server State (TanStack Query)
- API data
- Caching
- Background refetching
- Optimistic updates
- Pagination

### Client State (Zustand)
- Authentication (persisted)
- Upload queue
- UI toggles
- User preferences

**Rule:** NEVER use `localStorage` directly. Always use Zustand with persist middleware.

## 📝 Forms & Validation

All forms follow this pattern:

```typescript
// 1. Define Zod schema
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

// 2. Infer types
type FormData = z.infer<typeof schema>

// 3. Use React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

## 🔌 API Layer

### Client (`lib/api/client.ts`)
- Fetch wrapper with retry logic
- Automatic error handling
- Request timeout (30s default)
- Type-safe responses

### Queries (`lib/api/queries/`)
- Read operations
- Automatic caching
- Background refetching
- Suspense support

### Mutations (`lib/api/mutations/`)
- Write operations (POST, PUT, PATCH, DELETE)
- Optimistic updates
- Automatic cache invalidation
- Toast notifications

## 🌐 Real-time (Centrifuge)

### Client Setup
- Exponential backoff reconnection (1s, 2s, 4s, 8s, 16s)
- Automatic reconnect on disconnect
- Debug mode for development

### Hooks
```typescript
// Connection hook
const { client, isConnected } = useCentrifuge()

// Subscription hook
const { data, isSubscribed } = useSubscription('channel-name', {
  onPublication: (data) => console.log(data),
})
```

## 🛡️ Error Handling

### Error Classes
- `ApiError` - API-related errors
- `AuthError` - Authentication errors
- `ValidationError` - Form validation errors
- `NetworkError` - Network failures
- `UploadError` - File upload errors

### Error Boundaries
- Component-level error recovery
- Automatic error reporting to Sentry
- User-friendly fallback UI

### Toast Notifications
- Success/error feedback
- Retry mechanisms
- Dismissible notifications

## ♿ Accessibility

- ARIA labels on interactive elements
- Keyboard navigation (Tab, Enter, Esc)
- Focus management in modals
- WCAG AA color contrast
- `prefers-reduced-motion` support

## 🚀 Performance

- API response target: < 500ms
- Optimistic updates for mutations
- Skeleton loaders (no lone spinners)
- Lazy loading for routes
- Next.js Image optimization
- Component code splitting

## 🧪 Quality Standards

- TypeScript strict mode (no `any`)
- Export types from Zod schemas
- Max 200 lines per component file
- Collocate tests with components
- Document complex business logic

## 🔐 Environment Variables

See `.env.local.example` for required variables:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Centrifuge
NEXT_PUBLIC_CENTRIFUGE_URL=ws://localhost:8000/connection/websocket

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

## 📦 Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🎨 Component Checklist

When building ANY feature, ensure:
- [ ] MSW handlers with realistic data
- [ ] Loading skeleton (not just spinner)
- [ ] Empty state with CTA
- [ ] Error state with retry button
- [ ] Form validation (Zod schema)
- [ ] Optimistic updates (if applicable)
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Error boundary wrapper
- [ ] Toast notifications

## 📖 Example: Subjects Module

A complete example implementation is available:

- `lib/validations/subject.ts` - Zod schemas
- `mocks/fixtures/subjects.ts` - Mock data
- `mocks/handlers/subjects.ts` - MSW handlers
- `lib/api/queries/subjects.ts` - Query hooks
- `lib/api/mutations/subjects.ts` - Mutation hooks

Study this example when building new features.

## 🚫 Critical Don'ts

- ❌ Don't use localStorage directly
- ❌ Don't connect to real APIs initially
- ❌ Don't use custom Tailwind config
- ❌ Don't forget loading/error/empty states
- ❌ Don't use `any` type
- ❌ Don't create 500+ line components
- ❌ Don't forget mobile responsiveness

