# MSW (Mock Service Worker) Documentation

## 📚 Overview

This project uses **MSW (Mock Service Worker)** to mock API requests during development and testing. This allows frontend development to proceed independently from backend implementation.

## 🚀 Quick Start

### Development Mode

MSW is **automatically enabled** in development (`NODE_ENV=development`). When you run:

```bash
pnpm dev
```

The browser console will show:
```
[MSW] Mocking enabled.
```

### Disabling MSW

To disable MSW in development, set in `.env.local`:

```bash
NEXT_PUBLIC_ENABLE_MSW=false
```

Or temporarily modify `src/app/providers.tsx`.

## 📁 Project Structure

```
src/mocks/
├── browser.ts           # MSW worker for browser
├── server.ts            # MSW server for Node.js (tests)
├── setup-tests.ts       # Test setup file
├── handlers/
│   ├── index.ts         # All handlers exported
│   ├── subjects.ts      # Subjects CRUD
│   ├── topics.ts        # Topics CRUD
│   ├── materials.ts     # Materials CRUD
│   ├── flashcards.ts    # Flashcards + spaced repetition
│   ├── tests.ts         # Tests + submissions
│   ├── auth.ts          # Authentication
│   └── upload.ts        # File uploads
└── fixtures/
    ├── index.ts         # All fixtures exported
    ├── subjects.ts      # Subject data (8 records)
    ├── topics.ts        # Topic data (7 records)
    ├── materials.ts     # Material data (8 records)
    ├── flashcards.ts    # Flashcard data (8 records)
    ├── tests.ts         # Test data (3 records)
    └── auth.ts          # User data (3 records)
```

## 🔌 Available Endpoints

### Subjects
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/:id` - Get single subject
- `POST /api/subjects` - Create subject
- `PATCH /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Topics
- `GET /api/subjects/:subjectId/topics` - List topics for subject
- `GET /api/topics/:id` - Get single topic
- `POST /api/subjects/:subjectId/topics` - Create topic
- `PATCH /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

### Materials
- `GET /api/topics/:topicId/materials` - List materials for topic
- `GET /api/materials/:id` - Get single material
- `POST /api/topics/:topicId/materials` - Create material
- `PATCH /api/materials/:id` - Update material
- `DELETE /api/materials/:id` - Delete material

### Flashcards
- `GET /api/materials/:materialId/flashcards` - List flashcards
- `GET /api/flashcards/:id` - Get single flashcard
- `GET /api/flashcards/due` - Get due flashcards for review
- `POST /api/materials/:materialId/flashcards` - Create flashcard
- `POST /api/flashcards/:id/review` - Review flashcard (spaced repetition)
- `PATCH /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard

### Tests
- `GET /api/materials/:materialId/tests` - List tests
- `GET /api/tests/:id` - Get single test
- `GET /api/tests/:id/attempts` - Get test attempts
- `POST /api/materials/:materialId/tests` - Create test
- `POST /api/tests/:id/submit` - Submit test answers
- `DELETE /api/tests/:id` - Delete test

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/me` - Update current user

### File Upload
- `POST /api/upload` - Upload file (PDF, DOCX, DOC, TXT)
- `POST /api/materials/:materialId/process` - Trigger AI processing
- `GET /api/materials/:materialId/process-status` - Check processing status

### Error Simulation
- `GET /api/error/500` - Simulate 500 Internal Server Error
- `GET /api/error/timeout` - Simulate timeout (35s delay)
- `GET /api/error/random` - Random error (404, 500, or 503)
- `GET /api/error/slow` - Random slow response (1-6s)

## 🧪 Error Simulations

### Built-in Error States

All endpoints simulate realistic error scenarios:

1. **404 Not Found** - When resource doesn't exist
2. **400 Validation Error** - When required fields are missing
3. **401 Unauthorized** - When auth is required
4. **409 Conflict** - When email already exists (register)
5. **413 Payload Too Large** - When file exceeds 50MB
6. **415 Unsupported Media Type** - When file type is invalid

### Network Delays

All handlers include realistic network delays:
- GET requests: 200-250ms
- POST requests: 400-500ms
- File uploads: 2000ms
- DELETE requests: 300ms

### Testing Error States

Use the error simulation endpoints:

```typescript
// Test 500 error
fetch('/api/error/500')

// Test timeout
fetch('/api/error/timeout')

// Test random errors
fetch('/api/error/random')

// Test slow responses
fetch('/api/error/slow')
```

## 🔄 Switching to Real API

When the backend is ready:

### Option 1: Environment Variable (Recommended)

```bash
# .env.local
NEXT_PUBLIC_ENABLE_MSW=false
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
```

### Option 2: Conditional Import

```typescript
// src/app/providers.tsx
async function enableMocking() {
  // Only enable in development AND when flag is true
  if (
    process.env.NODE_ENV !== 'development' || 
    process.env.NEXT_PUBLIC_ENABLE_MSW === 'false'
  ) {
    return;
  }
  
  const { worker } = await import('@/mocks/browser');
  return worker.start();
}
```

### Option 3: Remove MSW Initialization

Comment out MSW in `src/app/providers.tsx`:

```typescript
// const [mswReady, setMswReady] = useState(false)

// useEffect(() => {
//   enableMocking().then(() => {
//     setMswReady(true)
//   })
// }, [])
```

## 🧪 Testing with MSW

### Setup in Tests

Add to your test setup file (e.g., `vitest.setup.ts` or `jest.setup.ts`):

```typescript
import '@/mocks/setup-tests'
```

Or manually:

```typescript
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Override Handlers in Tests

```typescript
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

test('handles server error', async () => {
  server.use(
    http.get('/api/subjects', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      )
    })
  )
  
  // Your test code...
})
```

## 📊 Mock Data

### Credentials (for testing login)

```
Email: john@example.com
Password: Password123

Email: jane@example.com  
Password: Password123

Email: test@example.com
Password: Password123
```

### Data Counts

- **Subjects**: 8 records
- **Topics**: 7 records  
- **Materials**: 8 records
- **Flashcards**: 8 records
- **Tests**: 3 records
- **Users**: 3 records

## 🎯 Best Practices

### 1. Always Reset State Between Tests

```typescript
afterEach(() => server.resetHandlers())
```

### 2. Use Unique IDs

All fixtures use UUIDs to prevent collisions.

### 3. Simulate Realistic Delays

```typescript
await delay(300) // Simulate network latency
```

### 4. Handle Edge Cases

- Empty states (no data)
- Error states (404, 500)
- Loading states (delays)
- Validation errors (400)

### 5. Document API Contract

The MSW handlers serve as **API documentation**. They define:
- Request format
- Response format
- Error responses
- Status codes

## 🔧 Troubleshooting

### MSW Not Working

1. Check browser console for `[MSW] Mocking enabled`
2. Verify `public/mockServiceWorker.js` exists
3. Clear browser cache and reload
4. Check Network tab - requests should show `(from ServiceWorker)`

### Requests Going to Real API

1. Ensure `NODE_ENV=development`
2. Check `NEXT_PUBLIC_ENABLE_MSW` is not `false`
3. Verify handler URL matches exactly
4. MSW uses path matching - ensure paths match

### Test Failures

1. Import `@/mocks/setup-tests` in test setup
2. Use `server.resetHandlers()` in `afterEach`
3. Check handler paths match test requests
4. Ensure server is listening in `beforeAll`

## 📝 Adding New Endpoints

### 1. Create Validation Schema

```typescript
// src/lib/validations/entity.ts
export const entitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

export type Entity = z.infer<typeof entitySchema>
```

### 2. Create Fixtures

```typescript
// src/mocks/fixtures/entities.ts
export const mockEntities: Entity[] = [
  { id: '...', name: '...' }
]
```

### 3. Create Handlers

```typescript
// src/mocks/handlers/entities.ts
export const entitiesHandlers = [
  http.get('/api/entities', async () => {
    await delay(250)
    return HttpResponse.json({ data: mockEntities })
  })
]
```

### 4. Register Handlers

```typescript
// src/mocks/handlers/index.ts
import { entitiesHandlers } from './entities'

export const handlers = [
  ...entitiesHandlers,
  // ...
]
```

## 🚀 Production Deployment

MSW is **automatically disabled** in production:

```typescript
if (process.env.NODE_ENV !== 'development') {
  return // MSW won't load
}
```

No additional configuration needed!

## 📚 Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [MSW Examples](https://github.com/mswjs/examples)
- [Next.js + MSW Guide](https://mswjs.io/docs/integrations/next-js)

## ✅ Checklist

- [x] MSW initialized in `public/`
- [x] All entities have handlers
- [x] All entities have fixtures (5-10 records each)
- [x] Error simulations (404, 500, timeout)
- [x] Network delays configured
- [x] Test setup configured
- [x] Documentation complete
- [x] Switching guide provided

