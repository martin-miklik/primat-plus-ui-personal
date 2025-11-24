# 🔧 Backend Auth Recommendations

## Overview
This document provides backend development recommendations for the authentication system based on frontend implementation review.

---

## ✅ Current Backend Implementation (Working)

### Endpoints Available
1. **POST /api/v1/auth/login**
   - ✅ Accepts `{ login: string, password: string }`
   - ✅ Returns `{ data: { accessToken: string, user: User } }`
   - ✅ JWT token with 24-hour expiration
   - ✅ User object includes subscriptionType

2. **GET /api/v1/auth/me**
   - ✅ Requires Authorization: Bearer {token}
   - ✅ Validates JWT token
   - ✅ Returns User object
   - ✅ Returns 401 for invalid/expired tokens

### User Object Structure (Correct)
```typescript
{
  id: number,
  email: string | null,
  name: string | null,
  nickname: string | null,
  externalId: string | null,
  subscriptionType: "free" | "premium" | "trial",
  subscriptionExpiresAt: string | null,
  hasActiveSubscription?: boolean,
  createdAt: string | null,
  updatedAt: string | null
}
```

---

## 🔴 Critical Issues to Address

### 1. Token Expiration in Response
**Issue**: Frontend doesn't receive actual token expiration time  
**Current**: Frontend hardcodes 24h expiration  
**Risk**: Mismatch if backend changes JWT TTL

**Recommendation**: Add `expiresIn` or `expiresAt` to login response

```json
// Current
{
  "data": {
    "accessToken": "eyJ...",
    "user": { ... }
  }
}

// Recommended
{
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 86400,  // seconds (or use expiresAt with ISO timestamp)
    "user": { ... }
  }
}
```

**Frontend Changes Required:**
```typescript
// src/stores/auth-store.ts - setAuth()
setAuth: (user, token, expiresIn) => {
  const expiresAt = Date.now() + expiresIn * 1000;
  // ... rest of logic
}
```

---

### 2. User Email Nullability
**Issue**: Frontend schema allows `email: null` but displays it without fallback  
**Current**: email can be null in database  
**Status**: ✅ Fixed in frontend (added fallback)

**Backend Recommendation**: Clarify business rules:
- Should email always be required?
- Or is nullable email intentional (for OAuth social login)?

**If email is required:**
```php
// Validate during user creation/update
if (empty($user->email)) {
    throw new ValidationException('Email is required');
}
```

**If nullable is intentional:**
- No backend changes needed
- Frontend now handles this correctly

---

### 3. Token Refresh Mechanism
**Issue**: No refresh token support  
**Current**: User must re-login after 24 hours  
**Impact**: Poor UX for active users

**Recommendation**: Implement refresh tokens (Post-MVP)

```php
// New endpoint: POST /api/v1/auth/refresh
public function refresh(Request $request): JsonResponse
{
    $refreshToken = $request->input('refreshToken');
    
    // Validate refresh token (check DB, expiry, etc.)
    $userId = $this->validateRefreshToken($refreshToken);
    
    if (!$userId) {
        return response()->json(['error' => 'Invalid refresh token'], 401);
    }
    
    $user = User::find($userId);
    
    // Generate new access token (short-lived: 15 min)
    $accessToken = $this->jwtService->generate($user, 900);
    
    // Optionally rotate refresh token
    $newRefreshToken = $this->generateRefreshToken($user);
    
    return response()->json([
        'data' => [
            'accessToken' => $accessToken,
            'refreshToken' => $newRefreshToken,
            'expiresIn' => 900
        ]
    ]);
}
```

**Database Changes:**
```sql
CREATE TABLE refresh_tokens (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NULL,
    revoked_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🟡 Security Enhancements (Post-MVP)

### 1. Rate Limiting on /auth/login
**Issue**: No protection against brute force attacks  
**Recommendation**: Implement rate limiting

```php
// Middleware or in controller
use Illuminate\Support\Facades\RateLimiter;

public function login(Request $request): JsonResponse
{
    $key = 'login-attempt:' . $request->ip();
    
    if (RateLimiter::tooManyAttempts($key, 5)) {
        $seconds = RateLimiter::availableIn($key);
        return response()->json([
            'error' => "Too many login attempts. Try again in {$seconds} seconds."
        ], 429);
    }
    
    // ... existing login logic
    
    // If login fails
    RateLimiter::hit($key, 300); // 5 minute lockout
    
    // If login succeeds
    RateLimiter::clear($key);
}
```

---

### 2. Failed Login Tracking
**Issue**: No monitoring of failed login attempts  
**Recommendation**: Log failed attempts for security monitoring

```php
// Log failed attempts
if (!$this->validateCredentials($login, $password)) {
    $this->logFailedAttempt($request->ip(), $login);
    
    return response()->json([
        'error' => ['code' => 401, 'title' => 'Unauthorized', 'detail' => 'Invalid credentials']
    ], 401);
}
```

---

### 3. Account Lockout After N Failed Attempts
**Recommendation**: Lock account after X failed attempts

```php
// Check if account is locked
$lockoutKey = "account-lockout:{$login}";
$failedAttempts = Cache::get($lockoutKey, 0);

if ($failedAttempts >= 10) {
    return response()->json([
        'error' => 'Account temporarily locked. Contact support.'
    ], 403);
}

// After failed login
Cache::increment($lockoutKey);
Cache::put($lockoutKey, $failedAttempts + 1, now()->addHours(1));
```

---

### 4. JWT Secret Management
**Issue**: JWT secret should not be hardcoded  
**Recommendation**: Use environment variables

```php
// config/jwt.php
return [
    'secret' => env('JWT_SECRET'),
    'ttl' => env('JWT_TTL', 86400), // Default 24 hours
    'algorithm' => 'HS256',
];

// .env
JWT_SECRET=your-very-long-random-secret-key-here
JWT_TTL=86400
```

**Generate strong secret:**
```bash
php -r "echo base64_encode(random_bytes(64));"
```

---

### 5. Token Revocation / Blacklist
**Issue**: No way to invalidate tokens before expiration  
**Use Cases**: 
- User logs out
- Password change
- Security breach
- Admin deactivates account

**Recommendation**: Implement token blacklist

```php
// Database
CREATE TABLE token_blacklist (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token_id VARCHAR(255) NOT NULL UNIQUE, // jti claim from JWT
    revoked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    INDEX idx_token_id (token_id)
);

// Middleware check
public function checkBlacklist(string $tokenId): bool
{
    return DB::table('token_blacklist')
        ->where('token_id', $tokenId)
        ->exists();
}
```

---

## 🟢 Feature Enhancements (Future)

### 1. Remember Me Implementation
**Current**: Frontend removed "remember me" checkbox  
**Future**: Can be re-added with backend support

**Implementation:**
```php
public function login(Request $request): JsonResponse
{
    $remember = $request->input('remember', false);
    
    // Short session: 24 hours
    // Long session: 30 days
    $ttl = $remember ? (30 * 86400) : 86400;
    
    $accessToken = $this->jwtService->generate($user, $ttl);
    
    return response()->json([
        'data' => [
            'accessToken' => $accessToken,
            'expiresIn' => $ttl,
            'user' => $user
        ]
    ]);
}
```

---

### 2. Session Management Dashboard
**Feature**: Allow users to see active sessions and revoke them

**Endpoints:**
```php
// GET /api/v1/auth/sessions - List active sessions
// DELETE /api/v1/auth/sessions/{id} - Revoke specific session
// DELETE /api/v1/auth/sessions/all - Revoke all sessions except current
```

**Database:**
```sql
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    token_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_token_id (token_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 3. OAuth / Social Login Support
**Feature**: Login with Google, Facebook, GitHub, etc.

**Endpoints:**
```php
GET  /api/v1/auth/oauth/{provider}/redirect  // Redirect to OAuth provider
GET  /api/v1/auth/oauth/{provider}/callback  // Handle OAuth callback
POST /api/v1/auth/oauth/{provider}/token     // Exchange OAuth token for JWT
```

**User Table Enhancement:**
```sql
ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) NULL;
ALTER TABLE users ADD UNIQUE KEY idx_oauth_provider_id (oauth_provider, oauth_id);
```

---

### 4. Two-Factor Authentication (2FA)
**Feature**: Optional 2FA with TOTP (Google Authenticator)

**Endpoints:**
```php
POST /api/v1/auth/2fa/setup      // Generate QR code
POST /api/v1/auth/2fa/verify     // Verify and enable 2FA
POST /api/v1/auth/2fa/disable    // Disable 2FA
POST /api/v1/auth/login/2fa      // Second step of login with 2FA code
```

**User Table Enhancement:**
```sql
ALTER TABLE users ADD COLUMN two_factor_secret VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN two_factor_recovery_codes TEXT NULL;
```

---

## 📋 Migration Priority

### Phase 1: MVP Launch (Required)
- [x] POST /api/v1/auth/login
- [x] GET /api/v1/auth/me
- [x] JWT token generation
- [x] User object with subscriptionType

### Phase 2: Immediate Post-MVP (Week 1-2)
- [ ] Add `expiresIn` to login response
- [ ] Implement rate limiting on /auth/login
- [ ] Move JWT secret to environment variables
- [ ] Add failed login attempt logging

### Phase 3: Short-term (Month 1)
- [ ] Implement refresh tokens
- [ ] Add token blacklist for logout
- [ ] Implement account lockout after failed attempts
- [ ] Add security monitoring dashboard

### Phase 4: Medium-term (Month 2-3)
- [ ] "Remember me" functionality
- [ ] Session management for users
- [ ] Password reset flow
- [ ] Email verification

### Phase 5: Long-term (Month 4+)
- [ ] OAuth / Social login
- [ ] Two-factor authentication
- [ ] Single Sign-On (SSO)
- [ ] Advanced security features (device fingerprinting, etc.)

---

## 🔍 Testing Recommendations

### Unit Tests
```php
class AuthControllerTest extends TestCase
{
    public function test_login_with_valid_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'test@example.com',
            'password' => 'Password123'
        ]);
        
        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['accessToken', 'user']
            ]);
    }
    
    public function test_login_with_invalid_credentials()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'login' => 'test@example.com',
            'password' => 'WrongPassword'
        ]);
        
        $response->assertStatus(401);
    }
    
    public function test_me_endpoint_with_valid_token()
    {
        $user = User::factory()->create();
        $token = $this->generateTokenFor($user);
        
        $response = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$token}"
        ]);
        
        $response->assertStatus(200)
            ->assertJson(['id' => $user->id]);
    }
    
    public function test_me_endpoint_with_expired_token()
    {
        $expiredToken = $this->generateExpiredToken();
        
        $response = $this->getJson('/api/v1/auth/me', [
            'Authorization' => "Bearer {$expiredToken}"
        ]);
        
        $response->assertStatus(401);
    }
}
```

---

## 📞 API Contract Documentation

### POST /api/v1/auth/login

**Request:**
```json
{
  "login": "user@example.com",
  "password": "Password123"
}
```

**Success Response (200):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "nickname": "johnny",
      "externalId": "ext_123",
      "subscriptionType": "premium",
      "subscriptionExpiresAt": "2025-12-31T23:59:59Z",
      "hasActiveSubscription": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-11-24T10:30:00Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "error": {
    "code": 401,
    "title": "Unauthorized",
    "detail": "Invalid credentials"
  }
}
```

---

### GET /api/v1/auth/me

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "nickname": "johnny",
    "externalId": "ext_123",
    "subscriptionType": "premium",
    "subscriptionExpiresAt": "2025-12-31T23:59:59Z",
    "hasActiveSubscription": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-11-24T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "error": {
    "code": 401,
    "title": "Unauthorized",
    "detail": "Invalid or expired token"
  }
}
```

---

## 🎯 Summary

### Current Status: ✅ Production Ready (MVP)
Your backend auth implementation is solid for MVP launch. The core functionality works correctly.

### Top 3 Priorities After MVP:
1. **Add `expiresIn` to login response** (prevents frontend/backend TTL mismatch)
2. **Implement rate limiting** (prevents brute force attacks)
3. **Add refresh tokens** (improves UX for long sessions)

### Questions for Backend Team:
1. Is email always required, or can it be null? (affects validation)
2. What's the current JWT secret management strategy?
3. Are failed login attempts being logged anywhere?
4. Is there monitoring for suspicious login patterns?

---

**Last Updated:** 2025-11-24  
**Status:** Backend working correctly, recommendations for post-MVP  
**Contact:** Frontend team for integration questions

