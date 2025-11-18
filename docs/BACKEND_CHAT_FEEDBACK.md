# Backend Chat WebSocket Implementation - Issues Found

**Status:** ❌ **NOT READY FOR PRODUCTION**

## Summary

The chat WebSocket implementation does **NOT follow the unified spec** (`docs/websocket-states-spec.md`). The upload process follows it correctly, but chat uses different event names and is missing required fields. This will break the generic frontend subscription hook.

---

## Critical Issues

### ❌ Issue 1: Missing Required `process` Field

**All WebSocket events MUST include `process` field** (as per spec line 36-40).

**Current Implementation:**
```php
// GeminiService.php line 388-394
$this->centrifugo->publish($channel, [
    'type' => 'chat_started',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'model' => $modelName,
    'sourceId' => $sourceId
    // ❌ Missing: 'process' => 'chat'
]);
```

**Upload correctly includes it:**
```php
// GeminiService.php line 59-66 (upload events)
$this->centrifugo->publish($channel, [
    'type' => 'extracting',
    'jobId' => $jobId,
    'timestamp' => time(),
    'process' => 'upload',  // ✅ Correct
    'message' => 'Extracting text from document...'
]);
```

**Impact:** Frontend generic hook will reject all chat events with process mismatch warning.

---

### ❌ Issue 2: Non-Standard Event Type Names

Chat uses custom event names instead of the unified spec names.

| Location | Current (Wrong) | Spec (Correct) |
|----------|----------------|----------------|
| GeminiService.php:389 | `chat_started` | `job_started` |
| GeminiService.php:409 | `gemini_chunk` | `chunk` |
| GeminiService.php:420 | `gemini_complete` | `complete` |
| GeminiService.php:429 | `chat_error` | `error` |
| ChatHandler.php:151 | `chat_error` | `error` |

**Reference:** See spec sections 3 (Chat Events, lines 178-267) and 10 (Summary Table, line 562).

**Impact:** Frontend event handlers won't recognize these events. The generic `useJobSubscription` hook won't process them correctly.

---

### ❌ Issue 3: Inconsistent Error Structure

**Chat error events (line 428-434):**
```php
$this->centrifugo->publish($channel, [
    'type' => 'chat_error',  // ❌ Should be 'error'
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'error' => $e->getMessage(),  // ❌ Should be error CODE
    'errorCode' => 'STREAM_ERROR'  // ❌ Wrong field name
    // ❌ Missing: 'process' => 'chat'
    // ❌ Missing: 'message' field
]);
```

**Spec defines (lines 253-262):**
```json
{
  "type": "error",
  "jobId": "...",
  "timestamp": 1234,
  "process": "chat",
  "error": "AI_TIMEOUT",       // ← Error CODE
  "message": "AI did not respond in time"  // ← Human message
}
```

---

## Required Changes

### 📝 File: `app/Core/Gemini/GeminiService.php`

#### Change 1: `generateChatStream()` method (line 388-394)
```php
// ❌ CURRENT:
$this->centrifugo->publish($channel, [
    'type' => 'chat_started',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'model' => $modelName,
    'sourceId' => $sourceId
]);

// ✅ SHOULD BE:
$this->centrifugo->publish($channel, [
    'type' => 'job_started',      // Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',          // Added
    'model' => $modelName,
    'sourceId' => $sourceId
]);
```

#### Change 2: Chunk events (line 408-413)
```php
// ❌ CURRENT:
$this->centrifugo->publish($channel, [
    'type' => 'gemini_chunk',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'content' => $chunk,
]);

// ✅ SHOULD BE:
$this->centrifugo->publish($channel, [
    'type' => 'chunk',            // Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',          // Added
    'content' => $chunk,
]);
```

#### Change 3: Complete event (line 419-423)
```php
// ❌ CURRENT:
$this->centrifugo->publish($channel, [
    'type' => 'gemini_complete',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
]);

// ✅ SHOULD BE:
$this->centrifugo->publish($channel, [
    'type' => 'complete',         // Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',          // Added
]);
```

#### Change 4: Error event (line 428-434)
```php
// ❌ CURRENT:
$this->centrifugo->publish($channel, [
    'type' => 'chat_error',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'error' => $e->getMessage(),
    'errorCode' => 'STREAM_ERROR'
]);

// ✅ SHOULD BE:
$this->centrifugo->publish($channel, [
    'type' => 'error',            // Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',          // Added
    'error' => 'AI_ERROR',        // Changed: use error CODE
    'message' => $e->getMessage() // Changed: error message here
]);
```

---

### 📝 File: `app/Model/Queue/Handler/ChatHandler.php`

#### Change 5: `handleError()` method (line 150-156)
```php
// ❌ CURRENT:
$this->centrifugo->publish($channel, [
    'type' => 'chat_error',
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'error' => $errorCode,
    'message' => $errorMessage
]);

// ✅ SHOULD BE:
$this->centrifugo->publish($channel, [
    'type' => 'error',            // Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',          // Added
    'error' => $errorCode,        // Keep as is
    'message' => $errorMessage    // Keep as is
]);
```

---

## Verification Checklist

After making changes, verify:

- [ ] All 4 event types include `'process' => 'chat'`
- [ ] Event types match spec: `job_started`, `chunk`, `complete`, `error`
- [ ] Error events have both `error` (code) and `message` (description) fields
- [ ] Timestamp uses milliseconds (already correct with `getTimestampMs()`)
- [ ] Test with frontend `useJobSubscription` hook with `process: "chat"`

---

## Reference

- **Spec:** `/docs/websocket-states-spec.md`
- **Correct Example:** `app/Model/Queue/Handler/SourceHandler.php` (lines 64-71, 81-87, 221-228)
- **Frontend Hook:** `src/hooks/use-job-subscription.ts`

---

## Why This Matters

The entire point of the unified spec is to have **one generic frontend component** that handles all job types (upload, chat, flashcards, test). If each process uses different event names, we can't reuse code and the system becomes unmaintainable.

Upload already follows the spec correctly. Chat must match the same pattern.

