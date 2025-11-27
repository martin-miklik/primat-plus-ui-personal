# Open-Ended Feedback Display Fix

## Issue

After WebSocket evaluation completed successfully, users saw only a disabled input field instead of the feedback with score and AI comments.

**What was happening**:
1. WebSocket receives `answer_evaluated` event with feedback ✓
2. `OpenEndedEvaluation` component renders success state with feedback ✓
3. Parent component immediately hides the evaluation component ✗
4. User never sees the feedback! ✗

**Console showed**:
```javascript
{
  type: "answer_evaluated",
  userAnswerId: 15,
  questionIndex: 4,
  score: "0.00",
  isCorrect: false,
  feedback: "Odpověď „nevím" neobsahuje správnou informaci...",
  evaluatedAt: "2025-11-26T20:26:40+01:00",
  timestamp: 1764185200
}
```

But feedback was never displayed to the user.

## Root Cause

In the test taking page, when `handleOpenEndedEvaluationComplete` was called, it immediately executed:

```typescript
setEvaluatingOpenEnded(null); // Hides component immediately!
```

This removed the `OpenEndedEvaluation` component from the DOM before the user could see the feedback display.

## Fix

### 1. Delayed Component Hiding

Added a 3-second delay before hiding the evaluation component:

```typescript
const handleOpenEndedEvaluationComplete = useCallback(
  (feedback: AnswerFeedbackResponse) => {
    // Store the evaluation result
    session.setAnswer(session.getCurrentAnswer()?.answer || "", feedback);
    
    // Keep evaluation visible for 3 seconds so user can read feedback
    setTimeout(() => {
      setEvaluatingOpenEnded(null);
      
      // Auto-advance in "during" mode if correct
      if (testData?.reviewMode === "during" && feedback.isCorrect) {
        setIsAutoAdvancing(true);
        setTimeout(() => {
          if (session.canGoNext) {
            session.goToNext();
          }
          setIsAutoAdvancing(false);
        }, 2000);
      }
    }, 3000); // Show result for 3 seconds before hiding
  },
  [session, testData?.reviewMode]
);
```

**Flow now**:
1. Evaluation completes → Feedback displayed
2. Wait 3 seconds (user reads feedback)
3. Hide evaluation component
4. If correct answer in "during" mode → auto-advance after 2 more seconds

### 2. Improved Feedback Display

Updated `OpenEndedEvaluation` component to show different colors for correct/incorrect:

**Correct Answer**:
- 🟢 Green border and background
- ✓ Check icon
- "Správně!" title

**Incorrect Answer**:
- 🔴 Red border and background
- ✗ X icon
- "Nesprávně" title

```typescript
if (status === "complete" && evaluationResult) {
  const isCorrect = evaluationResult.isCorrect;
  const borderColor = isCorrect ? "border-l-green-500" : "border-l-red-500";
  const bgColor = isCorrect 
    ? "bg-green-50 dark:bg-green-950/20" 
    : "bg-red-50 dark:bg-red-950/20";
  const iconColor = isCorrect ? "text-green-600" : "text-red-600";
  const Icon = isCorrect ? CheckCircle2 : XCircle;
  
  return (
    <Card className={`p-6 border-l-4 ${borderColor} ${bgColor}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 ${iconColor}`} />
        <div className="flex-1">
          <h4>{isCorrect ? "Správně!" : "Nesprávně"}</h4>
          <p>Hodnocení: {Math.round(evaluationResult.score * 100)}%</p>
          <p>{evaluationResult.feedback}</p>
        </div>
      </div>
    </Card>
  );
}
```

## Files Changed

1. **`src/app/(dashboard)/.../page.tsx`**
   - Added 3-second delay in `handleOpenEndedEvaluationComplete`

2. **`src/components/questions/open-ended-evaluation.tsx`**
   - Dynamic styling based on `isCorrect`
   - Shows appropriate icon and colors
   - Uses correct translation keys

## User Experience

### Before ❌
1. Submit open-ended answer
2. See "AI vyhodnocuje..."
3. Suddenly: disabled input, no feedback
4. Confusion

### After ✅
1. Submit open-ended answer
2. See "AI vyhodnocuje vaši odpověď..." with spinner
3. Evaluation completes → See clear feedback:
   - **Correct**: Green card with ✓, score, and positive feedback
   - **Incorrect**: Red card with ✗, score, and constructive feedback
4. Feedback visible for 3 seconds
5. If correct in "during" mode: auto-advance
6. Smooth transition to next question

## Timing Breakdown

**During Mode - Correct Answer**:
- Evaluation: ~3-5 seconds (WebSocket)
- Show feedback: 3 seconds
- Auto-advance countdown: 2 seconds
- **Total**: ~8-10 seconds (gives time to read)

**During Mode - Incorrect Answer**:
- Evaluation: ~3-5 seconds (WebSocket)
- Show feedback: 3 seconds
- Manual navigation (no auto-advance)
- **Total**: User controls when to move on

**After Mode**:
- Evaluation: ~3-5 seconds (WebSocket)
- Show feedback: 3 seconds
- Manual navigation always
- **Total**: User controls timing

## Backend Process Field Issue

**Question**: Should we report the missing `process` field in `answer_evaluated` events to the backend?

**Answer**: 

**For Backend Team** (if you want to standardize):
The `answer_evaluated` event should include `process: "test"` like other events:

```javascript
// Current (missing process)
{
  type: "answer_evaluated",
  userAnswerId: 15,
  questionIndex: 4,
  score: "0.00",
  isCorrect: false,
  feedback: "...",
  timestamp: 1764185200
}

// Recommended (with process)
{
  type: "answer_evaluated",
  userAnswerId: 15,
  questionIndex: 4,
  score: "0.00",
  isCorrect: false,
  feedback: "...",
  timestamp: 1764185200,
  process: "test"  // <-- Add this
}
```

**Frontend Solution** (already implemented):
We made the `process` field validation optional in `useJobSubscription`, so it works with or without the field. No backend change required for frontend to work correctly.

## Testing Checklist

- [ ] Submit open-ended answer
- [ ] See loading state with spinner
- [ ] Wait for evaluation (~3-5s)
- [ ] **See feedback displayed** (green or red card)
- [ ] Read score percentage
- [ ] Read AI feedback text
- [ ] Feedback stays visible for 3 seconds
- [ ] Component hides smoothly
- [ ] If correct in "during" mode: auto-advances
- [ ] If incorrect or "after" mode: manual navigation

## Success Criteria ✅

- Users can see and read evaluation feedback
- Correct/incorrect clearly distinguished by color
- Smooth transitions without jarring changes
- Appropriate timing for reading feedback
- No confusion about what happened

---

**Status**: ✅ Fixed and ready for testing
**Date**: November 26, 2025




