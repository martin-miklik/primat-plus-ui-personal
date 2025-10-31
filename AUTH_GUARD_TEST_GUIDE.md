# 🧪 AuthGuard Testing Guide

## 📋 Overview

Comprehensive testing guide for the authentication guard system. Follow these scenarios to verify all authentication flows work correctly.

---

## 🚀 Prerequisites

1. **Start dev server:**
   ```bash
   pnpm dev
   ```

2. **Verify MSW is enabled:**
   - Open browser console
   - Should see: `[MSW] Mocking enabled.`

3. **Open DevTools:**
   - F12 or Right-click → Inspect
   - Keep Console and Application tabs handy

---

## ✅ Test Scenarios

### Scenario 1: Unauthenticated User Access

**Goal:** Verify unauthenticated users cannot access protected routes

**Steps:**
1. Clear localStorage: 
   ```js
   localStorage.clear()
   ```
2. Navigate to `http://localhost:3000/`

**Expected Results:**
- ✅ See loading spinner with "Kontrola autentizace..."
- ✅ After ~200ms, redirect to `/login`
- ✅ Login form visible
- ✅ No dashboard content shown

**Verify:**
- Console shows no errors
- URL is `/login`
- localStorage is empty

---

### Scenario 2: Successful Login Flow

**Goal:** Verify users can log in and access dashboard

**Steps:**
1. At `/login`, enter credentials:
   - Email: `test@example.com`
   - Password: `Password123`
2. Click "Přihlásit se"

**Expected Results:**
- ✅ Button shows "Přihlašování..." during submission
- ✅ Success toast: "Přihlášení úspěšné"
- ✅ Redirect to `/` (dashboard)
- ✅ Dashboard content visible
- ✅ User name in header dropdown

**Verify:**
- Check localStorage → auth-storage:
  ```json
  {
    "state": {
      "user": { "email": "test@example.com", ...},
      "token": "mock_token_...",
      "isAuthenticated": true,
      "isValidated": true,
      "isLoading": false
    }
  }
  ```
- Network tab shows:
  - POST /api/auth/login → 200
  - Response has user + token

---

### Scenario 3: Already Logged In - Visit Login Page

**Goal:** Verify authenticated users can't see login page

**Steps:**
1. After successful login (from Scenario 2)
2. Navigate to `http://localhost:3000/login`

**Expected Results:**
- ✅ Brief loading spinner
- ✅ Immediate redirect to `/`
- ✅ Dashboard shown, not login form

**Verify:**
- URL changes from `/login` → `/`
- No login form visible
- GuestGuard working correctly

---

### Scenario 4: Page Refresh - Session Persists

**Goal:** Verify session survives page refresh

**Steps:**
1. Login successfully
2. Navigate to `/subjects`
3. Press F5 (refresh page)

**Expected Results:**
- ✅ Brief loading spinner
- ✅ GET /api/auth/me called with Bearer token
- ✅ Stay on `/subjects` after validation
- ✅ User still logged in
- ✅ No redirect

**Verify:**
- Network tab shows:
  - GET /api/auth/me → 200
  - Authorization header present
- Console shows no errors
- isValidated flag set to true

---

### Scenario 5: Manual localStorage Clear

**Goal:** Verify clearing storage logs user out

**Steps:**
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Right-click `auth-storage` → Delete
4. Navigate to any protected route (e.g., `/`)

**Expected Results:**
- ✅ Loading spinner
- ✅ No API call (no token to validate)
- ✅ Redirect to `/login`
- ✅ User logged out

**Verify:**
- No token in localStorage
- isAuthenticated = false
- URL is `/login`

---

### Scenario 6: Invalid Token Format

**Goal:** Verify system handles corrupted tokens

**Steps:**
1. Login successfully
2. Open DevTools → Application → Local Storage → auth-storage
3. Edit state → Change token to: `"token": "invalid-token-format"`
4. Refresh page

**Expected Results:**
- ✅ Loading spinner
- ✅ GET /api/auth/me → 401 INVALID_TOKEN
- ✅ Auth cleared automatically
- ✅ Redirect to `/login`

**Verify:**
- Console shows: "Session validation error"
- localStorage cleared
- Network tab: 401 response

---

### Scenario 7: Expired Token (Simulated)

**Goal:** Verify token expiration handling

**Steps:**
1. Login successfully
2. Open DevTools → Application → Local Storage
3. Get current token from auth-storage
4. Modify timestamp to 25 hours ago:
   ```js
   // In console:
   const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000);
   const oldToken = `mock_token_u3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e_${oldTimestamp}`;
   const storage = JSON.parse(localStorage.getItem('auth-storage'));
   storage.state.token = oldToken;
   localStorage.setItem('auth-storage', JSON.stringify(storage));
   ```
5. Refresh page

**Expected Results:**
- ✅ Loading spinner
- ✅ GET /api/auth/me → 401 TOKEN_EXPIRED
- ✅ Auth cleared
- ✅ Redirect to `/login`

**Verify:**
- MSW handler checks timestamp correctly
- 401 response in network tab
- Error: "Token expired"

---

### Scenario 8: User Logout

**Goal:** Verify logout clears session

**Steps:**
1. Login successfully
2. Click user avatar/name in header
3. Click "Odhlásit se" (Logout)

**Expected Results:**
- ✅ Auth cleared immediately
- ✅ Redirect to `/login`
- ✅ localStorage cleared
- ✅ Login form shown

**Verify:**
- localStorage → auth-storage removed or cleared
- isAuthenticated = false
- URL is `/login`

---

### Scenario 9: Network Error During Validation

**Goal:** Verify graceful handling of network failures

**Steps:**
1. Login successfully
2. Open DevTools → Network tab
3. Enable "Offline" mode
4. Refresh page

**Expected Results:**
- ✅ Loading spinner
- ✅ GET /api/auth/me fails (network error)
- ✅ **User stays logged in** (graceful degradation)
- ✅ Error logged to console
- ✅ Dashboard still accessible

**Verify:**
- Console: "Session validation error"
- User NOT logged out
- Can still navigate
- Disable offline mode to restore

---

### Scenario 10: Multiple Tab Sync

**Goal:** Verify auth state syncs across tabs

**Steps:**
1. Login in Tab 1
2. Open Tab 2 → Navigate to `/`
3. Logout in Tab 1
4. Refresh Tab 2

**Expected Results:**
- ✅ Tab 2 initially shows dashboard (uses localStorage)
- ✅ After refresh, Tab 2 redirects to `/login`
- ✅ Both tabs in sync

**Note:** Real-time sync between tabs requires additional implementation (localStorage events)

---

### Scenario 11: Direct Link to Protected Page

**Goal:** Verify deep links work for unauthenticated users

**Steps:**
1. Clear localStorage
2. Navigate directly to `http://localhost:3000/subjects`

**Expected Results:**
- ✅ Loading spinner
- ✅ Redirect to `/login`
- ✅ No subjects page shown

**Future Enhancement:** Store `/subjects` as intended destination, redirect there after login

---

### Scenario 12: Invalid Credentials

**Goal:** Verify error handling for wrong password

**Steps:**
1. At `/login`, enter:
   - Email: `test@example.com`
   - Password: `WrongPassword123`
2. Click "Přihlásit se"

**Expected Results:**
- ✅ POST /api/auth/login → 401
- ✅ Error toast: "Neplatný e-mail nebo heslo"
- ✅ Stay on `/login`
- ✅ Form still editable
- ✅ No auth data saved

**Verify:**
- localStorage still empty
- isAuthenticated = false
- Network: 401 INVALID_CREDENTIALS

---

## 📊 Test Results Checklist

Use this checklist to track test completion:

- [ ] ✅ Scenario 1: Unauthenticated user redirected
- [ ] ✅ Scenario 2: Login flow works
- [ ] ✅ Scenario 3: Logged-in user can't see login
- [ ] ✅ Scenario 4: Session persists on refresh
- [ ] ✅ Scenario 5: Clearing storage logs out
- [ ] ✅ Scenario 6: Invalid token handled
- [ ] ✅ Scenario 7: Expired token handled
- [ ] ✅ Scenario 8: Logout works
- [ ] ✅ Scenario 9: Network errors handled gracefully
- [ ] ✅ Scenario 10: Multi-tab behavior verified
- [ ] ✅ Scenario 11: Deep links protected
- [ ] ✅ Scenario 12: Invalid credentials rejected

---

## 🐛 Common Issues & Fixes

### Issue: Stuck in infinite redirect loop
**Fix:**
```js
localStorage.clear();
location.reload();
```

### Issue: MSW not intercepting requests
**Fix:**
1. Check console for "[MSW] Mocking enabled."
2. Restart dev server: `pnpm dev`
3. Hard refresh: Ctrl+Shift+R

### Issue: Loading spinner forever
**Fix:**
1. Check console for errors
2. Verify token format in localStorage
3. Clear auth-storage and try again

### Issue: 404 on /api/auth/login
**Fix:** Already fixed! Endpoint should be `/auth/login` (API_BASE_URL adds /api)

---

## 🔍 Debug Tools

### View Auth State in Console
```js
// Get current auth state
const auth = JSON.parse(localStorage.getItem('auth-storage'));
console.log(auth.state);
```

### Manually Set Auth
```js
// For testing only!
const testAuth = {
  state: {
    user: { id: "test", email: "test@example.com", name: "Test" },
    token: `mock_token_test_${Date.now()}`,
    isAuthenticated: true,
    isValidated: true,
    isLoading: false
  }
};
localStorage.setItem('auth-storage', JSON.stringify(testAuth));
location.reload();
```

### Clear Auth
```js
localStorage.removeItem('auth-storage');
location.reload();
```

---

## 📈 Performance Benchmarks

Expected timing:
- Initial load (unauthenticated): ~0-50ms → redirect
- Initial load (authenticated): ~200ms validation
- Login submission: ~400ms
- Logout: ~0ms (instant)
- Page navigation (auth): 0ms (no re-validation)

---

## ✅ Success Criteria

All tests pass if:
1. ✅ Unauthenticated users cannot access dashboard
2. ✅ Login flow works smoothly
3. ✅ Authenticated users cannot see login page
4. ✅ Sessions persist across refreshes
5. ✅ Invalid/expired tokens handled correctly
6. ✅ Logout clears all state
7. ✅ Loading states shown appropriately
8. ✅ No content flashing
9. ✅ Network errors handled gracefully
10. ✅ No console errors during happy path

---

**Happy Testing! 🎉**

For implementation details, see `AUTH_GUARD_IMPLEMENTATION_COMPLETE.md`

