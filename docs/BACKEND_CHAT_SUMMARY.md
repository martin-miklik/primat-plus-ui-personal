# Chat WebSocket - Quick Fix Needed

## TL;DR
Chat events don't follow the unified spec. Need to add `process` field and rename event types to match upload implementation.

## 5 Required Changes

### 1. Add `process: 'chat'` to ALL events
**Every event must include:** `'process' => 'chat'`

Currently missing in all 4 event types in `GeminiService.php` and `ChatHandler.php`.

### 2. Rename Event Types

| Current | Should Be |
|---------|-----------|
| `chat_started` | `job_started` |
| `gemini_chunk` | `chunk` |
| `gemini_complete` | `complete` |
| `chat_error` | `error` |

### 3. Fix Error Structure (line 428-434 in GeminiService)
```php
// Current ❌
'error' => $e->getMessage(),
'errorCode' => 'STREAM_ERROR'

// Should be ✅
'error' => 'AI_ERROR',           // Error CODE here
'message' => $e->getMessage()    // Message here
```

---

## Example: job_started event

**Current (WRONG):**
```php
$this->centrifugo->publish($channel, [
    'type' => 'chat_started',  // ❌
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'model' => $modelName,
    'sourceId' => $sourceId
    // ❌ Missing 'process'
]);
```

**Should be (CORRECT):**
```php
$this->centrifugo->publish($channel, [
    'type' => 'job_started',   // ✅ Changed
    'jobId' => $jobId,
    'timestamp' => $this->getTimestampMs(),
    'process' => 'chat',       // ✅ Added
    'model' => $modelName,
    'sourceId' => $sourceId
]);
```

---

## Files to Update
1. `app/Core/Gemini/GeminiService.php` - lines 388, 408, 419, 428
2. `app/Model/Queue/Handler/ChatHandler.php` - line 150

---

## Why?
**Upload already follows this pattern.** Check `SourceHandler.php` lines 64-71 for reference.

Frontend has a generic hook that works for all job types, but it requires:
- Standard event names (`job_started`, `chunk`, `complete`, `error`)
- Required `process` field to identify job type

See: `docs/websocket-states-spec.md` section 3 (Chat Events)

---

**Without these changes, chat won't work with the generic frontend subscription system.**

