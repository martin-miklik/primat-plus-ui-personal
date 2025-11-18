# Quick Answers to Your Questions

## 1. Why do we need the `resumed` flag?

### Short Answer
**It's a UX enhancement** - tells users they're continuing an unfinished test.

### The Scenario
1. User starts test (creates TestInstance with status "active")
2. Answers 5 out of 15 questions
3. **Browser crashes / user refreshes page** 
4. User returns and clicks "Start Test" again

### Without `resumed` Flag
- Backend finds existing active instance and returns it
- User sees test starting at question 6
- **User is confused:** "Why did it skip to question 6?"
- No explanation provided

### With `resumed` Flag
```typescript
// Frontend code (already implemented):
if (response.data.resumed) {
  toast.success("Pokračujete v rozdělaném testu");
  // "You're continuing an unfinished test"
}
```

User sees friendly message explaining the situation. ✅

### Priority
**LOW** - Nice to have, not critical. Test works fine without it.

---

## 2. Did backend follow the WebSocket spec?

### Short Answer
**❌ No, event names and structure are different**

But it WORKS - just inconsistent with the spec document.

### Detailed Comparison

**Spec says (`docs/websocket-states-spec.md`):**
```json
{
  "type": "job_started",
  "jobId": "uuid",
  "timestamp": 1234567890,
  "process": "test"
}
```

**Backend actually sends:**
```json
{
  "type": "test_generation_started",
  "timestamp": 1234567890,
  "testId": 123
  // Missing: jobId, process
}
```

### All Differences

| Spec Event | Backend Event | Match? |
|------------|---------------|--------|
| `job_started` | `test_generation_started` | ❌ |
| `generating` | `test_generation_progress` | ❌ |
| `complete` | `test_generation_completed` | ❌ |
| `error` | `test_generation_failed` | ❌ |

**Missing fields:**
- `jobId` (spec required)
- `process` (spec required)

**Extra fields (good!):**
- `status`, `message`, `progress` (helpful for UX)

### Does It Work?
**Yes!** ✅ Backend publishes events, they just have different names.

Frontend needs to listen for:
- `test_generation_started`
- `test_generation_progress` 
- `test_generation_completed`
- `test_generation_failed`

Instead of spec's names.

### Should You Fix It?
**Optional - POST-LAUNCH**

**Pros of fixing:**
- Consistent with spec
- Easier for future developers
- Standardized across all async jobs

**Cons:**
- Takes 30 min backend dev time
- Works fine as-is
- Not blocking launch

**Recommendation:** Ship it now, fix naming post-launch if you want consistency.

---

## 3. Tier-based limits - Max 50 for everyone, anything else needed?

### Short Answer
**✅ Nothing needed!** Backend already has `max: 50`.

### Current State

**Backend (`TestGenerationDto.php`):**
```php
#[Assert\Range(min: 5, max: 50)]
public int $questionCount;
```

**Frontend (`test.ts`):**
```typescript
questionCount: z.number().int().min(5).max(50)
```

Both already enforce max 50. ✅

### If You Want Tier-Based (FREE vs PREMIUM)

**Example: FREE = 15, PREMIUM = 50**

Backend would need:
```php
public function create(ApiRequest $request): array {
    $user = $this->userRepository->find($userId);
    $maxQuestions = $user->isPremium() ? 50 : 15;
    
    if ($dto->questionCount > $maxQuestions) {
        throw ApiException::forbidden(
            "Free users: max 15. Premium: max 50.",
            "TEST_QUESTION_LIMIT"
        );
    }
}
```

Frontend already has the paywall check for this!

### Your Case: 50 for Everyone
**Backend:** ✅ DONE (already at 50)
**Frontend:** ✅ DONE (already at 50)
**Action needed:** ❌ NONE

---

## Summary

| Question | Answer | Priority |
|----------|--------|----------|
| **1. Resumed flag?** | UX enhancement for user feedback | LOW |
| **2. WebSocket spec?** | No, different names. Works anyway. | LOW (post-launch) |
| **3. Tier limits (50)?** | Already done, nothing needed! | ✅ DONE |

---

## What Actually Blocks Launch?

**Only one thing:** 🔴 **4 missing GET endpoints**

1. `GET /api/v1/sources/{sourceId}/tests` - List tests
2. `GET /api/v1/instances/{instanceId}` - Get instance
3. `GET /api/v1/instances/{instanceId}/results` - Get results  
4. `GET /api/v1/tests/{testId}` - Get test (optional)

**Estimated time:** 2-3 hours
**Code examples:** See `BACKEND_FRONTEND_SYNC_ANALYSIS.md` section "💡 BACKEND IMPLEMENTATION GUIDE"

Everything else is either:
- ✅ Already done
- 🟡 Nice to have (post-launch)
- ⚪ Not needed

---

## For Backend Dev

Tell them:

> "Just add the 4 GET endpoints - code examples are in the doc. Everything else is optional or already done. Should take 2-3 hours total."

