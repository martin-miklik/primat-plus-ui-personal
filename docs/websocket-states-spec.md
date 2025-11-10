# WebSocket Event States - Unified Specification

## Overview
This document defines the state enums and event types for all WebSocket (Centrifugo) communications in the Primat+ application. The goal is to create a unified, consistent system that allows for a reusable status component on the frontend.

---

## Design Philosophy

### Unified Base States
All async jobs share common lifecycle states:
- **Started** - Job picked up from queue, work begins
- **Processing** - Active work happening (with optional progress updates)
- **Complete** - Job finished successfully
- **Error** - Job failed

### Process-Specific Extensions
Each process can emit additional event types for granular updates (e.g., streaming chunks), but all must include the base states.

---

## 1. Base Event Structure

All events published to Centrifugo channels follow this structure:

```json
{
  "type": "job_started" | "processing" | "chunk" | "complete" | "error",
  "jobId": "string (UUID)",
  "timestamp": 1234567890,
  "process": "upload" | "chat" | "flashcards" | "test",
  ...additional fields
}
```

### Required Fields
- `type` - Event type (see sections below)
- `jobId` - Unique job identifier (UUID format)
- `timestamp` - Unix timestamp (seconds)
- `process` - Which process this belongs to (for multi-process UIs)

---

## 2. Upload / Source Processing

### Process Flow
1. User uploads file → Backend creates source
2. Backend queues job → Returns `jobId`, `channel`
3. Frontend subscribes to channel
4. Backend processes file → Extracts text/content
5. Backend sends to AI → Generates context/summary (streaming)
6. Context saved → Source ready

### Event Types

#### `job_started`
Emitted when the job is picked from the queue and processing begins.

```json
{
  "type": "job_started",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520000,
  "process": "upload",
  "sourceId": 42,
  "sourceType": "document" | "image" | "video" | "audio" | "youtube" | "webpage"
}
```

**Frontend Action:**
- Show status: "Začínáme..." (Starting...)

---

#### `extracting`
Emitted when extracting content from the uploaded file (before AI processing).

```json
{
  "type": "extracting",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520010,
  "process": "upload",
  "message": "Extracting text from document..."
}
```

**Frontend Action:**
- Show status: "Čteme obsah..." (Reading content...)
- Progress: ~20%

**Note:** This state is optional. Skip if extraction is instant.

---

#### `generating_context`
Emitted when AI starts generating the context/summary.

```json
{
  "type": "generating_context",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520020,
  "process": "upload"
}
```

**Frontend Action:**
- Show status: "AI přemýšlí..." (AI is thinking...)
- Progress: ~30%

---

#### `chunk`
Emitted during AI streaming (context generation). Multiple chunks sent progressively.

```json
{
  "type": "chunk",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520025,
  "process": "upload",
  "content": "...partial text..."
}
```

**Frontend Action:**
- Show status: "Vytváříme shrnutí..." (Creating summary...)
- Progress: Increment gradually from 30% → 90%
- Optional: Preview chunk count in UI

**Note:** Content is not shown to user (it's the internal context), but chunk events indicate progress.

---

#### `complete`
Emitted when the entire upload process is finished.

```json
{
  "type": "complete",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520100,
  "process": "upload",
  "sourceId": 42,
  "contextLength": 5000
}
```

**Frontend Action:**
- Show status: "Hotovo! 🎉" (Done!)
- Progress: 100%
- Refetch sources list
- Show success toast

---

#### `error`
Emitted if processing fails at any stage.

```json
{
  "type": "error",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520050,
  "process": "upload",
  "error": "AI_TIMEOUT",
  "message": "AI response timed out after 30 seconds"
}
```

**Frontend Action:**
- Show status: "Něco se pokazilo" (Something went wrong)
- Show error message
- Allow retry

---

## 3. AI Chat

### Process Flow
1. User sends message → Backend queues chat job
2. Backend returns `jobId`, `channel`
3. Frontend subscribes to channel
4. Backend sends message to AI
5. AI streams response chunks
6. Response complete

### Event Types

#### `job_started`
Emitted when the chat job starts processing.

```json
{
  "type": "job_started",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520200,
  "process": "chat",
  "model": "gemini-1.5-pro",
  "sourceId": 42
}
```

**Frontend Action:**
- Create empty assistant message
- Show typing indicator: "AI přemýšlí..." (AI is thinking...)

---

#### `chunk`
Emitted as AI generates response text. Multiple chunks sent progressively.

```json
{
  "type": "chunk",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520205,
  "process": "chat",
  "content": "Kvadratická rovnice je..."
}
```

**Frontend Action:**
- Append `content` to assistant message
- Keep typing indicator visible
- Auto-scroll to bottom

---

#### `complete`
Emitted when AI finishes generating the response.

```json
{
  "type": "complete",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520220,
  "process": "chat",
  "totalTokens": 245
}
```

**Frontend Action:**
- Hide typing indicator
- Mark message as complete
- Allow user to send next message

---

#### `error`
Emitted if chat generation fails.

```json
{
  "type": "error",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520210,
  "process": "chat",
  "error": "AI_TIMEOUT",
  "message": "AI did not respond in time"
}
```

**Frontend Action:**
- Show error in message: "Omlouváme se, zkuste to znovu" (Sorry, try again)
- Allow retry

---

## 4. Flashcard Generation

### Process Flow
1. User clicks "Generate flashcards" with count
2. Backend queues job → Returns `jobId`, `channel`
3. Frontend subscribes to channel
4. Backend fetches context, sends to AI
5. AI generates flashcards
6. Flashcards saved to database
7. Frontend fetches flashcards

### Event Types

#### `job_started`
Emitted when flashcard generation begins.

```json
{
  "type": "job_started",
  "jobId": "f1a2s3h4-c5a6-r7d8-9012-345678901234",
  "timestamp": 1736520300,
  "process": "flashcards",
  "sourceId": 42,
  "count": 10
}
```

**Frontend Action:**
- Show status: "Připravujeme kartičky..." (Preparing flashcards...)
- Show progress indicator

---

#### `generating`
Emitted when AI is actively generating flashcards.

```json
{
  "type": "generating",
  "jobId": "f1a2s3h4-c5a6-r7d8-9012-345678901234",
  "timestamp": 1736520310,
  "process": "flashcards"
}
```

**Frontend Action:**
- Show status: "AI tvoří otázky..." (AI is creating questions...)
- Progress: ~50%

---

#### `complete`
Emitted when flashcards are generated and saved.

```json
{
  "type": "complete",
  "jobId": "f1a2s3h4-c5a6-r7d8-9012-345678901234",
  "timestamp": 1736520330,
  "process": "flashcards",
  "sourceId": 42,
  "count": 10
}
```

**Frontend Action:**
- Show status: "Kartičky jsou ready! 🎴" (Flashcards are ready!)
- Fetch flashcards from API
- Navigate to flashcard view

---

#### `error`
Emitted if generation fails.

```json
{
  "type": "error",
  "jobId": "f1a2s3h4-c5a6-r7d8-9012-345678901234",
  "timestamp": 1736520320,
  "process": "flashcards",
  "error": "AI_ERROR",
  "message": "Failed to generate flashcards"
}
```

**Frontend Action:**
- Show error: "Nepodařilo se vytvořit kartičky" (Failed to create flashcards)
- Allow retry

---

## 5. Test Generation

### Process Flow
1. User configures test (question count, difficulty, types)
2. Backend queues job → Returns `jobId`, `channel`
3. Frontend subscribes to channel
4. Backend fetches context, sends to AI
5. AI generates test questions
6. Questions saved to database
7. Frontend fetches test

### Event Types

#### `job_started`
Emitted when test generation begins.

```json
{
  "type": "job_started",
  "jobId": "t1e2s3t4-5678-9012-abcd-ef1234567890",
  "timestamp": 1736520400,
  "process": "test",
  "sourceId": 42,
  "questionCount": 15,
  "difficulty": "medium"
}
```

**Frontend Action:**
- Show status: "Připravujeme test..." (Preparing test...)
- Show progress indicator

---

#### `generating`
Emitted when AI is actively generating test questions.

```json
{
  "type": "generating",
  "jobId": "t1e2s3t4-5678-9012-abcd-ef1234567890",
  "timestamp": 1736520410,
  "process": "test",
  "progress": 40
}
```

**Optional field:**
- `progress` (0-100) - Percentage of questions generated (if backend can estimate)

**Frontend Action:**
- Show status: "AI píše otázky..." (AI is writing questions...)
- Progress: Use provided `progress` or estimate ~50%

---

#### `complete`
Emitted when test is generated and saved.

```json
{
  "type": "complete",
  "jobId": "t1e2s3t4-5678-9012-abcd-ef1234567890",
  "timestamp": 1736520450,
  "process": "test",
  "sourceId": 42,
  "testId": 123,
  "questionCount": 15
}
```

**Frontend Action:**
- Show status: "Test je připraven! 📝" (Test is ready!)
- Fetch test from API
- Navigate to test view

---

#### `error`
Emitted if generation fails.

```json
{
  "type": "error",
  "jobId": "t1e2s3t4-5678-9012-abcd-ef1234567890",
  "timestamp": 1736520430,
  "process": "test",
  "error": "AI_ERROR",
  "message": "Failed to generate test questions"
}
```

**Frontend Action:**
- Show error: "Nepodařilo se vytvořit test" (Failed to create test)
- Allow retry

---

## 6. Error Codes

Standardized error codes across all processes:

| Error Code | Description | User Message |
|-----------|-------------|--------------|
| `AI_TIMEOUT` | AI didn't respond in time | "AI nereaguje, zkuste to prosím znovu" |
| `AI_ERROR` | AI returned an error | "Něco se pokazilo, zkuste to znovu" |
| `CONTEXT_MISSING` | Source has no context | "Zdroj ještě není zpracovaný" |
| `INVALID_REQUEST` | Invalid parameters | "Neplatné zadání" |
| `RATE_LIMIT` | Too many requests | "Příliš mnoho požadavků, zkuste to za chvíli" |
| `INTERNAL_ERROR` | Server error | "Chyba serveru, omlouváme se" |

---

## 7. Channel Naming Convention

**Recommended format:**
```
{process}:job:{jobId}
```

**Examples:**
- `upload:job:550e8400-e29b-41d4-a716-446655440000`
- `chat:job:a1b2c3d4-e5f6-7890-abcd-ef1234567890`
- `flashcards:job:f1a2s3h4-c5a6-r7d8-9012-345678901234`
- `test:job:t1e2s3t4-5678-9012-abcd-ef1234567890`

**Benefits:**
- Clear process identification
- Unique per job
- Easy debugging
- Simple authorization rules

---

## 8. Status Messages (Czech Translations)

Fun but professional status messages for the frontend:

### Upload Process
| State | Message | Icon |
|-------|---------|------|
| `job_started` | "Začínáme..." | ⏳ |
| `extracting` | "Čteme obsah..." | 📖 |
| `generating_context` | "AI přemýšlí..." | 🤔 |
| `chunk` (streaming) | "Vytváříme shrnutí..." | ✨ |
| `complete` | "Hotovo! 🎉" | ✅ |
| `error` | "Něco se pokazilo" | ❌ |

### Chat Process
| State | Message | Icon |
|-------|---------|------|
| `job_started` | "AI přemýšlí..." | 💭 |
| `chunk` (streaming) | *(show typing dots)* | ... |
| `complete` | *(hide indicator)* | - |
| `error` | "Omlouváme se, zkuste to znovu" | 😕 |

### Flashcard Generation
| State | Message | Icon |
|-------|---------|------|
| `job_started` | "Připravujeme kartičky..." | 🎴 |
| `generating` | "AI tvoří otázky..." | ✍️ |
| `complete` | "Kartičky jsou ready!" | 🎉 |
| `error` | "Nepodařilo se vytvořit kartičky" | ❌ |

### Test Generation
| State | Message | Icon |
|-------|---------|------|
| `job_started` | "Připravujeme test..." | 📝 |
| `generating` | "AI píše otázky..." | ✍️ |
| `complete` | "Test je připraven!" | 🎯 |
| `error` | "Nepodařilo se vytvořit test" | ❌ |

---

## 9. Implementation Notes

### Backend
- All events MUST include `type`, `jobId`, `timestamp`, `process`
- Use UUIDs for `jobId` (not timestamps)
- Backend generates `channel` name (not frontend)
- Publish events in order: `job_started` → `generating`/`chunk` → `complete`/`error`
- Always send `complete` OR `error` (never both, never neither)

### Frontend
- Single reusable `JobStatusIndicator` component
- Map event types to status messages via i18n
- Show progress bar for upload (deterministic)
- Show spinner/pulse for generation (indeterminate)
- Auto-dismiss success after 3 seconds
- Keep errors visible (require user dismiss)

---

## 10. Summary Table

Quick reference of all event types per process:

| Process | Event Types |
|---------|-------------|
| **Upload** | `job_started`, `extracting`, `generating_context`, `chunk`, `complete`, `error` |
| **Chat** | `job_started`, `chunk`, `complete`, `error` |
| **Flashcards** | `job_started`, `generating`, `complete`, `error` |
| **Test** | `job_started`, `generating`, `complete`, `error` |

**Common events:** `job_started`, `complete`, `error` (all processes)  
**Progress events:** `chunk` (upload, chat), `generating` (flashcards, test)  
**Upload-only:** `extracting`, `generating_context`

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 1.0 | Initial specification |

