# 🚀 Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- pnpm package manager

## Setup

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration (or use defaults for local development).

3. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 What's Included

### ✅ Already Configured

- **MSW (Mock Service Worker)** - API mocking for development
- **TanStack Query v5** - Server state management with retry logic
- **Zustand** - Client state management with persistence
- **Sentry** - Error tracking (disabled in dev, configure for production)
- **Centrifuge** - Real-time streaming client
- **React Hook Form + Zod** - Forms and validation
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **sonner** - Toast notifications

### 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Core utilities
│   ├── api/              # API client, queries, mutations
│   ├── centrifuge/       # Real-time client
│   └── validations/      # Zod schemas
├── mocks/                 # MSW mocking
│   ├── handlers/         # Request handlers
│   └── fixtures/         # Mock data
├── stores/                # Zustand stores
└── hooks/                 # Custom React hooks
```

## 🔥 Example: Subjects Module

A complete working example is already implemented to demonstrate the MSW-first workflow:

### Files Created:
- ✅ `lib/validations/subject.ts` - Zod schemas with types
- ✅ `mocks/fixtures/subjects.ts` - Mock data
- ✅ `mocks/handlers/subjects.ts` - MSW request handlers
- ✅ `lib/api/queries/subjects.ts` - Query hooks
- ✅ `lib/api/mutations/subjects.ts` - Mutation hooks with optimistic updates

### How to Use:

```typescript
// In your component
import { useSubjects, useCreateSubject } from '@/lib/api/queries/subjects'

function SubjectsPage() {
  const { data, isLoading } = useSubjects()
  const createSubject = useCreateSubject()
  
  const handleCreate = () => {
    createSubject.mutate({
      name: 'New Subject',
      description: 'Description',
    })
  }
  
  // ... rest of component
}
```

## 🛠️ Development Workflow

### Phase 1: Build with MSW (Current)

1. **Define schema** (`lib/validations/`)
   ```typescript
   export const itemSchema = z.object({
     id: z.string(),
     name: z.string(),
   })
   ```

2. **Create mock data** (`mocks/fixtures/`)
   ```typescript
   export const mockItems = [{ id: '1', name: 'Item 1' }]
   ```

3. **Create MSW handler** (`mocks/handlers/`)
   ```typescript
   http.get('/api/items', () => {
     return HttpResponse.json({ data: mockItems })
   })
   ```

4. **Create query hook** (`lib/api/queries/`)
   ```typescript
   export function useItems() {
     return useQuery({
       queryKey: ['items'],
       queryFn: () => get('/api/items'),
     })
   }
   ```

5. **Build UI** - Use the hooks, everything works!

### Phase 2: Real API Integration (Later)

When backend is ready:
1. Remove/comment out MSW handlers
2. No changes needed in components
3. Same hooks, same API contract

## 📦 Available Commands

```bash
# Development
pnpm dev          # Start dev server with MSW enabled

# Production
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
```

## 🔌 State Management

### Server State (TanStack Query)
```typescript
// Queries (read)
const { data, isLoading } = useItems()

// Mutations (write)
const createItem = useCreateItem()
createItem.mutate({ name: 'New Item' })
```

### Client State (Zustand)
```typescript
// Auth store
const { user, setAuth, clearAuth } = useAuthStore()

// Upload store
const { files, addFiles } = useUploadStore()

// UI store
const { sidebarOpen, toggleSidebar } = useUIStore()
```

## 🌐 Real-time (Centrifuge)

```typescript
// Connection
const { client, isConnected } = useCentrifuge()

// Subscription
const { data, isSubscribed } = useSubscription('channel-name', {
  onPublication: (data) => console.log('New data:', data),
})
```

## 🎨 Adding shadcn/ui Components

```bash
# Add individual components
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form

# Components will be added to src/components/ui/
```

## 📝 Forms Example

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
})

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  })
  
  const onSubmit = (data) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* form fields */}
    </form>
  )
}
```

## 🚨 Error Handling

All API calls automatically:
- Show toast notifications on error
- Retry with exponential backoff
- Handle network failures
- Report to Sentry (in production)

Error Boundary wraps the entire app for graceful error recovery.

## 📚 Documentation

- `ARCHITECTURE.md` - Detailed architecture documentation
- `.env.local.example` - Environment variables reference
- `src/mocks/handlers/subjects.ts` - Example MSW handler
- `src/lib/api/queries/subjects.ts` - Example query hooks

## 🎯 Next Steps

1. ✅ Everything is set up and ready to use
2. 🔨 Start building features using the subjects example as reference
3. 📖 Read `ARCHITECTURE.md` for detailed patterns
4. 🚀 When ready for production, swap MSW for real API

## 💡 Tips

- MSW intercepts all `/api/*` requests in development
- Check browser console for MSW confirmation message
- Use React Query Devtools (bottom-left) to debug queries
- All stores persist to localStorage automatically
- Toast notifications appear top-right

## 🐛 Troubleshooting

**MSW not working?**
- Check browser console for MSW initialization message
- Verify `public/mockServiceWorker.js` exists
- Clear browser cache and reload

**TypeScript errors?**
- Run `pnpm install` to ensure all types are installed
- Check `tsconfig.json` paths are correct

**Build errors?**
- Ensure all environment variables are set
- Check for any `any` types (strict mode enabled)

## 🎉 You're Ready!

Everything is configured and working. Check out the example subjects implementation and start building your features!

