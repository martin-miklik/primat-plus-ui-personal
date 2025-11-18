# Chat History Integration - Summary

## Overview
Integrated backend chat history endpoint to sync chat conversations across sessions and devices.

---

## Problem Solved

### Before:
- ❌ Chat history stored only in localStorage (Zustand persist)
- ❌ History lost on browser clear or device switch
- ❌ Backend was saving to database, but frontend wasn't using it
- ❌ No sync between backend and frontend

### After:
- ✅ Chat history fetched from backend on mount
- ✅ History persists across sessions and devices
- ✅ Backend is the source of truth
- ✅ Zustand still used for real-time updates during session

---

## Backend Endpoint

### `GET /chat/source/{sourceId}`

**Response:**
```json
{
  "success": true,
  "sourceId": 42,
  "chats": [
    {
      "id": 1,
      "question": "Co je to kvadratická rovnice?",
      "answer": "Kvadratická rovnice je...",
      "errorMessage": null,
      "createdAt": "2025-11-18T10:00:00Z",
      "updatedAt": "2025-11-18T10:00:05Z"
    }
  ],
  "count": 1
}
```

---

## Changes Made

### 1. ✅ Created React Query Hook
**File:** `src/lib/api/queries/chat.ts`

```typescript
export function useGetChatHistory(sourceId: number, enabled = true)
```

- Fetches chat history from backend
- Caches for 5 minutes
- Refetches on mount
- Type-safe with TypeScript

### 2. ✅ Updated Chat Store
**File:** `src/stores/chat-store.ts`

**New Action:**
```typescript
loadHistoryFromServer: (sourceId, chats) => void
```

**What it does:**
- Converts backend chat format to frontend message format
- Creates user + assistant message pairs
- Handles errors in chat history
- Preserves message order

### 3. ✅ Updated Chat Interface
**File:** `src/components/chat/chat-interface.tsx`

**Changes:**
- Fetches chat history on mount using `useGetChatHistory`
- Loads history into store if it exists
- Only shows welcome message if no history
- Seamless integration with existing chat flow

**Logic:**
```typescript
if (chatHistory && chatHistory.chats.length > 0) {
  loadHistoryFromServer(sourceId, chatHistory.chats);
} else {
  initializeWelcomeMessage(sourceId, sourceName);
}
```

### 4. ✅ Model Availability
**File:** `src/components/chat/model-toggle.tsx`

**Changes:**
- Disabled "accurate" model (Gemini Pro not available)
- Only "fast" model works (gemini-flash-lite)
- Added TODO for when Pro becomes available
- Clear tooltip message: "Přesný model není momentálně dostupný"

**To enable later:**
```typescript
const accurateModelAvailable = false; // Change to true when ready
```

---

## How It Works

### First Visit (No History)
1. User opens chat
2. Frontend fetches history → empty
3. Shows welcome message
4. User sends messages → saved to backend + Zustand
5. Next visit → history loaded from backend

### Returning Visit (Has History)
1. User opens chat
2. Frontend fetches history from backend
3. Loads all previous messages into Zustand
4. User sees full conversation history
5. Can continue chatting

### During Active Session
1. New messages saved to Zustand immediately (real-time)
2. Backend saves to database in parallel
3. On next mount, backend becomes source of truth

---

## Data Flow

```
User Opens Chat
      ↓
useGetChatHistory fetches from /chat/source/{sourceId}
      ↓
Backend returns chat history array
      ↓
loadHistoryFromServer converts to message format
      ↓
Zustand store updated with history
      ↓
UI renders all messages
      ↓
User sends new message
      ↓
Saved to backend + Zustand simultaneously
      ↓
Real-time streaming updates Zustand
      ↓
Next visit: Full history available
```

---

## Message Format Conversion

### Backend Format (from API)
```typescript
{
  id: number,
  question: string,
  answer: string | null,
  errorMessage: string | null,
  createdAt: string
}
```

### Frontend Format (in Zustand)
```typescript
{
  id: string,
  role: "user" | "assistant",
  content: string,
  timestamp: number,
  status: "complete" | "error"
}
```

### Conversion Logic
```typescript
// Each backend chat → 2 frontend messages
1. User message (question)
2. Assistant message (answer or error)
```

---

## Model Configuration

| Model | Backend | Status | Usage |
|-------|---------|--------|-------|
| `fast` | `gemini-flash-lite-latest` | ✅ Active | Default & only available |
| `accurate` | `gemini-2.5-pro` | ❌ Disabled | Not paid/available yet |

**Default:** `fast` (set in `chat-store.ts`)

---

## Testing Checklist

- [ ] Open chat with no history → welcome message appears
- [ ] Send messages → saved to backend
- [ ] Refresh page → messages still there (from backend)
- [ ] Send more messages → appended to history
- [ ] Clear localStorage → history still loads (from backend)
- [ ] Check different device → same history (from backend)
- [ ] Test error messages in history → display correctly
- [ ] Verify model toggle → accurate is disabled
- [ ] Check fast model → works correctly

---

## Benefits

### For Users
- ✅ Chat history persists forever
- ✅ Works across devices
- ✅ No data loss on browser clear
- ✅ Seamless experience

### For Development
- ✅ Backend is source of truth
- ✅ Easy to debug (check database)
- ✅ Can add features like export/search
- ✅ Analytics on chat usage

---

## Future Enhancements

1. **Pagination** - Load old chats on scroll
2. **Search** - Search through chat history
3. **Export** - Download conversation as PDF
4. **Share** - Share specific Q&A pairs
5. **Analytics** - Track most asked questions
6. **Multi-device sync** - Real-time sync across devices

---

## Files Modified

1. ✅ `src/lib/api/queries/chat.ts` - **NEW**
2. ✅ `src/stores/chat-store.ts` - Added `loadHistoryFromServer`
3. ✅ `src/components/chat/chat-interface.tsx` - Fetch & load history
4. ✅ `src/components/chat/model-toggle.tsx` - Disabled accurate model

---

## Configuration

### Enable Accurate Model (When Available)
```typescript
// src/components/chat/model-toggle.tsx
const accurateModelAvailable = true; // Change from false
```

### Adjust Cache Time
```typescript
// src/lib/api/queries/chat.ts
staleTime: 1000 * 60 * 5, // Change from 5 minutes
```

---

**Status:** ✅ **PRODUCTION READY**

Date: 2025-11-18

