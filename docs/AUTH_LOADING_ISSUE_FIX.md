# Authentication Loading Screen Issue - Fixed

## 🐛 The Problem

A developer got stuck at **"Kontrola autentizace..."** (Authentication Check) loading screen with no backend requests being sent. The issue was resolved by clearing browser cache/localStorage.

### Symptoms
- Infinite loading at "Kontrola autentizace..." screen
- **No API requests** being sent to backend (`/api/v1/auth/me`)
- Only fixed by clearing browser cache/localStorage

## 🔍 Root Cause Analysis

The issue occurred when **localStorage got into a corrupted state**. Here's the problematic flow:

### 1. Auth Store Persistence
```typescript
// src/stores/auth-store.ts
persist(
  (set, get) => ({ ...state }),
  {
    name: "auth-storage",
    storage: createJSONStorage(() => localStorage),
  }
)
```

If localStorage data becomes corrupted (malformed JSON, wrong structure, etc.), Zustand's hydration can fail silently.

### 2. Session Validation Flow
```typescript
// src/hooks/use-auth.ts
const validateSession = async () => {
  if (!token) {
    setValidated(true);
    return false;
  }

  setLoading(true);
  try {
    const response = await get<SessionResponse>("/auth/me");
    // ...
  } catch (error) {
    // Network error - keeps session as valid
    return isAuthenticated;
  }
}
```

**Problems:**
1. If `isValidated = false` but token is corrupted, it tries to validate
2. If network fails (not 401), it assumes session is still valid
3. No timeout mechanism for stuck validation

### 3. Auth Guard Waiting Forever
```typescript
// src/components/auth/auth-guard.tsx
if (!isValidated || isLoading) {
  return <LoadingScreen />; // Stuck here forever!
}
```

## ✅ Implemented Fixes

### Fix 1: Storage Validation on App Init
**File: `src/lib/utils/storage-validator.ts`** (NEW)

```typescript
export function initializeStorage(): void {
  const isValid = validateAuthStorage();
  
  if (!isValid) {
    console.warn("Detected corrupted auth storage, clearing...");
    clearAuthStorage();
  }
}
```

- Validates localStorage structure on app startup
- Clears corrupted data before Zustand hydrates
- Called in `src/app/providers.tsx`

### Fix 2: Better Error Handling in Token Retrieval
**File: `src/lib/api/client.ts`**

```typescript
export function getAuthToken(): string | null {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.token || null;
  } catch (error) {
    // Clear corrupted storage instead of silently returning null
    console.error("Failed to parse auth storage, clearing corrupted data:", error);
    localStorage.removeItem("auth-storage");
    return null;
  }
}
```

### Fix 3: Hydration Error Recovery in Store
**File: `src/stores/auth-store.ts`**

```typescript
persist(
  (set, get) => ({ ...state }),
  {
    name: "auth-storage",
    storage: createJSONStorage(() => localStorage),
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error("Failed to rehydrate auth store:", error);
        localStorage.removeItem("auth-storage");
      }
    },
  }
)
```

### Fix 4: Better Session Validation Logic
**File: `src/hooks/use-auth.ts`**

```typescript
catch (error) {
  if (error instanceof ApiError && error.statusCode === 401) {
    clearAuth();
    setValidated(true);
    return false;
  }

  // Network error - mark as validated to prevent infinite loading
  console.error("Session validation error:", error);
  setValidated(true);
  
  // If we had no authenticated session, clear auth to prevent stuck state
  if (!isAuthenticated) {
    console.warn("No authenticated session found after validation error, clearing auth");
    clearAuth();
  }
  
  return isAuthenticated;
}
```

### Fix 5: Timeout Mechanism in AuthGuard
**File: `src/components/auth/auth-guard.tsx`**

```typescript
const [timeoutReached, setTimeoutReached] = useState(false);

// Timeout fallback - if validation takes too long (15s), force logout
useEffect(() => {
  if (!isValidated) {
    const timeout = setTimeout(() => {
      console.error("Session validation timeout - forcing logout");
      setTimeoutReached(true);
      clearAuth();
    }, 15000); // 15 second timeout

    return () => clearTimeout(timeout);
  }
}, [isValidated, clearAuth]);
```

**Benefits:**
- Prevents infinite loading (max 15 seconds)
- Forces logout and redirect to login
- Shows error message to user

### Fix 6: Better Debugging
**File: `src/lib/api/client.ts`**

```typescript
// Log request in development for debugging
if (process.env.NODE_ENV === "development") {
  console.debug(`[API] ${restOptions.method || "GET"} ${url}`);
}
```

Now you can see in console when requests are (or aren't) being made.

## 🧪 How to Test the Fixes

### Test 1: Corrupted localStorage
```javascript
// In browser console:
localStorage.setItem('auth-storage', '{invalid json}');
// Refresh page - should clear storage and show login
```

### Test 2: Timeout Mechanism
```javascript
// In browser console (simulate stuck validation):
const authStore = JSON.parse(localStorage.getItem('auth-storage'));
authStore.state.isValidated = false;
authStore.state.token = 'fake-token';
localStorage.setItem('auth-storage', JSON.stringify(authStore));
// Refresh page - should timeout after 15s and redirect to login
```

### Test 3: Network Failure During Validation
```bash
# Disconnect network, open app
# Should either:
# - Gracefully keep existing session (if authenticated before)
# - Or timeout and redirect to login (if not authenticated)
```

## 🚀 Prevention Strategies

### For Developers:

1. **Never manually edit localStorage** in production console
2. **Clear browser data** when switching between environments
3. **Check browser console** for auth-related warnings/errors

### For Future Development:

1. **Add Sentry logging** for auth validation failures
2. **Consider refresh token mechanism** to handle expired sessions better
3. **Add health check endpoint** for quick network validation
4. **Monitor auth flow metrics** in production

## 📊 Expected Behavior After Fixes

### Scenario 1: Corrupted localStorage
- ✅ Detected on app init
- ✅ Automatically cleared
- ✅ User redirected to login
- ✅ No infinite loading

### Scenario 2: Network Issues During Validation
- ✅ Timeout after 15 seconds
- ✅ Error message shown
- ✅ Redirect to login
- ✅ Clear console logs for debugging

### Scenario 3: Valid Token
- ✅ Normal validation flow
- ✅ Quick redirect to dashboard
- ✅ No unnecessary loading time

## 🔧 Maintenance Notes

### When to Clear localStorage in Code:

**Good:**
```typescript
// On explicit logout
clearAuth(); // This calls clearAuth in store which resets state
```

**Bad:**
```typescript
// Don't do this - bypasses store
localStorage.removeItem('auth-storage');
```

### Monitoring in Production:

Add these logs to Sentry/monitoring:
- `"Failed to parse auth storage"` - indicates corrupted data
- `"Session validation timeout"` - indicates network/backend issues
- `"Failed to rehydrate auth store"` - indicates storage corruption

## 📝 Summary

The issue was caused by **corrupted localStorage state** that prevented proper session validation. The fixes add:

1. ✅ **Automatic detection and cleanup** of corrupted storage
2. ✅ **Timeout mechanism** to prevent infinite loading
3. ✅ **Better error handling** in validation flow
4. ✅ **Improved logging** for debugging
5. ✅ **Graceful degradation** on network errors

The developer will no longer get stuck at the loading screen, and any storage corruption will be automatically resolved on app startup.

