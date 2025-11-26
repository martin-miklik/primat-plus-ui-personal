# MVP: One Active Instance Per Test - Frontend Analysis

## 📋 Business Rules for MVP

### What Backend Will Do
- ✅ Track ALL instances in database (for future features)
- ✅ Allow only ONE active instance per test per user
- ✅ User CAN start new instance after completing previous one
- ❌ NO instance list endpoint (not needed for MVP)
- ❌ NO instance history shown to users (for MVP)

### What Frontend Needs to Do
- ✅ Show "Start Test" button
- ✅ If active instance exists → Resume it automatically
- ✅ Show results after completion
- ❌ NO "Previous Attempts" list
- ❌ NO "Retake" button (can just click "Start Test" again after completion)
- ❌ NO "X attempts" counter displayed

---

## 🔍 Current Frontend State

### ✅ Already Correct

**1. Resume Logic** (`page.tsx` line 64-79)
```typescript
const handleStartTest = async (testId: string) => {
  const response = await startTestMutation.mutateAsync(testId);
  const instanceId = response.data.instanceId;
  
  if (response.data.resumed) {
    toast.success("Pokračujete v rozdělaném testu");
  }
  
  router.push(`/testy/${testId}/instance/${instanceId}`);
};
```
✅ **Status:** Perfect! Already resumes active instance.

**2. MSW Handler** (`tests.ts` line 326-356)
```typescript
const activeInstance = testInstances.find(
  (inst) => inst.testId === testId && inst.userId === 1 && inst.status === "active"
);

if (activeInstance) {
  return HttpResponse.json({
    success: true,
    data: { ...activeInstance, resumed: true }
  });
}

// Otherwise create new instance
```
✅ **Status:** Perfect! Already implements one-active-instance logic.

**3. Backend Endpoint** (Already exists)
```php
POST /api/v1/tests/{testId}/instances
```
✅ **Status:** Backend already returns existing active instance.

---

## 🔧 What Needs to Change for MVP

### ❌ REMOVE: Instance Count Display

**File:** `src/components/tests/test-card.tsx` (line 119-125)

**Current code:**
```typescript
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <Clock className="h-4 w-4" />
  <span>
    {test.instanceCount === 0
      ? t("card.noAttempts")
      : t("card.attempts", { count: test.instanceCount })}
  </span>
</div>
```

**Should be:**
```typescript
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <Clock className="h-4 w-4" />
  <span>{t("card.created")}</span>
</div>
```

Just show when the test was created, not attempt count.

---

### ❌ REMOVE: instanceCount from Backend Response

**File:** Backend `TestController::listBySource()`

**Current response:**
```json
{
  "id": "123",
  "questionCount": 15,
  "instanceCount": 3,  // ← Remove this for MVP
  ...
}
```

**MVP response:**
```json
{
  "id": "123",
  "questionCount": 15,
  // No instanceCount field
  ...
}
```

**Frontend schema:** `src/lib/validations/test.ts`
```typescript
export const testListItemSchema = z.object({
  // ... other fields
  instanceCount: z.number().optional(), // Make it optional for MVP
});
```

---

### ❌ REMOVE: "Review Answers" Button After Completion (Optional)

**File:** `src/app/(dashboard)/testy/[testId]/instance/[instanceId]/vysledky/page.tsx` (line 81-86)

**Current:**
```typescript
<Link href={`/testy/${testId}/instance/${instanceId}`}>
  <Button variant="outline" size="lg">
    <ArrowLeft className="mr-2 h-4 w-4" />
    {t("results.reviewAnswers")}
  </Button>
</Link>
```

**Options:**
1. **Keep it** - User can review their answers (instance still exists in DB)
2. **Remove it** - Simpler UX, just "Back Home" button

**Recommendation:** KEEP IT for better UX.

---

## 🎯 MVP User Flow

### Scenario 1: First Time Taking Test
1. User clicks "Start Test" button
2. Backend creates new instance
3. User takes test
4. User sees results
5. ✅ Test instance marked as "completed"

### Scenario 2: User Closes Browser Mid-Test
1. User starts test (instance created, status="active")
2. User answers 5/15 questions
3. Browser closes
4. User comes back later, clicks "Start Test"
5. Backend returns **same instance** with `resumed: true`
6. Frontend shows toast: "Pokračujete v rozdělaném testu"
7. User continues from question 6
8. ✅ Works perfectly with current code!

### Scenario 3: User Wants to Retake Test
1. User completed test (instance status="completed")
2. User clicks "Start Test" again
3. Backend finds NO active instance (previous is "completed")
4. Backend creates NEW instance
5. User takes test again
6. ✅ Works perfectly with current code!

---

## ✅ What Backend Already Has (Confirmed)

Looking at backend code:

**1. TestInstanceController::create()** (line 40-55)
```php
$activeInstance = $this->instanceRepository->findActiveByUserAndTest($userId, $testId);

if ($activeInstance !== null) {
    // Return existing active instance
    return $this->apiResponse->success([
        'instanceId' => $activeInstance->getId(),
        'testId' => $activeInstance->getTest()->getId(),
        'status' => $activeInstance->getStatus()->value,
        // ... other fields
    ]);
}

// Create new instance
$instance = $this->instanceFacade->create($test, $user);
```

✅ **Perfect!** Already implements one-active-instance logic.

**2. Repository Method**
```php
public function findActiveByUserAndTest(int $userId, int $testId): ?TestInstance
{
    return $this->createQueryBuilder('ti')
        ->where('ti.user = :userId')
        ->andWhere('ti.test = :testId')
        ->andWhere('ti.status = :status')
        ->setParameter('userId', $userId)
        ->setParameter('testId', $testId)
        ->setParameter('status', TestInstanceStatus::ACTIVE)
        ->getQuery()
        ->getOneOrNullResult();
}
```

✅ **Perfect!** Finds active instance correctly.

---

## 🚀 Summary: What Actually Needs to Change?

### Frontend Changes (10 minutes)
1. ✅ **Remove instance count display** from TestCard component
2. ✅ **Make `instanceCount` optional** in TypeScript schema
3. ✅ **Update translations** - Remove "X attempts" strings

### Backend Changes
1. ❌ **Nothing!** Already works correctly.
2. ❌ **Optional:** Remove `instanceCount` from list response (not critical if it stays)

### The Good News
**90% of the code is already perfect for this MVP approach!**

The only thing showing instance history is the small "X attempts" text in TestCard. Remove that and you're done.

---

## 📊 Before vs After

### BEFORE (Current)
```
┌─────────────────────────────┐
│ Test: 15 otázek            │
│ Medium • During            │
│                            │
│ [Multiple Choice] [True/F] │
│                            │
│ ⏰ 3 pokusy  [Spustit test]│  ← Shows attempt count
└─────────────────────────────┘
```

### AFTER (MVP)
```
┌─────────────────────────────┐
│ Test: 15 otázek            │
│ Medium • During            │
│                            │
│ [Multiple Choice] [True/F] │
│                            │
│ ⏰ Vytvořeno   [Spustit test]│  ← Just shows it exists
└─────────────────────────────┘
```

---

## 🎯 Action Items

### Immediate (Required for MVP)
1. [ ] Update `TestCard` component - remove instance count display
2. [ ] Make `instanceCount` optional in schema
3. [ ] Update Czech translations

### Optional (Post-MVP)
- [ ] Backend: Remove `instanceCount` from response (for cleaner API)
- [ ] Add "Test History" page (show past attempts)
- [ ] Add "Retake Test" explicit button

---

## ⏱️ Time Estimate

**Frontend changes:** 10 minutes
- Edit TestCard component (2 min)
- Update schema (1 min)  
- Update translations (2 min)
- Test in browser (5 min)

**Backend changes:** 0 minutes (already done!)

**Total:** 10 minutes 🚀

---

## 🤔 Questions for Clarification

1. **After completing a test**, should user be able to:
   - ✅ See results? (yes, obviously)
   - ✅ Start new attempt? (yes, by clicking "Start Test" again)
   - ✅ Review their answers from completed test? (currently yes - keep it?)

2. **If user has ACTIVE instance**, what happens if they click "Start Test"?
   - ✅ Currently: Resumes automatically with toast message
   - ✅ This is the desired behavior, right?

3. **Instance count in backend response** - should we:
   - Option A: Keep it in response, just don't display it (easier, no backend change)
   - Option B: Remove it from response (cleaner API)
   
   **Recommendation:** Option A for speed (no backend changes needed)








