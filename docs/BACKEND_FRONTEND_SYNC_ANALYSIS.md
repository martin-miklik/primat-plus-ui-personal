# Backend-Frontend Synchronization Analysis
**Updated:** 2025-01-18

## ✅ GOOD NEWS
- **Responses ARE wrapped:** Backend uses `ResponseTransformer` + `SuccessResponseDto` ✅
- **WebSocket spec exists:** `docs/websocket-states-spec.md` defines test generation events ✅
- **Centrifugo ready:** Frontend has `use-centrifuge` hook, backend publishes events ✅

## 🔴 CRITICAL ISSUES

### 1. ID Type Mismatch → **FIX ON FRONTEND** ⚡
**Issue:** Frontend expects UUIDs (string), Backend uses auto-increment integers

- **Frontend:** `testId: z.string().uuid()`
- **Backend:** `id: int` (auto-increment)

**Impact:** All test and instance IDs will fail validation

**✅ Recommended Fix (Frontend):**
```typescript
// src/lib/validations/test.ts
- id: z.string().uuid()
+ id: z.union([z.string(), z.number()]).transform(val => String(val))

// OR simpler:
- id: z.string().uuid()
+ id: z.coerce.string()
```

**Why Frontend:** Changing BE to UUIDs requires migration + reindexing. FE change is 2 lines.

### 2. Test Generation Status → **REMOVE POLLING FROM FRONTEND** ⚡

**Issue:** Frontend has `useTestStatus()` polling hook, but backend uses Centrifugo

**✅ Recommended Fix (Frontend):**
Remove `useTestStatus()` - it's obsolete! Backend follows `websocket-states-spec.md`:

```typescript
// DELETE THIS:
export function useTestStatus(testId: string | null, enabled: boolean = true) {
  return useQuery({
    queryKey: ["tests", "status", testId],
    queryFn: () => get<TestStatusResponse>(`/tests/${testId}/status`),
    enabled: !!testId && enabled,
    refetchInterval: (query) => {
      if (query.state.data?.data?.status === "generating") {
        return 1000;
      }
      return false;
    },
  });
}
```

**Use Centrifugo instead:**
Backend publishes to channel (per websocket-states-spec.md):
- `job_started` → "Připravujeme test..."
- `generating` → "AI píše otázky..." (with optional progress)
- `complete` → "Test je připraven!" (includes testId)
- `error` → Show error message

**Already implemented:** Frontend has `use-centrifuge` hook and subscription logic.

---

### 3. Missing GET Endpoints → **NEED BACKEND** 🔴

These are essential and can't be worked around on frontend:

#### a) GET /api/v1/sources/{sourceId}/tests
**Used by:** `useTests()` - List page
**Backend has:** ❌ Missing
**Priority:** HIGH - Blocking test list page

#### b) GET /api/v1/tests/{testId}  
**Used by:** `useTest()` - Test details
**Backend has:** ❌ Missing (facade has `getById()`, just needs controller method)
**Priority:** MEDIUM - Could work around by including full test in start response

#### c) GET /api/v1/instances/{instanceId}
**Used by:** `useTestInstance()` - Resume test
**Backend has:** ❌ Missing
**Priority:** HIGH - Blocking test taking page when user refreshes

#### d) GET /api/v1/instances/{instanceId}/results
**Used by:** `useTestResults()` - Results page
**Backend has:** ❌ Missing
**Priority:** HIGH - Blocking results display

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 4. Response Format - Minor Tweaks

#### Test Generation Response ✅ MOSTLY GOOD
**Backend returns (after ResponseTransformer):**
```json
{
  "success": true,
  "data": {
    "testId": 123,
    "status": "generating",
    "channel": "test:job:uuid-here"
  },
  "timestamp": "2025-01-18T10:30:00.000Z",
  "version": "v1"
}
```

**Frontend needs:**
- Accept integer testId (see Issue #1)
- Use `channel` field for Centrifugo subscription ✅

**Status:** Minor FE adjustment needed for ID type

#### Test Instance Start Response → **MINOR FE + BE ADJUSTMENT** 🟡

**Backend returns (after `TestInstanceResponseDto` + wrapper):**
```json
{
  "success": true,
  "data": {
    "instanceId": 123,
    "testId": 456,
    "status": "active",
    "reviewMode": "during",
    "questions": [...],
    "startedAt": "2025-01-18T10:30:00+00:00",
    "expiresAt": "2025-01-18T11:30:00+00:00"
  },
  "timestamp": "2025-01-18T10:30:00.000Z",
  "version": "v1"
}
```

**Issues:**
- ✅ Wrapper exists
- ⚡ ID types - Frontend accepts with `z.coerce.string()`
- 🔴 Missing `resumed` flag - Backend needs to add when returning existing instance
- ✅ Other fields match

**Backend fix needed:**
```php
if ($existingInstance) {
    $dto = TestInstanceResponseDto::fromEntity($existingInstance);
    return array_merge($dto->toArray(), ['resumed' => true]);
}
```

#### Answer Submission Responses → **GOOD ENOUGH** ✅

**During Mode (with immediate feedback):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "isCorrect": true,
    "correctAnswer": "b",
    "explanation": "Because..."
  },
  "timestamp": "...",
  "version": "v1"
}
```

**After Mode (save only):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "saved": true
  },
  "timestamp": "...",
  "version": "v1"
}
```

**Frontend expects:** `aiFeedback` and `score` for open-ended questions
**Backend:** Returns these via UserAnswer entity after async evaluation

**Status:** ✅ Works. Open-ended evaluation happens async via job, frontend handles `null` feedback until evaluated.

### 5. Test Completion Response → **FE CAN ADAPT** ⚡

**Backend returns (wrapped):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "testId": 456,
    "userId": "session-id",
    "status": "completed",
    "score": null,
    "totalQuestions": 15,
    "percentage": null,
    "startedAt": "...",
    "completedAt": "2025-01-18T10:45:00+00:00",
    "expiresAt": "...",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "timestamp": "...",
  "version": "v1"
}
```

**Frontend adaptation:**
```typescript
// Map backend fields to what we need
const completionResponse = {
  instanceId: response.data.id.toString(),
  completedAt: response.data.completedAt,
  totalQuestions: response.data.totalQuestions,
  evaluatingCount: 0, // Frontend can calculate from results endpoint
};
```

**Status:** ⚡ FE can work with this. Ignore extra fields.

---

## 🟡 LOW PRIORITY / ENHANCEMENTS

### 6. Validation Rules ✅ ALREADY ALIGNED

**Question Count:**
- **Frontend DTO:** `min: 5, max: 50`
- **Backend DTO:** `min: 5, max: 50` ✅
- **Max for everyone:** 50

**Status:** ✅ Already implemented! No changes needed if 50 is the limit for all users.

**Only if you want tier-based limits:**
- FREE: 15 questions max
- PREMIUM: 50 questions max
- Would need backend validation + error code "TEST_QUESTION_LIMIT"
- See `WEBSOCKET_IMPLEMENTATION_ANALYSIS.md` for code example

### 7. Answer Format → **FE ALREADY HANDLES** ✅

**Frontend sends:**
```typescript
{
  questionIndex: 0,
  answer: "a,c,e" // For multiple choice multiple
}
```

Backend expects string, frontend stringifies arrays. ✅ Already working.

---

### 8. Error Codes → **BACKEND SHOULD STANDARDIZE** 🟡

Frontend expects these error codes:
- `TEST_QUESTION_LIMIT` - Tier-based limits
- `ALREADY_EXISTS` - Duplicate active instance
- `NOT_FOUND` - Missing resources  
- `INVALID_STATE` - Invalid operation

**Backend:** Uses ApiException but codes may differ

**Recommendation:** Backend should use consistent error codes in ApiException responses to match frontend expectations.

---

### 9. Pagination → **FUTURE** 🔵

Neither FE nor BE implements pagination for test lists yet. Not needed until users have 100+ tests.

---

## 📋 ACTION ITEMS SUMMARY

### 🔥 FRONTEND (Quick Wins)

1. **Change ID validation to accept integers** (5 min)
   ```typescript
   // src/lib/validations/test.ts
   - id: z.string().uuid()
   + id: z.coerce.string()
   ```

2. **Remove `useTestStatus()` polling hook** (2 min)
   Delete the function, already have Centrifugo integration

3. **Adapt to completion response format** (10 min)
   Map `data.id` → `instanceId`, ignore extra fields

### 🔴 BACKEND (Required)

1. **Add 4 missing GET endpoints** (2-3 hours)
   - `GET /api/v1/sources/{sourceId}/tests`
   - `GET /api/v1/tests/{testId}` (optional, could skip)
   - `GET /api/v1/instances/{instanceId}`
   - `GET /api/v1/instances/{instanceId}/results`

2. **Add `resumed` flag to instance response** (10 min)
   When returning existing active instance, include `resumed: true`

3. **~Implement tier-based question limits~** ✅ ALREADY DONE
   Backend has `max: 50` in DTO validation - no changes needed if 50 is for everyone

4. **Update Centrifugo event names** (30 min - OPTIONAL)
   Backend publishes events but doesn't match spec naming
   - Uses `test_generation_started` instead of `job_started`
   - Missing `jobId` and `process` fields
   - See `WEBSOCKET_IMPLEMENTATION_ANALYSIS.md` for details
   - Works but inconsistent - fix post-launch if needed

---

## 💡 BACKEND IMPLEMENTATION GUIDE

### Required Endpoints (Copy-Paste Ready)

```php
// TestGenerationController.php

#[Path("/{id}/tests")]
#[Method(IRequest::Get)]
public function list(ApiRequest $request): array
{
    $sourceId = (int) $request->getParameter('id');
    $userId = $this->session->getId();
    
    // Get all tests for this source by this user
    $tests = $this->testRepository->findBySourceAndUser($sourceId, $userId);
    
    return array_map(fn($test) => $test->toArray(), $tests);
}

#[Path("/tests/{id}")]
#[Method(IRequest::Get)]
public function get(ApiRequest $request): array
{
    $testId = (int) $request->getParameter('id');
    $test = $this->testFacade->getById($testId);
    
    return $test->toArray();
}
```

```php
// TestInstanceController.php

#[Path("/instances/{id}")]
#[Method(IRequest::Get)]
public function get(ApiRequest $request): array
{
    $instanceId = (int) $request->getParameter('id');
    $instance = $this->testFacade->getActiveTestInstance($instanceId);
    
    return TestInstanceResponseDto::fromEntity($instance)->toArray();
}

#[Path("/instances/{id}/results")]
#[Method(IRequest::Get)]
public function results(ApiRequest $request): array
{
    $instanceId = (int) $request->getParameter('id');
    $instance = $this->testInstanceRepository->find($instanceId);
    
    if (!$instance || $instance->getStatus() !== TestInstanceStatus::COMPLETED) {
        throw ApiException::badRequest('Test not completed yet');
    }
    
    // Get all user answers with evaluation
    $userAnswers = $this->userAnswerRepository->findByTestInstance($instance);
    
    // Build results response per frontend expectations
    return [
        'instanceId' => $instance->getId(),
        'testId' => $instance->getTest()->getId(),
        'totalQuestions' => $instance->getTotalQuestions(),
        'score' => $instance->getScore(),
        'percentage' => $instance->getPercentage(),
        'completedAt' => $instance->getCompletedAt()?->format('c'),
        'results' => array_map(function($answer) {
            $question = $answer->getQuestion();
            return [
                'questionIndex' => $answer->getQuestionIndex(),
                'question' => $question['question'],
                'type' => $question['type'],
                'options' => $question['options'] ?? null,
                'userAnswer' => $answer->getAnswer(),
                'correctAnswer' => $answer->getCorrectAnswer(),
                'isCorrect' => $answer->getIsCorrect(),
                'score' => $answer->getScore(),
                'explanation' => $answer->getExplanation(),
                'aiFeedback' => $answer->getAiFeedback(),
                'evaluatedAt' => $answer->getEvaluatedAt()?->format('c'),
            ];
        }, $userAnswers),
    ];
}
```

```php
// Handle resumed instances

public function create(ApiRequest $request, ApiResponse $response): array
{
    $testId = (int) $request->getParameter('id');
    $userId = $this->session->getId();
    $test = $this->testFacade->getById($testId);
    
    // Check for existing active instance
    $existingInstance = $this->testInstanceRepository
        ->findOneBy(['test' => $test, 'userId' => $userId, 'status' => TestInstanceStatus::ACTIVE]);
    
    if ($existingInstance) {
        $dto = TestInstanceResponseDto::fromEntity($existingInstance);
        return array_merge($dto->toArray(), ['resumed' => true]);
    }
    
    // Create new instance
    $testInstance = $this->testFacade->createTestInstanceForUser($test, $userId);
    return TestInstanceResponseDto::fromEntity($testInstance)->toArray();
}
```

### Tier Validation

```php
// TestGenerationController::create()

public function create(ApiRequest $request, ApiResponse $response): array
{
    $sourceId = (int) $request->getParameter('id');
    $userId = $this->session->getId();
    $dto = $request->getParsedBody();
    
    // Get user tier (you'll need to implement this)
    $user = $this->userFacade->getBySessionId($userId);
    $maxQuestions = $user->isPremium() ? 100 : 15;
    
    if ($dto->questionCount > $maxQuestions) {
        throw ApiException::forbidden(
            "Free users can create tests with up to 15 questions. Upgrade for up to 100.",
            "TEST_QUESTION_LIMIT"
        );
    }
    
    // ... rest of create logic
}
```

---

## ✅ WHAT'S WORKING WELL

- ✅ **Response wrapping** - `ResponseTransformer` + `SuccessResponseDto` handles this
- ✅ **WebSocket spec** - Well-defined in `docs/websocket-states-spec.md`
- ✅ **Centrifugo integration** - Frontend has hooks, backend publishes events
- ✅ **Enum values** - All match (TestStatus, TestReviewMode, TestDifficulty, TestQuestionTypes)
- ✅ **Database schema** - Solid structure
- ✅ **Question structure** - Compatible between FE/BE
- ✅ **Answer submission** - Both modes implemented
- ✅ **Test completion** - Endpoint exists

---

## 🎯 FINAL SUMMARY

### Frontend Changes (30 minutes total)
1. Change ID validation: `z.string().uuid()` → `z.coerce.string()` 
2. Remove `useTestStatus()` polling hook
3. Adapt to completion response format

### Backend Changes (2-3 hours total)
1. **Add 4 missing GET endpoints** (2-3 hours) - CRITICAL
2. **Add `resumed: true` flag** (10 min) - Nice to have
3. **~Tier-based limits~** - SKIP (already at 50)
4. **~Centrifugo event naming~** - POST-LAUNCH (works, just inconsistent)

### The Good News
- Response wrapping ✅ Already working
- WebSocket spec ✅ Already defined  
- Core logic ✅ Already implemented
- Just need a few endpoints and minor adjustments!

**Estimated time to full integration:** 
- Frontend: 30 min ⚡ (DONE)
- Backend: 2-3 hours 🔴 (just the GET endpoints)
- **Total: 3 hours instead of 3 days!** 🚀

