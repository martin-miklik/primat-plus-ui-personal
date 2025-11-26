# Bug Fixes - User Testing Feedback

## Issues Fixed

### 1. ✅ Feedback Shows "b" Instead of Full Option Text

**Problem**: During evaluation, correct answer showed just "b" instead of the option text.

**Fix**: 
- Updated `QuestionFeedback` component to accept `options` and `questionType` props
- Added `formatAnswer()` helper function that maps option IDs to full text
- Handles true/false display as "Pravda"/"Nepravda"
- Handles comma-separated multiple answers ("a,c,d" → "Option A, Option C, Option D")

**Files Changed**:
- `src/components/questions/question-feedback.tsx`
- `src/app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/testy/[testId]/instance/[instanceId]/page.tsx`

### 2. ✅ Wrong Answers Show Green Dot

**Problem**: Incorrect answers showed green dots, making it confusing.

**Fix**: 
- Dots now show different colors based on answer correctness:
  - 🔵 Blue (Primary) = Current question
  - 🟢 Green = Answered correctly
  - 🔴 Red = Answered incorrectly
  - 🔵 Blue = Answered but no feedback yet (after mode)
  - ⚪ Gray = Unanswered

**Files Changed**:
- `src/app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/testy/[testId]/instance/[instanceId]/page.tsx`

### 3. ✅ Removed "Nejprve zodpovězte..." Message

**Problem**: Info message was redundant since navigation is already disabled.

**Fix**: 
- Removed the blue info card that appeared when navigation was blocked
- Navigation is still properly disabled with visual feedback (grayed out buttons/dots)

**Files Changed**:
- `src/app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/testy/[testId]/instance/[instanceId]/page.tsx`

### 4. ✅ True/False Shows "true" Instead of "Pravda"

**Problem**: True/false answers displayed as "true"/"false" instead of Czech translations.

**Fix**: 
- Updated `formatAnswer()` function to check for boolean values and "true"/"false" strings
- Maps to `t("question.true")` and `t("question.false")` which display as "Pravda"/"Nepravda"

**Files Changed**:
- `src/components/questions/question-feedback.tsx`

### 5. ✅ Removed 50 Character Hint

**Problem**: Orange hint "Snažte se napsat alespoň 50 znaků..." was distracting.

**Fix**: 
- Removed the conditional hint display
- Character count still shown for reference

**Files Changed**:
- `src/components/questions/open-ended-question.tsx`

### 6. ✅ Refresh Resets Test Progress

**Problem**: Refreshing the page started the test from the beginning, losing all progress.

**Fix**: 
- Added `userAnswers` field to `TestInstanceStartResponse` schema
- Updated `useTestSession` hook to accept `initialAnswers`
- Parse existing answers from backend response and restore them
- Test resumes from the same state after refresh

**Files Changed**:
- `src/lib/validations/test.ts`
- `src/hooks/use-test-session.ts`
- `src/app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/testy/[testId]/instance/[instanceId]/page.tsx`

### 7. ✅ WebSocket Messages Don't Match Frontend Types

**Problem**: Backend sends WebSocket messages without `jobId` field in events, and `score` as string.

**Backend Messages**:
```javascript
{
  type: "job_started",
  timestamp: 1764183809,
  process: "test"
  // No jobId
}

{
  type: "answer_evaluated",
  userAnswerId: 15,
  questionIndex: 4,
  score: "0.00",  // String, not number
  isCorrect: false,
  feedback: "...",
  evaluatedAt: "2025-11-26T20:03:30+01:00",
  timestamp: 1764183810
}
```

**Fix**: 
- Updated `OpenEndedEvaluation` component to work with backend's actual message format
- Parse `score` from string to number
- Use flexible type checking for event matching
- No chunking/streaming - just wait for `answer_evaluated` event

**Files Changed**:
- `src/components/questions/open-ended-evaluation.tsx`

## Summary of Changes

### Files Modified (7 files)
1. `src/components/questions/question-feedback.tsx` - Answer formatting
2. `src/components/questions/open-ended-question.tsx` - Removed hint
3. `src/components/questions/open-ended-evaluation.tsx` - WebSocket compatibility
4. `src/app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/testy/[testId]/instance/[instanceId]/page.tsx` - Multiple fixes
5. `src/hooks/use-test-session.ts` - State restoration
6. `src/lib/validations/test.ts` - Schema update

### Testing Checklist

After these fixes, verify:
- [ ] Feedback shows full option text, not IDs
- [ ] True/false shows "Pravda"/"Nepravda"
- [ ] Wrong answers show red dots
- [ ] Correct answers show green dots
- [ ] No "Nejprve zodpovězte..." message
- [ ] No 50 character hint in open-ended
- [ ] Refresh preserves test progress
- [ ] Open-ended evaluation works via WebSocket
- [ ] Score displays correctly (as percentage)

## Notes

- Backend returns `userAnswers` array when fetching an existing test instance
- Open-ended evaluation doesn't stream - just shows loading then result
- Score comes from backend as string (e.g., "0.00", "1.00") and is parsed to number for display
- All changes are backward compatible with existing tests

---

**Status**: ✅ All issues fixed
**Date**: November 26, 2025

