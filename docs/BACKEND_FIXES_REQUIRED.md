# Backend Fixes Required for Paywall

**Date:** November 24, 2025  
**Priority:** CRITICAL  
**Estimated Time:** 1 hour  
**Status:** 🔴 BLOCKING PRODUCTION

---

## Overview

Frontend has been updated to handle both current backend AND spec-compliant responses. However, **3 critical backend fixes** are required for paywall to function in production.

**Without these fixes:** Paywall will NEVER trigger, free users get unlimited access.

---

## Fix #1: Change HTTP Status Code

### 🔴 CRITICAL - BLOCKING

**Current:** Returns `403 Forbidden`  
**Required:** Return `402 Payment Required`

### Files to Update (4 files)

1. **`app/app/Api/V1/Controllers/SubjectController.php`** line 56
2. **`app/app/Api/V1/Controllers/SourceController.php`** line 43
3. **`app/app/Api/V1/Controllers/ChatController.php`** line 52
4. **`app/app/Api/V1/Controllers/FlashcardController.php`** line 66

### Change

```php
// BEFORE
throw ApiException::create()
    ->withStatusCode(403)  // ❌ WRONG
    ->withTitle('Subject limit exceeded')
    ->withErrorCode(ErrorCode::LIMIT_EXCEEDED)
    ->withContext([...]);

// AFTER
throw ApiException::create()
    ->withStatusCode(402)  // ✅ CORRECT
    ->withTitle('Subject limit exceeded')
    ->withErrorCode(ErrorCode::LIMIT_EXCEEDED)
    ->withContext([...]);
```

### Why This Matters

- Frontend checks for `402` status to trigger paywall
- `403` is treated as regular permission error
- Without this, paywall modal never opens

**Time:** 5 minutes (one-line change × 4 files)

---

## Fix #2: Add `requiresUpgrade` Flag

### 🔴 CRITICAL - BLOCKING

**Current:** Context doesn't include `requiresUpgrade` flag  
**Required:** Add `requiresUpgrade: true` to all limit error contexts

### Files to Update (same 4 files)

1. SubjectController.php
2. SourceController.php  
3. ChatController.php
4. FlashcardController.php

### Change

```php
// BEFORE
->withContext([
    'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
    'current' => $this->subscriptionLimits->getSubjectsCount($user),
    'message' => '...'
]);

// AFTER
->withContext([
    'requiresUpgrade' => true,  // ✅ ADD THIS LINE
    'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
    'current' => $this->subscriptionLimits->getSubjectsCount($user),
    'message' => '...'
]);
```

### Why This Matters

- Frontend uses this flag as additional check for paywall errors
- Helps distinguish limit errors from other errors
- Defense in depth (works even if status code is wrong)

**Time:** 5 minutes (one-line addition × 4 files)

---

## Fix #3: Use Specific Error Codes

### 🟡 HIGH PRIORITY - Not Blocking but Important

**Current:** All limits use generic `ErrorCode::LIMIT_EXCEEDED`  
**Required:** Use specific error codes per limit type

### Step 1: Add Error Codes

**File:** `app/Core/Api/Exception/ErrorCode.php` (or wherever your ErrorCode enum/class is)

```php
class ErrorCode {
    // ... existing codes ...
    
    // Paywall-specific codes
    public const SUBJECT_LIMIT_REACHED = 'SUBJECT_LIMIT_REACHED';
    public const SOURCE_LIMIT_REACHED = 'SOURCE_LIMIT_REACHED';
    public const CHAT_LIMIT_REACHED = 'CHAT_LIMIT_REACHED';
    public const FLASHCARD_LIMIT = 'FLASHCARD_LIMIT';
    public const TEST_QUESTION_LIMIT = 'TEST_QUESTION_LIMIT';
    public const FREE_PERIOD_EXPIRED = 'FREE_PERIOD_EXPIRED';
}
```

### Step 2: Update Controllers

**SubjectController.php:**
```php
->withErrorCode(ErrorCode::SUBJECT_LIMIT_REACHED);  // Instead of LIMIT_EXCEEDED
```

**SourceController.php:**
```php
->withErrorCode(ErrorCode::SOURCE_LIMIT_REACHED);
```

**ChatController.php:**
```php
->withErrorCode(ErrorCode::CHAT_LIMIT_REACHED);
```

**FlashcardController.php:**
```php
->withErrorCode(ErrorCode::FLASHCARD_LIMIT);
```

### Step 3: Update SubscriptionLimits.php

**File:** `app/app/Model/Subscription/SubscriptionLimits.php`

When checking `isFreeGracePeriodOver`, throw error with:
```php
->withErrorCode(ErrorCode::FREE_PERIOD_EXPIRED);
```

### Why This Matters

- Frontend can show **specific** paywall messages
- Better user experience: "You've reached your subject limit" vs generic "Limit exceeded"
- Better error tracking and debugging

**Time:** 30 minutes

---

## Complete Example (SubjectController)

### Before

```php
if (!$this->subscriptionLimits->canCreateSubject($user)) {
    $this->logger->logInfo("Subject creation blocked - limit exceeded", [
        'userId' => $user->getId(),
        'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
        'subscriptionType' => $user->getSubscriptionType()->value
    ]);

    throw ApiException::create()
        ->withStatusCode(403)  // ❌ WRONG
        ->withTitle('Subject limit exceeded')
        ->withErrorCode(ErrorCode::LIMIT_EXCEEDED)  // ❌ GENERIC
        ->withContext([
            'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
            'current' => $this->subscriptionLimits->getSubjectsCount($user),
            'message' => 'Free users can create up to 1 subject. Upgrade to Premium.'
            // ❌ MISSING: requiresUpgrade
        ]);
}
```

### After

```php
if (!$this->subscriptionLimits->canCreateSubject($user)) {
    $this->logger->logInfo("Subject creation blocked - limit exceeded", [
        'userId' => $user->getId(),
        'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
        'subscriptionType' => $user->getSubscriptionType()->value
    ]);

    throw ApiException::create()
        ->withStatusCode(402)  // ✅ CORRECT
        ->withTitle('Subject limit exceeded')
        ->withErrorCode(ErrorCode::SUBJECT_LIMIT_REACHED)  // ✅ SPECIFIC
        ->withContext([
            'requiresUpgrade' => true,  // ✅ ADDED
            'limit' => SubscriptionLimits::FREE_SUBJECTS_LIMIT,
            'current' => $this->subscriptionLimits->getSubjectsCount($user),
            'message' => 'Free users can create up to 1 subject. Upgrade to Premium.'
        ]);
}
```

---

## Implementation Checklist

### Priority 1: MUST DO (30 minutes)

- [ ] Change status code `403 → 402` in SubjectController
- [ ] Change status code `403 → 402` in SourceController
- [ ] Change status code `403 → 402` in ChatController
- [ ] Change status code `403 → 402` in FlashcardController
- [ ] Add `requiresUpgrade: true` to SubjectController context
- [ ] Add `requiresUpgrade: true` to SourceController context
- [ ] Add `requiresUpgrade: true` to ChatController context
- [ ] Add `requiresUpgrade: true` to FlashcardController context

**After these 8 changes, paywall will work.**

### Priority 2: SHOULD DO (30 minutes)

- [ ] Add 6 error code constants to ErrorCode class
- [ ] Update SubjectController to use SUBJECT_LIMIT_REACHED
- [ ] Update SourceController to use SOURCE_LIMIT_REACHED
- [ ] Update ChatController to use CHAT_LIMIT_REACHED
- [ ] Update FlashcardController to use FLASHCARD_LIMIT
- [ ] Add FREE_PERIOD_EXPIRED to grace period check

**After these, error messages will be specific.**

---

## Testing After Fixes

### Test as Free User

1. **Subject Limit**
   ```bash
   # Create first subject - should work
   POST /api/v1/subjects { "name": "Biology" }
   
   # Try to create second - should return 402
   POST /api/v1/subjects { "name": "Math" }
   # Expected: 402 status, requiresUpgrade: true, paywall modal opens
   ```

2. **Source Limit**
   ```bash
   # Upload first source - should work
   POST /api/v1/sources/upload
   
   # Try to upload second - should return 402
   POST /api/v1/sources/upload
   # Expected: 402 status, paywall modal opens
   ```

3. **Chat Limit**
   ```bash
   # Send messages 1, 2, 3 - should work
   # Try to send 4th message - should return 402
   POST /api/v1/chat/send
   # Expected: 402 status, paywall modal opens
   ```

4. **Flashcard Limit**
   ```bash
   # Try to generate 31 flashcards - should return 402
   POST /api/v1/sources/1/generate-flashcards { "count": 31 }
   # Expected: 402 status, paywall modal opens
   ```

### Test as Premium User

All operations should work without limits.

---

## Response Format Reference

### Current Backend Response (Wrong)

```json
{
  "title": "Subject limit exceeded",
  "code": "LIMIT_EXCEEDED",
  "context": {
    "limit": 1,
    "current": 1,
    "message": "Free users can create up to 1 subject..."
  }
}
```
**Status:** 403 ❌

### Required Backend Response (Correct)

```json
{
  "title": "Subject limit exceeded",
  "code": "SUBJECT_LIMIT_REACHED",
  "context": {
    "requiresUpgrade": true,
    "limit": 1,
    "current": 1,
    "message": "Free users can create up to 1 subject..."
  }
}
```
**Status:** 402 ✅

---

## Frontend Compatibility

✅ **Frontend already handles BOTH formats:**

- Current backend (403, generic code, no flag)
- Spec-compliant backend (402, specific codes, requiresUpgrade flag)

**This means:**
- You can deploy these backend fixes independently
- No frontend changes needed when backend is fixed
- Paywall will automatically work better as you implement fixes

---

## Summary

| Fix | Impact | Time | Status |
|-----|--------|------|--------|
| Status code 402 | CRITICAL | 5 min | 🔴 Required |
| requiresUpgrade flag | CRITICAL | 5 min | 🔴 Required |
| Specific error codes | HIGH | 30 min | 🟡 Recommended |

**Total time for critical fixes:** 10 minutes  
**Total time with recommendations:** 40 minutes

---

**Contacts:**
- Frontend: All changes complete ✅
- Backend: See checklist above ⏳
- Deploy: After Priority 1 fixes ✅

