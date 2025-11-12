# `generating_summary` Event Integration

## Overview
The `generating_summary` event is now fully integrated into the WebSocket specification and frontend solution. This event represents the second AI generation phase when processing uploads, where the user-facing summary is created.

---

## What Changed

### 1. ✅ Specification Updated
**File:** `docs/websocket-states-spec.md`

Added `generating_summary` event documentation:

```json
{
  "type": "generating_summary",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520040,
  "process": "upload",
  "message": "Začínám generovat finální souhrn..."
}
```

**Progress:** ~60%  
**Frontend Action:** Show status: "Vytváříme souhrn..." (Creating summary...)

**Upload Flow Now:**
1. `job_started` (10%) - "Začínáme..."
2. `extracting` (20%) - "Čteme obsah..."
3. `generating_context` (30%) - "AI vytváří kontext..."
4. **`generating_summary` (60%)** - "Vytváříme souhrn..." ⬅️ **NEW**
5. `complete` (100%) - "Hotovo! 🎉"

**Note:** Upload does NOT use `chunk` events. The backend sends internal `gemini_chunk` events for streaming, but these are not exposed to the frontend. Both AI phases (`generating_context` and `generating_summary`) run to completion without progress updates.

---

### 2. ✅ TypeScript Types Added
**File:** `src/types/websocket-events.ts`

Added new interface:

```typescript
export interface UploadGeneratingSummaryEvent extends BaseJobEvent {
  type: "generating_summary";
  process: "upload";
  message?: string;
}
```

Updated union type:

```typescript
export type UploadEvent =
  | UploadJobStartedEvent
  | UploadExtractingEvent
  | UploadGeneratingContextEvent
  | UploadGeneratingSummaryEvent  // ⬅️ NEW
  | UploadCompleteEvent
  | UploadErrorEvent;
```

**Note:** `UploadChunkEvent` was removed - upload doesn't use chunks (only chat does).

---

### 3. ✅ Event Handlers Updated
**File:** `src/hooks/use-job-subscription.ts`

#### Progress Calculation
Added case for `generating_summary` → returns 60% progress:

```typescript
case "generating_summary":
  return 60;
```

Also updated `chunk` handling to only apply to chat (not upload):

```typescript
case "chunk":
  // Only for chat streaming (upload doesn't use chunks)
  return 50;
```

#### Status Mapping
Added `generating_summary` to the processing state:

```typescript
case "generating_summary":
case "generating_context":
case "extracting":
  return "processing";
```

---

### 4. ✅ UI Component Support
**File:** `src/components/job-status/job-status-indicator.tsx`

The component already supports the new event automatically! It will:
- Show the Sparkles icon (animated)
- Display "Zpracováváme soubor..." (Processing file...)
- Show progress bar at ~60%
- Use blue color scheme

**Custom message override:** The backend can pass a `message` field (e.g., "Začínám generovat finální souhrn...") which will be displayed instead of the default.

---

## Backend Compliance ✅

The backend was already sending this event, but with the wrong `process` type. After our fixes:

**Before (❌):**
```php
'process' => 'summary',  // WRONG - caused mismatches
```

**After (✅):**
```php
'process' => 'upload',   // CORRECT - follows spec
```

All backend files now correctly emit:
- `app/Core/Gemini/GeminiService.php` ✅
- `app/Model/Queue/Handler/SourceHandler.php` ✅

---

## Two-Phase AI Generation

The upload process now has **two distinct AI generation phases**:

### Phase 1: Context Generation (`generating_context`)
- **Purpose:** Create internal structured context for AI to work with
- **Input:** Raw extracted text from uploaded file
- **Output:** Structured analysis capturing key information, facts, themes
- **Progress:** 30%

### Phase 2: Summary Generation (`generating_summary`)
- **Purpose:** Create user-facing summary for studying
- **Input:** The structured context from Phase 1
- **Output:** Clean, concise summary for students
- **Progress:** 60%

This two-phase approach ensures high-quality summaries:
1. First pass structures the content
2. Second pass makes it student-friendly

---

## Testing

Upload a file and watch the console. You should see events in order:

```
[JobSubscription] Event: job_started (10%)
[JobSubscription] Event: extracting (20%)
[JobSubscription] Event: generating_context (30%)
[JobSubscription] Event: generating_summary (60%)  ⬅️ NEW
[JobSubscription] Event: complete (100%)
```

**No chunks for upload!** The AI phases run to completion without streaming.  
**No more "Process mismatch" warnings!** ✅

---

## Summary

✅ **Spec updated** - `generating_summary` documented  
✅ **Types added** - Full TypeScript support  
✅ **Handlers updated** - Progress and status mapping  
✅ **Backend fixed** - Correct `process: 'upload'`  
✅ **UI ready** - Component supports event automatically  

**Result:** Complete, spec-compliant implementation of two-phase AI generation! 🎉

