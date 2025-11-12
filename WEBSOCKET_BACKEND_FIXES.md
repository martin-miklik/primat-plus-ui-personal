# WebSocket Backend Fixes Required

## Issue: Process Type Mismatch

### Problem
The backend is not following the `docs/websocket-states-spec.md` specification for the upload flow. All events in the upload process should have `process: 'upload'`, but some events are sending `process: 'summary'` or `process: 'source'`.

### Spec Requirement
According to the spec (lines 96-125), **ALL upload-related events must have `process: 'upload'`**:
- `job_started` → `process: 'upload'` ✅
- `extracting` → `process: 'upload'` ✅
- `generating_context` → `process: 'upload'` ✅
- `generating_summary` → `process: 'upload'` ❌ **Currently 'summary'**
- `complete` → `process: 'upload'` ✅
- `error` → `process: 'upload'` ❌ **Some are 'source'**

### Files to Fix

#### 1. `app/app/Core/Gemini/GeminiService.php`

**Lines to change: 88, 166, 261, 329**

```php
// BEFORE (WRONG):
$this->centrifugo->publish(
    $channel, [
    'type' => 'generating_summary',
    'jobId' => $jobId,
    'timestamp' => time(),
    'process' => 'summary',  // ❌ WRONG
    'message' => 'Začínám generovat finální souhrn...'
]);

// AFTER (CORRECT):
$this->centrifugo->publish(
    $channel, [
    'type' => 'generating_summary',
    'jobId' => $jobId,
    'timestamp' => time(),
    'process' => 'upload',  // ✅ CORRECT
    'message' => 'Začínám generovat finální souhrn...'
]);
```

#### 2. `app/app/Model/Queue/Handler/SourceHandler.php`

**Line 225:**

```php
// BEFORE (WRONG):
$this->publishStatus($channel, [
    'type' => 'error',
    'jobId' => $source?->getJobId() ?? '',
    'timestamp' => time(),
    'process' => 'source',  // ❌ WRONG
    'sourceId' => $sourceId,
    'error' => $message
]);

// AFTER (CORRECT):
$this->publishStatus($channel, [
    'type' => 'error',
    'jobId' => $source?->getJobId() ?? '',
    'timestamp' => time(),
    'process' => 'upload',  // ✅ CORRECT
    'sourceId' => $sourceId,
    'error' => $message
]);
```

### Why This Matters
The frontend's `useJobSubscription` hook validates that incoming events match the expected process type. When the backend sends `process: 'summary'` but the frontend expects `process: 'upload'`, the event is **silently dropped** with a console warning:

```
[JobSubscription] Process mismatch: expected upload, got summary
```

This causes the UI to not update properly during the summary generation phase.

## Testing
After fixing, upload a file and check the console. You should see:
- ✅ No "Process mismatch" warnings
- ✅ All events have `process: 'upload'`
- ✅ Progress updates smoothly through all phases

## Search & Replace Commands

For quick fixes, use these commands in the backend:

```bash
# Fix GeminiService.php
cd /home/dchozen1/work/primat-plus-be/primat-plus/app
sed -i "s/'process' => 'summary',/'process' => 'upload',/g" app/Core/Gemini/GeminiService.php

# Fix SourceHandler.php (line 225 only - be careful!)
# This one needs manual verification since there are correct 'upload' values too
```

---

**Status:** ✅ **FIXED** - All backend changes applied

### Verification Commands

```bash
# Verify GeminiService.php
grep -n "'process' =>" app/Core/Gemini/GeminiService.php

# Verify SourceHandler.php
grep -n "'process' =>" app/Model/Queue/Handler/SourceHandler.php
```

All upload events now correctly use `process: 'upload'`.

