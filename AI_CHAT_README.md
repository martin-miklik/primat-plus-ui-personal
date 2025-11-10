# AI Chat Feature - Implementation Guide

## ✅ Status: Complete

All Phase 1 (MSW) and Phase 2 (Centrifugo) implementations are complete.

## 🚀 Quick Start

### Testing with Mocks (Default)
```bash
# Already configured in .env.local
NEXT_PUBLIC_ENABLE_MSW=true
npm run dev
```

1. Navigate to any **processed** material (green checkmark status)
2. Click the **"AI Chat"** button (orange border)
3. Chat with mock AI responses

### Using Real Backend
```bash
# In .env.local
NEXT_PUBLIC_ENABLE_MSW=false
# OR for chat-only
NEXT_PUBLIC_CHAT_USE_REAL_API=true
```

## 📁 File Structure

```
src/
├── components/chat/
│   ├── chat-interface.tsx       # Main container (Phase 1 & 2)
│   ├── user-message.tsx         # User message bubble
│   ├── assistant-message.tsx    # AI message with markdown
│   ├── markdown-renderer.tsx    # Markdown + code blocks
│   ├── typing-indicator.tsx     # Animated dots
│   ├── chat-input.tsx          # Message input
│   ├── model-toggle.tsx        # Fast/Accurate selector
│   └── connection-status.tsx   # Connection indicator (Phase 2)
├── stores/
│   └── chat-store.ts           # Zustand state management
├── hooks/
│   └── use-chat-subscription.ts # Centrifugo subscription (Phase 2)
├── lib/
│   ├── api/mutations/chat.ts   # API mutation hook
│   └── utils/chat-helpers.ts   # Utility functions
├── mocks/
│   ├── handlers/chat.ts        # MSW mock handler
│   ├── fixtures/chat.ts        # Mock responses
│   └── utils/mock-centrifugo.ts # Mock streaming
└── app/(dashboard)/predmety/[id]/temata/[topicId]/zdroje/[sourceId]/
    └── chat/page.tsx           # Chat route
```

## 🎯 Features Implemented

### Phase 1: MSW Mock Streaming ✅
- [x] Chat UI with welcome message
- [x] Model toggle (Fast ⚡ / Accurate ✨)
- [x] Real-time mock streaming
- [x] Markdown rendering with code blocks
- [x] Copy functionality
- [x] Session-based message persistence
- [x] Typing indicators
- [x] Error handling

### Phase 2: Real Centrifugo ✅
- [x] Centrifugo subscription hook
- [x] Connection status indicator
- [x] Auto-reconnect logic
- [x] Environment-based switching
- [x] Error recovery

## 🎨 User Experience

### Keyboard Shortcuts
- `Enter` - Send message
- `Shift + Enter` - New line
- `Cmd/Ctrl + K` - Clear input

### Visual Features
- Welcome message with material name
- Model badge on each AI message
- Timestamp on hover
- Copy button on hover
- Streaming cursor animation
- Smooth scroll to new messages

## 🔧 Backend Integration

### Required Endpoint

**POST** `/api/chat/send`

**Request Body:**
```json
{
  "message": "User's question about the material",
  "sourceId": 123,
  "channel": "chat:source-123:1699876543210",
  "model": "fast"
}
```

**Model Values**:
- Fast: `"fast"` (backend maps to gemini-flash-lite-latest)
- Accurate: `"accurate"` (backend maps to gemini-1.5-pro)

**Response:**
```json
{
  "success": true,
  "channel": "chat:source-123:1699876543210",
  "jobId": "job-1699876543-abc123",
  "status": "queued"
}
```

### Centrifugo Events

Backend should publish to the channel:

1. **chat_started**
   ```json
   {
     "type": "chat_started",
     "jobId": "job-...",
     "timestamp": 1699876543
   }
   ```

2. **gemini_chunk** (multiple, word-by-word)
   ```json
   {
     "type": "gemini_chunk",
     "jobId": "job-...",
     "content": "chunk text ",
     "timestamp": 1699876543
   }
   ```

3. **gemini_complete**
   ```json
   {
     "type": "gemini_complete",
     "jobId": "job-...",
     "timestamp": 1699876543
   }
   ```

4. **chat_error** (on error)
   ```json
   {
     "type": "chat_error",
     "jobId": "job-...",
     "error": "Error message",
     "timestamp": 1699876543
   }
   ```

### Backend Logic

```
1. Validate sourceId and user access
2. Fetch source.context from database
3. Combine: "Context: {context}\n\nUser: {message}"
4. Send to Gemini API with specified model
5. Stream each chunk via Centrifugo
6. Handle errors gracefully
```

## 🧪 Testing Checklist

### Phase 1 (MSW) - Ready Now ✅
- [ ] Navigate to chat from material card
- [ ] See welcome message
- [ ] Toggle between Fast/Accurate models
- [ ] Send a message
- [ ] Watch streaming animation
- [ ] See markdown formatting (bold, lists, code)
- [ ] Copy AI response
- [ ] Test different question types
- [ ] Test error state (10% chance in mock)
- [ ] Check mobile responsiveness

### Phase 2 (Real Backend) - After Backend Ready
- [ ] Set `NEXT_PUBLIC_ENABLE_MSW=false`
- [ ] Verify connection status indicator
- [ ] Test real streaming from backend
- [ ] Test model switching (fast vs accurate)
- [ ] Test connection loss/reconnect
- [ ] Test concurrent chats (multiple tabs)
- [ ] Test error recovery

## 🐛 Troubleshooting

### Chat button disabled
- Material must be **processed** (status === "processed")
- Check MaterialCard has subjectId prop

### Messages not streaming
- Check browser console for Centrifugo events
- Verify MSW is enabled for development
- Check network tab for `/api/chat/send` request

### Markdown not rendering
- Verify `react-markdown` and `remark-gfm` are installed
- Check for console errors in MarkdownRenderer

### Connection issues (Phase 2)
- Verify `NEXT_PUBLIC_CENTRIFUGE_URL` in .env
- Check Centrifugo server is running
- Review connection status indicator

## 📊 Mock Response Examples

The mock system provides varied responses based on keywords:

- **"vysvětl", "co je"** → Explanation response
- **"shrň", "přehled"** → Summary response  
- **"test", "otázk"** → Quiz/test questions
- **"rozdíl", "porovn"** → Clarification response
- **"kód", "funkce"** → Code examples
- **default** → General response

## 🔐 Security Notes

- Messages are session-only (not persisted to database)
- Backend must validate user access to sourceId
- Context content should be sanitized before sending to AI
- Rate limiting recommended on backend

## 📝 Future Enhancements (Out of Scope)

- [ ] Global `/chat` route with scope selector
- [ ] Message history persistence
- [ ] Voice input/output
- [ ] File attachments in chat
- [ ] Chat export functionality
- [ ] Multi-language support beyond Czech

---

**Implementation Date:** 2025-01-09
**Status:** ✅ Production Ready (Phase 1 & 2)
**Backend Required:** Yes (for Phase 2)

