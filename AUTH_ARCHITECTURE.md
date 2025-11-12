# 🏗️ Authentication Architecture - Clean Implementation

## 📋 Overview

The authentication system uses a **centralized interceptor pattern** where ALL API requests automatically include the Authorization header. No manual header management needed in components.

---

## 🔐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Component Layer                      │
│  (Dashboard, Subjects, etc.)                            │
└─────────────────────────────────────────────────────────┘
                          ↓
                  Uses React Query hooks
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API Mutation Hooks                     │
│  useLogin(), useCreateSubject(), etc.                   │
└─────────────────────────────────────────────────────────┘
                          ↓
                  Call API client functions
                          ↓
┌─────────────────────────────────────────────────────────┐
│                API Client (src/lib/api/client.ts)       │
│  ┌────────────────────────────────────────────────┐    │
│  │ 1. Check if skipAuth = false (default)         │    │
│  │ 2. Read token from localStorage                │    │
│  │ 3. Add Authorization: Bearer {token}           │    │
│  │ 4. Make fetch request                          │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Backend (PHP/Nette)                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ AuthMiddleware:                                │    │
│  │ 1. Check if public path (/auth/login)         │    │
│  │ 2. Extract Bearer token                       │    │
│  │ 3. Validate JWT                               │    │
│  │ 4. Attach user to request                     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Principles

### 1. **Single Source of Truth**
- Token is stored in **Zustand store** (persisted to localStorage)
- Store path: `auth-storage.state.token`
- All components read from the same store

### 2. **Automatic Token Injection**
- **No manual header management** in components or hooks
- API client automatically reads token and adds to ALL requests
- Uses centralized `getAuthToken()` function

### 3. **Opt-out Pattern**
- By default, ALL requests include auth
- Use `skipAuth: true` ONLY for public endpoints (like login)

### 4. **Clean Separation**
- **Components** → Don't know about tokens
- **Hooks** → Don't manage headers
- **API Client** → Handles all auth logic
- **Store** → Single source of truth

---

## 📂 File Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── client.ts           ← 🔐 AUTH INTERCEPTOR (main logic)
│   │   └── mutations/
│   │       ├── use-login.ts    ← skipAuth: true
│   │       ├── use-create-subject.ts
│   │       └── use-create-source.ts
│   └── validations/
│       └── auth.ts
├── stores/
│   └── auth-store.ts           ← Token storage
├── hooks/
│   └── use-auth.ts             ← Auth helper
└── components/
    └── auth/
        ├── auth-guard.tsx
        ├── guest-guard.tsx
        └── session-monitor.tsx
```

---

## 💻 Implementation Details

### API Client (`src/lib/api/client.ts`)

**Core Function:**
```typescript
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;
    
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}
```

**Request Interceptor:**
```typescript
// Add Authorization header if token exists and not skipped
const authHeaders: Record<string, string> = {};
if (!skipAuth) {
  const token = getAuthToken();
  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }
}

const response = await fetch(url, {
  headers: {
    "Content-Type": "application/json",
    ...headers,      // User headers first
    ...authHeaders,  // Auth header last (cannot be overridden)
  },
  // ...
});
```

**Key Points:**
- ✅ Token is read on EVERY request
- ✅ Always fresh (no stale token issues)
- ✅ Auth header has highest priority (spread last)
- ✅ Works with GET, POST, PUT, PATCH, DELETE

---

## 🔄 Token Lifecycle

### 1. **Login**
```typescript
// In use-login.ts
const response = await post("/auth/login", payload, { skipAuth: true });

// In login page
const { user, token } = await loginMutation.mutateAsync(data);
setAuth(user, token); // Stored in Zustand → localStorage
```

### 2. **Subsequent Requests**
```typescript
// In any mutation/query
const response = await post("/subjects", data);
// ↓
// API client automatically:
// 1. Reads token from localStorage
// 2. Adds Authorization: Bearer {token}
// 3. Makes request
```

### 3. **Session Validation**
```typescript
// In use-auth.ts
const response = await get("/auth/me");
// Auth header automatically added
// Backend validates JWT and returns user
```

### 4. **Logout**
```typescript
clearAuth(); // Clears token from store → localStorage
// Next request will have no Authorization header
// Backend returns 401 → Redirect to login
```

---

## 🧪 Usage Examples

### ✅ **Correct Usage (Automatic Auth)**

**Creating a Subject:**
```typescript
// Component
function CreateSubjectButton() {
  const createSubject = useCreateSubject();
  
  const handleCreate = async () => {
    await createSubject.mutateAsync({ name: "Math" });
    // Authorization header automatically added ✅
  };
}

// Mutation Hook
export function useCreateSubject() {
  return useMutation({
    mutationFn: async (data) => {
      // No auth logic needed! ✅
      return post("/subjects", data);
    },
  });
}
```

**Uploading a File:**
```typescript
export function useUploadSource() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      
      // Authorization automatically added ✅
      return post("/sources", formData);
    },
  });
}
```

### ⚠️ **Exception: FormData/File Uploads**

For FormData uploads that can't use our API client (like direct `fetch()` for file uploads):

```typescript
import { getAuthToken } from "@/lib/api/client";

// ✅ Correct way for FormData uploads
const token = getAuthToken();
const formData = new FormData();
formData.append("file", file);

await fetch("/api/v1/sources", {
  method: "POST",
  body: formData,
  headers: {
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});
```

**Note:** We export `getAuthToken()` from the API client for this specific use case.

### ❌ **Anti-Patterns (Don't Do This)**

```typescript
// ❌ DON'T manually add Authorization header for JSON requests
const token = useAuthStore((state) => state.token);
await post("/subjects", data, {
  headers: {
    Authorization: `Bearer ${token}`, // ❌ Redundant!
  },
});

// ❌ DON'T read from Zustand store
const token = useAuthStore((state) => state.token); // ❌ Wrong!

// ❌ DON'T pass token as parameter
await createSubject(data, token); // ❌ Bad architecture!
```

---

## 🔒 Public Endpoints (skipAuth)

**ONLY use skipAuth for endpoints that don't require authentication:**

```typescript
// Login - no auth needed
await post("/auth/login", credentials, { skipAuth: true });

// Register - no auth needed
await post("/auth/register", userData, { skipAuth: true });

// Public health check
await get("/health", { skipAuth: true });
```

**Everything else gets auth automatically!**

---

## 🐛 Debugging

### Check if Token is Stored
```javascript
// Browser console
const auth = JSON.parse(localStorage.getItem('auth-storage'))
console.log('Token:', auth.state.token)
console.log('User:', auth.state.user)
```

### Check if Header is Sent
1. Open DevTools → Network tab
2. Click on any API request
3. Go to "Headers" section
4. Look for:
   ```
   Authorization: Bearer eyJ0eXAiOiJKV1Qi...
   ```

### Console Logs
The API client now logs all auth operations:
```
[API Client] Token retrieved successfully: eyJ0eXAiOiJKV1Qi...
[API Client] POST /subjects - Authorization header added
```

---

## ✅ Architecture Benefits

1. **🎯 Centralized** - One place for auth logic
2. **🧹 Clean** - Components don't handle tokens
3. **🔒 Secure** - Can't accidentally skip auth
4. **🚀 DRY** - Write once, works everywhere
5. **🧪 Testable** - Easy to mock auth state
6. **📦 Maintainable** - Change auth once, affects all

---

## 🔄 Migration from Manual Auth

If you have existing code manually adding headers:

**Before:**
```typescript
const token = useAuthStore((state) => state.token);
await fetch("/api/subjects", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

**After:**
```typescript
// Just use the API client - auth is automatic!
await post("/subjects", data);
```

---

## 📝 Testing

### Unit Tests
```typescript
// Mock localStorage in tests
beforeEach(() => {
  localStorage.setItem('auth-storage', JSON.stringify({
    state: { token: 'test-token' }
  }));
});

test('API client adds auth header', async () => {
  const fetch = jest.fn();
  // ... test that fetch is called with Authorization header
});
```

### Integration Tests
```typescript
test('Create subject with auth', async () => {
  // Login first
  await loginMutation.mutateAsync({ email, password });
  
  // Create subject (auth automatic)
  const result = await createSubject.mutateAsync({ name: "Math" });
  
  expect(result).toBeDefined();
});
```

---

## 🚀 Summary

**You never need to think about auth headers!**

- ✅ Login → Token stored automatically
- ✅ Every request → Auth header added automatically  
- ✅ Logout → Token cleared automatically
- ✅ Session expired → Redirect to login automatically

**Clean Architecture = Less Code + Fewer Bugs** 🎉

