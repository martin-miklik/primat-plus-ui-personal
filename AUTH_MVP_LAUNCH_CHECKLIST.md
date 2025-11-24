# ✅ Auth MVP Launch Checklist

## Pre-Launch Testing (Required)

### 🔴 Critical Tests (Must Pass)

#### Happy Path Flows
- [ ] **Login with valid credentials**
  - Navigate to /login
  - Enter valid name and password
  - Click "Přihlásit se"
  - ✅ Should redirect to dashboard (/)
  - ✅ Should see user name in header
  - ✅ Should see subscription type badge

- [ ] **Stay logged in on page refresh**
  - While logged in, refresh browser (F5)
  - ✅ Should stay logged in
  - ✅ Should not see loading spinner
  - ✅ Should see dashboard content immediately

- [ ] **Navigation between pages while logged in**
  - Navigate to /subjects
  - Navigate to /learn
  - Navigate to /tests
  - Navigate to /settings
  - ✅ Should stay logged in on all pages
  - ✅ Should not trigger re-authentication

- [ ] **Logout**
  - Click user dropdown in header
  - Click "Odhlásit se"
  - ✅ Should redirect to /login
  - ✅ Should clear user data from UI
  - ✅ Should clear localStorage

- [ ] **Protected route access when logged out**
  - Logout
  - Try to navigate to / (dashboard)
  - ✅ Should redirect to /login
  - ✅ Should show loading state briefly

- [ ] **Login page when already logged in**
  - While logged in, navigate to /login
  - ✅ Should redirect to / (dashboard)
  - ✅ Should show loading state briefly

---

#### Error Handling
- [ ] **Invalid credentials**
  - Enter wrong name or password
  - Click "Přihlásit se"
  - ✅ Should show error toast: "Neplatné přihlašovací údaje"
  - ✅ Should stay on /login page
  - ✅ Should NOT clear form fields
  - ✅ Should be able to retry

- [ ] **Empty form submission**
  - Leave name empty
  - Try to submit
  - ✅ Should show validation error: "Jméno je povinné"
  - [ ] Leave password empty (or < 8 chars)
  - ✅ Should show validation error: "Heslo musí obsahovat alespoň 8 znaků"

- [ ] **Network error during login**
  - Disconnect from internet (or block API)
  - Try to login
  - ✅ Should show network error message
  - ✅ Should not break UI
  - Reconnect and retry
  - ✅ Should work after reconnection

---

#### Edge Cases
- [ ] **Multiple tabs - logout**
  - Open app in two browser tabs
  - Logout in tab 1
  - Navigate/refresh in tab 2
  - ✅ Tab 2 should detect logout and redirect to /login
  - ✅ Should not show stale user data

- [ ] **Browser close and reopen**
  - Login to app
  - Close browser completely
  - Reopen browser
  - Navigate to app
  - ✅ Should still be logged in
  - ✅ Should load user data from localStorage

- [ ] **Manual localStorage clear**
  - Login to app
  - Open DevTools → Application → Local Storage
  - Delete "auth-storage" key
  - Refresh page
  - ✅ Should redirect to /login
  - ✅ Should not crash

- [ ] **User with null email**
  - Login as user with email = null (if possible)
  - Check user dropdown in header
  - ✅ Should show name or nickname instead
  - ✅ Should not show blank space

- [ ] **User with null name**
  - Login as user with name = null (if possible)
  - Check header
  - ✅ Should show nickname instead
  - ✅ Should not show blank space

---

### 🟡 Important Tests (Should Pass)

#### Session Management
- [ ] **SessionMonitor is running**
  - Login to app
  - Open browser console (F12)
  - Wait a few minutes
  - ✅ Should see logs every 5 minutes (if enabled)
  - ✅ Should not see errors in console

- [ ] **Token expiration handling** (Hard to test without waiting)
  - Option A: Wait 24 hours after login
  - Option B: Manually set tokenExpiresAt in localStorage to past time
  - Trigger any API call
  - ✅ Should redirect to /login
  - ✅ Should show appropriate message

- [ ] **API calls include Authorization header**
  - Login to app
  - Open Network tab in DevTools
  - Make any API call (navigate to /subjects)
  - Check request headers
  - ✅ Should see: `Authorization: Bearer eyJ...`

---

#### UI/UX
- [ ] **Loading states**
  - Login page should show "Přihlašování..." while logging in
  - Protected pages should show spinner while validating session
  - ✅ No infinite loading states
  - ✅ No white flashes

- [ ] **User dropdown displays correctly**
  - User avatar shows initials
  - User name/nickname displayed
  - Email or fallback displayed
  - Subscription badge shows (Premium/Free)
  - Logout button visible

- [ ] **No "Remember me" checkbox**
  - Check login form
  - ✅ Should NOT see "Zapamatovat si mě" checkbox
  - ✅ Form should have only name, password, submit button

---

### 🟢 Nice to Have Tests (Optional but Recommended)

- [ ] **Different subscription types display correctly**
  - Login as free user → See "Základní" or "Free"
  - Login as premium user → See "Premium"
  - Login as trial user → See "Zkušební" or "Trial"

- [ ] **Multiple failed login attempts**
  - Try wrong password 5+ times
  - ✅ Should still allow attempts (no lockout at MVP)
  - Note: Backend rate limiting should be added post-MVP

- [ ] **Very long user names**
  - Login as user with very long name (50+ chars)
  - ✅ Should truncate in header
  - ✅ Should not break layout

- [ ] **Special characters in credentials**
  - Try name with accents: "Lukáš Černý"
  - Try password with symbols: "P@ssw0rd!2025"
  - ✅ Should work correctly

---

## Backend Verification

### 🔴 Critical Backend Checks

- [ ] **POST /api/v1/auth/login endpoint works**
  ```bash
  curl -X POST http://your-api.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"login":"testuser","password":"Password123"}'
  ```
  ✅ Should return 200 with { data: { accessToken, user } }

- [ ] **GET /api/v1/auth/me endpoint works**
  ```bash
  curl http://your-api.com/api/v1/auth/me \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
  ```
  ✅ Should return 200 with { data: { ...user } }

- [ ] **Invalid token returns 401**
  ```bash
  curl http://your-api.com/api/v1/auth/me \
    -H "Authorization: Bearer invalid_token"
  ```
  ✅ Should return 401 Unauthorized

- [ ] **User object includes subscriptionType**
  ✅ Response should have: `"subscriptionType": "free"|"premium"|"trial"`

- [ ] **JWT tokens expire after 24 hours**
  - Check JWT configuration
  - ✅ TTL should be 86400 seconds (24 hours)

- [ ] **CORS configured correctly**
  - Frontend should be able to make requests
  - ✅ Should include `credentials: 'include'` support
  - ✅ Should allow Authorization header

---

### 🟡 Backend Security Checks

- [ ] **JWT secret is secure**
  - ✅ Not hardcoded in repository
  - ✅ Stored in environment variable
  - ✅ At least 32 characters long

- [ ] **Password validation on backend**
  - Try to login with password < 8 chars
  - ✅ Should reject with appropriate error

- [ ] **SQL injection prevention**
  - ✅ Using parameterized queries (should be default in modern frameworks)

- [ ] **Failed login logging**
  - Make failed login attempt
  - Check backend logs
  - ✅ Should log failed attempt with IP and timestamp (optional for MVP)

---

## Environment Checks

### 🔴 Critical Environment Variables

- [ ] **Frontend (.env.local or deployment)**
  ```bash
  NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1
  NEXT_PUBLIC_ENABLE_MSW=false  # Should be false in production
  ```

- [ ] **Backend (Laravel/PHP .env)**
  ```bash
  JWT_SECRET=your-very-secure-secret-key-here
  JWT_TTL=86400
  APP_ENV=production
  APP_DEBUG=false
  ```

---

## Deployment Checks

### 🔴 Critical Deployment Tasks

- [ ] **Build passes without errors**
  ```bash
  npm run build
  ```
  ✅ Should complete successfully
  ✅ No TypeScript errors
  ✅ No linting errors

- [ ] **Production bundle size reasonable**
  - Check build output
  - ✅ First Load JS should be < 200KB for main page

- [ ] **Environment variables set in hosting**
  - Vercel/Netlify/etc. should have correct env vars
  - ✅ `NEXT_PUBLIC_API_BASE_URL` points to production backend
  - ✅ `NEXT_PUBLIC_ENABLE_MSW=false` in production

- [ ] **HTTPS enabled**
  - ✅ Frontend uses HTTPS
  - ✅ Backend API uses HTTPS
  - ✅ No mixed content warnings

- [ ] **API reachable from frontend domain**
  - Test in browser
  - ✅ No CORS errors
  - ✅ No SSL certificate errors

---

## Post-Launch Monitoring

### 🟡 Things to Monitor (First 48 Hours)

- [ ] **Error rate in frontend**
  - Check browser console errors
  - Check error tracking (Sentry/etc.)
  - ✅ Should be < 1% error rate

- [ ] **Failed login rate**
  - Check backend logs
  - ✅ Should be mostly invalid credentials, not system errors

- [ ] **Session validation success rate**
  - Check /auth/me endpoint logs
  - ✅ Should be mostly 200s, not 401s (unless token expired)

- [ ] **User complaints**
  - Monitor support channels
  - Common issues: can't login, logged out unexpectedly
  - ✅ No widespread issues

- [ ] **Performance**
  - Check login time (should be < 2 seconds)
  - Check page load time after login (should be < 3 seconds)
  - ✅ No timeout errors

---

## Known Limitations (Document for Users)

### Expected Behavior
- ✅ Users stay logged in for 24 hours
- ✅ After 24 hours, must login again
- ✅ Logout is client-side only (token still valid on backend until expiry)
- ✅ No "Remember me" option (all users get persistent sessions)
- ✅ No password reset flow yet (post-MVP)
- ✅ No email verification yet (post-MVP)
- ✅ No 2FA yet (post-MVP)

---

## Rollback Plan

### If Critical Issues Found After Launch

1. **Frontend issues:**
   - Revert to previous deployment
   - Check Vercel/Netlify deployment history
   - Restore previous commit

2. **Backend issues:**
   - Revert auth endpoints
   - Check database migrations
   - Restore from backup if needed

3. **Communication:**
   - Notify users of temporary login issues
   - Provide ETA for fix
   - Consider maintenance mode page

---

## Sign-off

### Before Launch
- [ ] Frontend lead reviewed and tested ✅
- [ ] Backend lead reviewed and tested ✅
- [ ] Product owner approved ✅
- [ ] All critical tests passed ✅
- [ ] Documentation updated ✅
- [ ] Rollback plan ready ✅

### Launch Decision
- [ ] **GO FOR LAUNCH** 🚀
- [ ] **WAIT - Issues found** ⏸️

**Launched by:** _______________  
**Launch date:** _______________  
**Launch time:** _______________

---

## Post-Launch Notes

### Issues Found
```
Date: _______
Issue: _______
Severity: _______
Resolution: _______
```

### User Feedback
```
Date: _______
Feedback: _______
Action: _______
```

---

**Last Updated:** 2025-11-24  
**Version:** MVP 1.0  
**Status:** Ready for launch checklist execution

