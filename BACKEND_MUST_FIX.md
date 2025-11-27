# BACKEND BUG - MUST FIX

## The Problem

**Backend is not following the WebSocket specification.**

The `answer_evaluated` event is **MISSING the required `process` field**.

## Current Broken Behavior

```javascript
// ✓ These events include process field
{ type: "job_started", timestamp: 1764184760, process: "test" }
{ type: "generating", timestamp: 1764184760, process: "test" }
{ type: "complete", timestamp: 1764184760, process: "test" }

// ✗ THIS IS BROKEN - Missing process field
{
  type: "answer_evaluated",
  userAnswerId: 15,
  questionIndex: 4,
  score: "0.00",
  isCorrect: false,
  feedback: "...",
  evaluatedAt: "2025-11-26T20:26:40+01:00",
  timestamp: 1764185200
  // WHERE IS process: "test" ????
}
```

## What Backend Must Do

### File to Fix

`app/Model/Queue/Handler/EvaluateOpenEndedAnswerHandler.php`

### Change Required

```php
private function publishEvaluationResult(UserAnswer $userAnswer, string $channel): void
{
    try {
        $payload = [
            'type' => 'answer_evaluated',
            'userAnswerId' => $userAnswer->getId(),
            'questionIndex' => $userAnswer->getQuestionIndex(),
            'score' => $userAnswer->getScore(),
            'isCorrect' => $userAnswer->getIsCorrect(),
            'feedback' => $userAnswer->getAiFeedback(),
            'evaluatedAt' => $userAnswer->getEvaluatedAt()?->format('c'),
            'timestamp' => time(),
            'process' => 'test' // <--- ADD THIS LINE
        ];

        $this->centrifugo->publish($channel, $payload);
    } catch (CentrifugoException $e) {
        // error handling...
    }
}
```

## Why This Matters

1. **Type Safety**: Frontend validates ALL events have `process` field
2. **Security**: Prevents accepting events from wrong channels
3. **Debugging**: Clear identification of event source
4. **Standards**: All events should follow same structure
5. **Maintainability**: Consistent API contract

## Current Status

**Frontend**: Strict validation in place. Events WITHOUT `process` field are REJECTED.

**Backend**: Broken. `answer_evaluated` events are being rejected by frontend.

**Result**: Open-ended question evaluation DOES NOT WORK until backend is fixed.

## Frontend Will NOT Workaround This

The frontend is correctly implemented per spec. The backend must be fixed.

**No special cases.**
**No optional validation.**
**No workarounds.**

Backend broke the contract. Backend must fix it.

## Testing After Fix

Once backend adds `process: "test"` to `answer_evaluated`:

1. Open-ended questions will work
2. Frontend validation passes
3. No console errors
4. Proper event flow

## Timeline

**BLOCKING**: This must be fixed before open-ended questions can work in production.

---

**Status**: ❌ Backend broken, waiting for fix
**Priority**: HIGH
**Complexity**: 1 line change in backend
**ETA**: Should take 5 minutes to fix

## Message for Backend Team

Your `answer_evaluated` event is missing the `process` field that all other events include. This breaks frontend validation and prevents open-ended questions from working. 

Add `'process' => 'test'` to the payload in `EvaluateOpenEndedAnswerHandler.php` line ~140.

This is a 1-line fix. Please prioritize.




