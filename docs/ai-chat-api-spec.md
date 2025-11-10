# AI Chat - Frontend-Backend Communication Specification

## Overview
This document specifies the communication protocol between the frontend and backend for the AI Chat feature. The chat operates in a request-response pattern with real-time streaming via Centrifugo.

---

## 1. Send Message Endpoint

### `POST /api/v1/chat/send`

Initiates a new AI chat message and queues it for processing.

#### Request Body
```json
{
  "message": "string",     // User's message (required)
  "sourceId": number,      // ID of the source/material (required)
  "model": "fast" | "accurate"  // AI model selection (required)
}
```

#### Response (Success - 200)
```json
{
  "success": true,
  "jobId": "string",       // Unique job identifier (UUID or similar)
  "channel": "string",     // Centrifugo channel to subscribe to
  "status": "queued"       // Job status
}
```

#### Response (Error - 4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "string",      // Error code (e.g., "SOURCE_NOT_FOUND", "INVALID_MODEL")
    "message": "string"    // Human-readable error message
  }
}
```

#### Example Request
```json
{
  "message": "Co je to kvadratická rovnice?",
  "sourceId": 1,
  "model": "fast"
}
```

#### Example Response
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "channel": "chat:job:550e8400-e29b-41d4-a716-446655440000",
  "status": "queued"
}
```

---

## 2. Centrifugo Real-time Events

After receiving the response from `/api/v1/chat/send`, the frontend subscribes to the returned `channel` to receive streaming updates.

### Channel Naming Convention
**Backend-generated (recommended):**
```
chat:job:{jobId}
```

Example: `chat:job:550e8400-e29b-41d4-a716-446655440000`

### Event Types

All events published to the channel have this base structure:
```typescript
interface ChatEvent {
  type: "chat_started" | "gemini_chunk" | "gemini_complete" | "chat_error";
  jobId: string;
  timestamp: number;  // Unix timestamp in milliseconds
  // ... additional fields depending on type
}
```

---

### Event 1: `chat_started`
Sent when the job is picked up from the queue and processing begins.

```json
{
  "type": "chat_started",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520812638,
  "model": "gemini-flash-lite-latest",  // Actual backend model used
  "sourceId": 1
}
```

**Frontend Action:**
- Create a new assistant message in the UI with status "streaming"
- Show typing indicator

---

### Event 2: `gemini_chunk`
Sent multiple times as the AI generates the response (streaming).

```json
{
  "type": "gemini_chunk",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520812650,
  "content": "Kvadratická rovnice je "  // Text chunk to append
}
```

**Frontend Action:**
- Append `content` to the assistant message
- Keep status as "streaming"
- Auto-scroll to bottom

---

### Event 3: `gemini_complete`
Sent when the AI finishes generating the complete response.

```json
{
  "type": "gemini_complete",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520815420,
  "totalTokens": 150  // Optional: token usage stats
}
```

**Frontend Action:**
- Set assistant message status to "complete"
- Hide typing indicator
- Allow user to send new messages
- Unsubscribe from the channel (optional)

---

### Event 4: `chat_error`
Sent if an error occurs during processing.

```json
{
  "type": "chat_error",
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": 1736520813000,
  "error": "AI_TIMEOUT",           // Error code
  "message": "AI response timeout" // Human-readable message
}
```

**Frontend Action:**
- Set assistant message status to "error"
- Display error message to user
- Allow retry
- Unsubscribe from the channel

---

## 3. Frontend Flow

### Complete Interaction Flow

```
1. User types message and clicks send
   ↓
2. Frontend: POST /api/v1/chat/send
   ├─ Request: { message, sourceId, model }
   └─ Response: { jobId, channel, status: "queued" }
   ↓
3. Frontend: Subscribe to Centrifugo channel
   ↓
4. Backend: Process message (async)
   ├─ Fetch source context from DB
   ├─ Send to AI service (Gemini)
   └─ Stream response chunks to Centrifugo
   ↓
5. Frontend: Receive events
   ├─ chat_started → Show "AI is typing..."
   ├─ gemini_chunk → Append text progressively
   ├─ gemini_chunk → Append text progressively
   ├─ gemini_chunk → Append text progressively
   └─ gemini_complete → Finalize message
   ↓
6. Frontend: Unsubscribe from channel
   ↓
7. User can send next message (repeat)
```

---

## 4. Error Handling

### HTTP Errors

| Status Code | Scenario | Frontend Action |
|------------|----------|-----------------|
| 400 | Invalid request (missing fields, invalid model) | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 404 | Source not found | Show "Source not found" error |
| 429 | Rate limit exceeded | Show "Too many requests" with retry timer |
| 500 | Server error | Show generic error, allow retry |

### Centrifugo Errors

| Scenario | Frontend Action |
|----------|-----------------|
| Connection lost | Show "Connection lost" indicator, auto-reconnect |
| Subscription failed | Retry subscription with exponential backoff |
| Stream timeout (no events for 30s) | Show timeout error, allow retry |
| `chat_error` event | Display error message, allow retry |

---

## 5. Model Mapping

### Frontend Models
- `"fast"` - Quick responses (e.g., simple questions)
- `"accurate"` - Detailed, high-quality responses

### Backend Models (Gemini)
Backend maps these to actual Gemini models:
- `"fast"` → `gemini-flash-lite-latest` or similar
- `"accurate"` → `gemini-1.5-pro` or similar

**Note:** Backend is responsible for model mapping. Frontend only sends `"fast"` or `"accurate"`.

---

## 6. Data Persistence

### Frontend
- **Session-only:** Messages stored in Zustand with localStorage persistence
- **Cleared on:** Browser close/clear storage
- **Scope:** Per source ID

### Backend
- **No persistence:** Chat messages are NOT saved to database (MVP)
- **Job queue:** Messages queued in Symfony Messenger, processed once
- **Centrifugo events:** Ephemeral, not stored

---

## 7. Security Considerations

### Authorization
- All requests require valid authentication token (JWT)
- User must have access to the specified `sourceId`
- Backend validates source ownership

### Rate Limiting
- Limit chat requests per user (e.g., 10 messages per minute)
- Return `429 Too Many Requests` if exceeded

### Input Validation
- Max message length: 2000 characters
- Sanitize input to prevent injection attacks
- Validate `sourceId` exists and user has access

---

## 8. Testing Strategy

### MSW (Mock Service Worker) - Phase 1
During development, frontend uses MSW to mock:
1. `/api/v1/chat/send` endpoint (returns mock jobId + channel)
2. Centrifugo streaming (simulated via `mock-centrifugo.ts` utility)

**MSW Mock Response:**
```json
{
  "success": true,
  "jobId": "mock-job-123",
  "channel": "chat:source-1:1736520812638",
  "status": "queued"
}
```

**MSW Simulated Events:**
```typescript
// Simulate streaming with delays
setTimeout(() => emitEvent({ type: "chat_started", ... }), 500);
setTimeout(() => emitEvent({ type: "gemini_chunk", content: "Text..." }), 1000);
setTimeout(() => emitEvent({ type: "gemini_complete", ... }), 3000);
```

### Real Backend - Phase 2
When backend is ready:
1. Set `NEXT_PUBLIC_ENABLE_MSW=false` or `NEXT_PUBLIC_CHAT_USE_REAL_API=true`
2. Frontend connects to real Centrifugo client
3. Test end-to-end flow

---

## 9. Open Questions / Decisions Needed

### 🔴 Channel Naming: Who Generates?

**Current Implementation (Frontend-generated):**
```typescript
// Frontend generates channel
const channel = `chat:source-${sourceId}:${Date.now()}`;

// Frontend sends it to backend
POST /api/v1/chat/send { message, sourceId, channel, model }

// Frontend subscribes to same channel
centrifuge.subscribe(channel);
```

**Recommended (Backend-generated):**
```typescript
// Frontend sends message
POST /api/v1/chat/send { message, sourceId, model }

// Backend responds with generated channel
Response: { jobId, channel: "chat:job:{jobId}", status: "queued" }

// Frontend subscribes to backend-provided channel
centrifuge.subscribe(response.channel);
```

**Decision:** Backend should generate the channel name based on `jobId` to ensure uniqueness and prevent conflicts.

**Action Required:**
1. ✅ Backend: Generate `jobId` (UUID)
2. ✅ Backend: Return `channel: "chat:job:{jobId}"` in response
3. ✅ Backend: Publish events to `chat:job:{jobId}` channel
4. ❌ Frontend: Remove `generateChatChannel()` function (DEPRECATED)
5. ❌ Frontend: Remove `channel` from request body
6. ❌ Frontend: Use `response.channel` from backend for subscription

---

## 10. Implementation Checklist

### Frontend
- [x] Chat UI with message list
- [x] Markdown rendering (react-markdown + remark-gfm)
- [x] Model toggle (Fast / Accurate)
- [x] Send message mutation
- [x] Centrifugo subscription hook
- [x] Event handling (chat_started, gemini_chunk, gemini_complete, chat_error)
- [x] Error handling and retry logic
- [x] MSW mock handlers
- [x] Loading and streaming states
- [ ] Remove `generateChatChannel()` (use backend channel)
- [ ] Remove `channel` from request body

### Backend
- [ ] `POST /api/v1/chat/send` endpoint
  - [ ] Accept `message`, `sourceId`, `model`
  - [ ] Generate unique `jobId` (UUID)
  - [ ] Fetch source context from database
  - [ ] Queue job in Symfony Messenger
  - [ ] Return `{ jobId, channel, status: "queued" }`
- [ ] Job processor (Symfony Messenger handler)
  - [ ] Pick job from queue
  - [ ] Publish `chat_started` event
  - [ ] Call Gemini API with streaming
  - [ ] Publish `gemini_chunk` events progressively
  - [ ] Publish `gemini_complete` on success
  - [ ] Publish `chat_error` on failure
- [ ] Centrifugo integration
  - [ ] Configure Centrifugo server
  - [ ] Implement publish service
  - [ ] Generate JWT tokens for channel authorization
- [ ] Authorization & validation
  - [ ] Verify user has access to `sourceId`
  - [ ] Validate message length
  - [ ] Rate limiting

---

## 11. Example: Complete Request-Response Cycle

### Step 1: Frontend sends message
```http
POST /api/v1/chat/send
Content-Type: application/json
Authorization: Bearer {jwt-token}

{
  "message": "Vysvětli mi pojem funkce.",
  "sourceId": 42,
  "model": "accurate"
}
```

### Step 2: Backend queues job
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "channel": "chat:job:a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "queued"
}
```

### Step 3: Frontend subscribes to channel
```typescript
centrifuge.subscribe("chat:job:a1b2c3d4-e5f6-7890-abcd-ef1234567890");
```

### Step 4: Backend publishes events

**Event 1: Job started (after ~200ms)**
```json
{
  "type": "chat_started",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520812800,
  "model": "gemini-1.5-pro",
  "sourceId": 42
}
```

**Event 2-N: Streaming chunks (every ~100ms)**
```json
{
  "type": "gemini_chunk",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520813000,
  "content": "Funkce je "
}
```
```json
{
  "type": "gemini_chunk",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520813100,
  "content": "matematický vztah,"
}
```
```json
{
  "type": "gemini_chunk",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520813200,
  "content": " který každému vstupnímu prvku..."
}
```

**Event N+1: Completion**
```json
{
  "type": "gemini_complete",
  "jobId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": 1736520815000,
  "totalTokens": 245
}
```

### Step 5: Frontend displays complete response
Frontend has progressively built the full response:
```
"Funkce je matematický vztah, který každému vstupnímu prvku..."
```

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-10 | 1.0 | Initial specification |


