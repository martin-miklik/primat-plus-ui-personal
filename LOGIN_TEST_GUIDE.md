# Login Page Test Guide

## 🎯 Test Overview

This guide provides step-by-step instructions to test the login functionality end-to-end.

## 🚀 Setup

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **Clear localStorage** (to ensure clean state):
   - Open browser DevTools (F12)
   - Go to Application/Storage tab
   - Clear "Local Storage" → auth-storage

3. **Navigate to login page:**
   ```
   http://localhost:3000/login
   ```

## 📋 Test Scenarios

### Test 1: Valid Credentials - Successful Login ✅

**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `Password123`
3. Optionally check "Remember me"
4. Click "Přihlásit se" (Sign In)

**Expected Results:**
- Loading state shows "Přihlašování..." during submission
- Success toast appears: "Přihlášení úspěšné"
- Redirects to dashboard page (`/`)
- User info appears in sidebar/header
- Auth state persisted in localStorage

**Verification:**
- Check DevTools → Application → Local Storage → auth-storage
- Should contain: `{ user: {...}, token: "mock_token_...", isAuthenticated: true }`

---

### Test 2: Invalid Credentials - Wrong Password ❌

**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `WrongPassword` (incorrect)
3. Click "Přihlásit se"

**Expected Results:**
- Error toast appears: "Neplatný e-mail nebo heslo"
- User stays on login page
- Form remains editable (not stuck in loading state)
- No auth data saved to localStorage

---

### Test 3: Invalid Credentials - Non-existent User ❌

**Steps:**
1. Enter email: `nonexistent@example.com`
2. Enter password: `Password123`
3. Click "Přihlásit se"

**Expected Results:**
- Error toast appears: "Neplatný e-mail nebo heslo"
- User stays on login page
- No auth data saved to localStorage

---

### Test 4: Form Validation - Invalid Email Format ⚠️

**Steps:**
1. Enter email: `invalid-email` (no @ symbol)
2. Try to focus out or submit

**Expected Results:**
- Inline error message appears below email field
- Submit button should trigger validation
- Error message: "Invalid email address"

---

### Test 5: Form Validation - Short Password ⚠️

**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `Short1` (only 6 chars, needs 8)
3. Try to submit

**Expected Results:**
- Inline error message appears below password field
- Error message: "Password must be at least 8 characters"

---

### Test 6: Submit on Enter Key ⌨️

**Steps:**
1. Enter email: `test@example.com`
2. Enter password: `Password123`
3. Press **Enter** key (don't click button)

**Expected Results:**
- Form submits (same behavior as clicking button)
- Login flow proceeds normally

---

### Test 7: Loading State During Submission ⏳

**Steps:**
1. Enter valid credentials
2. Click "Přihlásit se"
3. **Immediately** observe the UI

**Expected Results:**
- Button text changes to "Přihlašování..."
- Button becomes disabled
- Input fields become disabled
- After ~400ms delay (MSW), success flow proceeds

---

### Test 8: Remember Me Checkbox

**Steps:**
1. Check the "Zapamatovat si mě" checkbox
2. Submit with valid credentials

**Expected Results:**
- Login succeeds normally
- localStorage contains `remember: true` in the stored data

---

## 🧪 Additional Test Credentials

MSW provides these test users (all with password `Password123`):

| Email | Password | Subscription |
|-------|----------|--------------|
| `test@example.com` | `Password123` | free |
| `john@example.com` | `Password123` | premium |
| `jane@example.com` | `Password123` | free |

---

## 🔍 DevTools Inspection

### Console Output

With MSW enabled, you should see:
```
[MSW] Mocking enabled.
```

### Network Tab

Login request should show:
- **URL:** `http://localhost:3000/api/auth/login`
- **Method:** POST
- **Status:** 200 (success) or 401 (invalid credentials)
- **Response Time:** ~400ms (MSW delay)
- **Request Body:**
  ```json
  {
    "email": "test@example.com",
    "password": "Password123",
    "remember": false
  }
  ```
- **Response Body (success):**
  ```json
  {
    "data": {
      "user": {
        "id": "...",
        "email": "test@example.com",
        "name": "Test User",
        "subscription": "free",
        ...
      },
      "token": "mock_token_..."
    },
    "message": "Login successful"
  }
  ```

### localStorage

After successful login:
```json
{
  "state": {
    "user": {
      "id": "u3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e",
      "email": "test@example.com",
      "name": "Test User",
      "subscription": "free"
    },
    "token": "mock_token_u3c4d5e6-f7a8-9b0c-1d2e-3f4a5b6c7d8e_1234567890",
    "isAuthenticated": true
  }
}
```

---

## ✅ Definition of Done Checklist

- [x] Form with email + password inputs
- [x] Validation using Zod
- [x] Submit on Enter key
- [x] Error messages for incorrect credentials
- [x] Redirect to dashboard after successful login
- [x] MSW mock auth endpoint working
- [x] Session saved to auth store (localStorage)
- [x] i18n translations (Czech language)
- [x] Loading states during submission
- [x] Disabled inputs while loading
- [x] Toast notifications for success/error
- [x] Remember me checkbox functionality

---

## 🐛 Troubleshooting

### Problem: "Cannot read properties of undefined"
**Solution:** Clear localStorage and refresh the page.

### Problem: Auto-logged in immediately
**Solution:** Auto-login has been disabled. Clear localStorage if it persists.

### Problem: MSW not intercepting requests
**Solution:** 
1. Check console for "[MSW] Mocking enabled."
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Problem: No redirect after login
**Solution:**
1. Check browser console for errors
2. Verify the dashboard route exists at `/`
3. Check that useRouter is working

---

## 🎓 Implementation Details

### Files Created/Modified:

**New Files:**
- `src/app/login/page.tsx` - Login page component
- `src/lib/api/mutations/use-login.ts` - Login mutation hook

**Modified Files:**
- `messages/cs.json` - Added Czech translations for login
- `src/app/providers.tsx` - Disabled auto-login for testing

### Tech Stack Used:
- **Form:** React Hook Form + Zod validation
- **API:** TanStack Query (useMutation)
- **Mock:** MSW handlers (`/api/auth/login`)
- **State:** Zustand (auth-store)
- **i18n:** next-intl (Czech translations)
- **Toast:** Sonner
- **UI:** Custom Field API components

---

## 📝 Notes

- All MSW delays are realistic (400ms for auth)
- Error messages are fully localized in Czech
- Auth state persists across page refreshes
- Form properly disables during submission to prevent double-submits
- Validation happens both on client (Zod) and "server" (MSW)

