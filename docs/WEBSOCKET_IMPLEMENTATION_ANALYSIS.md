# WebSocket Implementation Analysis

## 1. Why the `resumed` Flag is Needed

### The Problem
When a user:
1. Starts a test → Creates `TestInstance` with status "active"
2. Answers 5 questions
3. **Closes browser or refreshes page**
4. Comes back and tries to start the same test again

**Without `resumed` flag:**
- Frontend sends POST `/tests/{testId}/instances`
- Backend finds existing active instance
- Backend returns the instance
- **Frontend doesn't know if this is NEW or EXISTING**
- User doesn't see any message explaining they're continuing

**With `resumed: true` flag:**
```typescript
if (response.data.resumed) {
  toast.success("Pokračujete v rozdělaném testu"); // "You're continuing an unfinished test"
}
```

### Current Frontend Code
```typescript
// src/app/.../testy/page.tsx line 69-71
if (response.data.resumed) {
  toast.success("Pokračujete v rozdělaném testu");
}
```

### UX Impact
- ✅ **With flag:** User sees friendly message "You're continuing where you left off"
- ❌ **Without flag:** User confused why test started at question 6

### Is it Critical?
**No**, it's a UX enhancement. Test will work without it, but user experience is worse.

**Priority:** LOW - Nice to have

---

## 2. WebSocket Spec Compliance Check

### What the Spec Says (`docs/websocket-states-spec.md`)

**Required fields (ALL events):**
```json
{
  "type": "job_started" | "generating" | "complete" | "error",
  "jobId": "string (UUID)",
  "timestamp": 1234567890,
  "process": "test"
}
```

**Test Generation Events:**
1. `job_started` - Job picked from queue
2. `generating` - AI actively generating (optional `progress` field)
3. `complete` - Test ready (includes `testId`)
4. `error` - Generation failed

### What Backend Actually Does

**Events published in `GenerateTestHandler.php`:**

1. **Line 51:** `test_generation_started`
   ```php
   'type' => 'test_generation_started',
   'timestamp' => time(),
   'testId' => $message->testId
   ```
   
2. **Line 131, 145, 157, 186, 204:** `test_generation_progress`
   ```php
   'type' => 'test_generation_progress',
   'timestamp' => time(),
   'testId' => $test->getId(),
   'status' => 'loading_context' | 'preparing_prompt' | 'generating' | 'validating' | 'saving',
   'progress' => 10 | 20 | 30 | 60 | 80,
   'message' => 'Načítám kontext...' etc.
   ```

3. **Line 57:** `test_generation_completed`
   ```php
   'type' => 'test_generation_completed',
   'timestamp' => time(),
   'testId' => $message->testId
   ```

4. **Line 314:** `test_generation_failed`
   ```php
   'type' => 'test_generation_failed',
   'timestamp' => time(),
   'testId' => $testId,
   'error' => $message
   ```

### ❌ COMPLIANCE ISSUES

#### Issue 1: Event Type Names Don't Match
| **Spec Says** | **Backend Uses** | **Match?** |
|---------------|------------------|------------|
| `job_started` | `test_generation_started` | ❌ |
| `generating` | `test_generation_progress` | ❌ |
| `complete` | `test_generation_completed` | ❌ |
| `error` | `test_generation_failed` | ❌ |

#### Issue 2: Missing `jobId` Field
- **Spec requires:** `jobId` as UUID for all events
- **Backend has:** Only `testId`
- **Impact:** Can't distinguish multiple jobs for same test

#### Issue 3: Missing `process` Field
- **Spec requires:** `process: "test"` on all events
- **Backend has:** Not included
- **Impact:** Frontend can't easily filter by process type

#### Issue 4: Extra Fields Not in Spec
- Backend adds `status`, `message`, `progress` which are good extras
- But base structure doesn't match spec

### Frontend Impact

**Current frontend code (`use-test-generation.ts`) expects:**
```typescript
// Probably listening for events like:
// - "test_generation_started"
// - "test_generation_progress"
// - "test_generation_completed"
```

**If we change to spec:**
Frontend would need to listen for `job_started`, `generating`, `complete` instead.

### Options

**Option 1: Fix Backend to Match Spec** ✅ RECOMMENDED
- Change event names: `test_generation_started` → `job_started`
- Add `jobId` and `process` fields
- Keep the extra fields (`status`, `message`, `progress`)
- Benefits: Consistent across all async jobs

**Option 2: Update Spec to Match Backend**
- Change spec to use `test_generation_*` event names
- Remove `jobId` and `process` requirements
- Benefits: No backend changes needed

**Option 3: Keep Both** (NOT RECOMMENDED)
- Backend doesn't follow spec
- Each job type has different event names
- Future maintenance nightmare

### Recommended Fix

Update `GenerateTestHandler.php`:

```php
private function publishStatus(string $channel, string $type, array $data = []): void
{
    try {
        $payload = [
            'type' => $type,              // Use spec names
            'jobId' => $channel,          // Channel contains UUID
            'timestamp' => time(),
            'process' => 'test',          // Add process identifier
            ...$data                      // Merge in testId, progress, etc.
        ];

        $this->centrifugo->publish($channel, $payload);
    } catch (CentrifugoException $e) {
        // error handling
    }
}

// Then change:
$this->publishStatus($channel, 'job_started', ['testId' => $message->testId]);
$this->publishStatus($channel, 'generating', ['testId' => $test->getId(), 'progress' => 30, 'message' => '...']);
$this->publishStatus($channel, 'complete', ['testId' => $message->testId]);
$this->publishStatus($channel, 'error', ['testId' => $testId, 'error' => $message]);
```

---

## 3. Tier-Based Limits (Max 50 for Everyone)

### Your Question
> It will be 50, anything else needs to be done on backend regarding this?

### Current State

**Backend `TestGenerationDto.php` (line 13-14):**
```php
#[Assert\Range(min: 5, max: 50)]
public int $questionCount;
```

**Frontend validation:**
```typescript
// Already updated to max: 50
questionCount: z.number().int().min(5).max(50)
```

### ✅ If Max is 50 for Everyone

**Backend needs:** NOTHING! Already set to 50.

**Frontend needs:**
```typescript
// Remove tier checks in generate-test-dialog.tsx:
// DELETE THESE LINES:
if (!isPremiumUser && data.questionCount > FREE_TIER_LIMITS.MAX_TEST_QUESTIONS) {
  showPaywall("test_question_limit");
  return;
}

// KEEP:
max={50} // Simple max, no tier check
```

### ❌ If You Want Tier-Based Limits Later

Then backend needs:

```php
// TestGenerationController::create()

public function create(ApiRequest $request, ApiResponse $response): array
{
    $dto = $request->getParsedBody();
    $userId = $this->session->getId();
    
    // Get user tier
    $user = $this->userRepository->findBySessionId($userId);
    $maxQuestions = $user->isPremium() ? 50 : 15;
    
    // Check limit
    if ($dto->questionCount > $maxQuestions) {
        throw ApiException::forbidden(
            "Free users: max 15 questions. Premium: max 50.",
            "TEST_QUESTION_LIMIT"
        );
    }
    
    // ... rest of create logic
}
```

But you said **50 for everyone**, so this is **NOT NEEDED**.

---

## Summary

### 1. `resumed` Flag
**Answer:** UX enhancement for when users return to unfinished tests. Not critical, but nice to have.
**Priority:** LOW

### 2. WebSocket Spec Compliance
**Answer:** ❌ Backend does NOT follow the spec
- Event names are different
- Missing `jobId` and `process` fields
- Needs updates to match spec (or update spec to match backend)

**Priority:** MEDIUM - Works but inconsistent with spec

### 3. Tier-Based Limits
**Answer:** ✅ Backend already has `max: 50`
**Action needed:** NONE if 50 is for everyone
**Only needed if:** You want FREE (15) vs PREMIUM (50) limits

---

## Recommendations

### Immediate (Required for Launch)
1. ✅ **Tier limits:** DONE - Keep at 50 for everyone
2. 🔴 **Missing GET endpoints:** REQUIRED (blocker)

### Nice to Have (Post-Launch)
3. 🟡 **WebSocket spec compliance:** Update event names/structure
4. 🟢 **`resumed` flag:** Add for better UX

