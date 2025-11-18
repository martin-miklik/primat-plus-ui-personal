# WebSocket Testing Guide

## Overview

This guide helps you test the WebSocket infrastructure on both Linux and WSL environments to ensure proper connectivity with the backend.

## Configuration

### Environment Variables

Ensure your `.env.local` has the correct WebSocket URL:

```bash
# For local development
NEXT_PUBLIC_CENTRIFUGE_URL=ws://api.primat-plus.localhost/connection/websocket

# For production (reference)
# NEXT_PUBLIC_CENTRIFUGE_URL=wss://primat.bepositive.cz/connection/websocket
```

### Backend Configuration

Ensure your backend project (`~/work/primat-plus-be/primat-plus`) is properly configured:

1. Copy `app/config/local.neon.example` to `app/config/local.neon`
2. Update Centrifugo settings in `local.neon`:

```neon
centrifugo:
    api_url: 'http://centrifugo:8000/api'
    api_key: 'centrifugo-api-key-2024'
    token_secret: 'centrifugo-api-key-2024'
    token_ttl: 3600
```

3. Rebuild Docker containers:

```bash
cd ~/work/primat-plus-be/primat-plus
docker-compose up -d --build
```

## Testing Checklist

### 1. Connection Test

Open browser console and watch for Centrifuge connection logs:

```
[Centrifuge] Connecting...
[Centrifuge] Connected
```

**Expected Result:** Connection should be established within 5 seconds.

### 2. Upload with WebSocket Progress

**Steps:**
1. Navigate to a topic
2. Click "Upload Material"
3. Upload a PDF file
4. Watch the MaterialCard for progress updates

**Expected Events (check console logs):**
- `job_started` - Upload begins
- `extracting` - Content extraction (optional)
- `generating_context` - AI processing starts
- `chunk` - AI streaming (multiple events)
- `complete` - Processing finished

**UI Verification:**
- Progress indicator shows increasing percentages
- Status messages change: "Začínáme..." → "Zpracováváme soubor..." → "Hotovo! 🎉"
- Card updates to show source actions when complete

### 3. Flashcard Generation with WebSocket

**Steps:**
1. Navigate to a processed source's flashcards page
2. Click "Vygenerovat kartičky"
3. Enter count (e.g., 5) and submit
4. Watch the JobStatusIndicator

**Expected Events:**
- `job_started` - Generation queued
- `generating` - AI creating flashcards
- `complete` - Flashcards ready

**UI Verification:**
- Dialog closes immediately after submit
- JobStatusIndicator appears with progress
- Flashcards grid updates when complete
- Success toast: "Kartičky byly úspěšně vygenerovány!"

### 4. Error Handling

**Test Error Scenarios:**
1. **Network Disconnection**: Disable network briefly
   - Expected: Auto-reconnect with exponential backoff
   - Console: "Disconnected" → "Connecting..." → "Connected"

2. **Invalid Job**: Trigger a backend error
   - Expected: Error event received
   - UI: Red error indicator with message
   - Toast: Error notification

3. **Timeout**: Let a job run beyond timeout
   - Expected: `AI_TIMEOUT` error
   - Message: "AI nereaguje, zkuste to prosím znovu"

## Platform-Specific Testing

### Linux (Native)

**Setup:**
```bash
# Check DNS resolution
ping api.primat-plus.localhost

# Check Docker network
docker network ls
docker network inspect primat-plus_default
```

**Common Issues:**
- DNS not resolving: Add to `/etc/hosts`:
  ```
  127.0.0.1 api.primat-plus.localhost
  ```

### WSL (Windows Subsystem for Linux)

**Setup:**
```bash
# Check WSL version
wsl --version

# Check network connectivity
curl -I http://api.primat-plus.localhost

# If using WSL2, check network mode
cat /etc/wsl.conf
```

**Common Issues:**

1. **DNS Resolution in WSL:**
   - WSL may not resolve `.localhost` domains properly
   - Solution: Add to `/etc/hosts` in WSL:
     ```bash
     echo "127.0.0.1 api.primat-plus.localhost" | sudo tee -a /etc/hosts
     ```

2. **WebSocket Connection Failed:**
   - WSL network isolation can block WebSocket connections
   - Solution A: Use Windows host IP instead:
     ```bash
     # In WSL, get Windows host IP
     cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
     
     # Update .env.local with that IP
     NEXT_PUBLIC_CENTRIFUGE_URL=ws://<WINDOWS_IP>:8000/connection/websocket
     ```
   
   - Solution B: Use Docker Desktop with WSL2 backend
   - Solution C: Run backend natively on Windows instead of WSL

3. **Firewall Blocking:**
   - Windows Firewall may block WSL connections
   - Solution: Allow Docker and Node.js through Windows Firewall

## Debugging

### Browser DevTools

**Console Logs:**
- Look for `[Centrifuge]` and `[JobSubscription]` prefixed logs
- Check for connection state changes
- Verify event types match spec

**Network Tab:**
- Filter by "WS" (WebSocket)
- Check WebSocket connection to `api.primat-plus.localhost/connection/websocket`
- Inspect frames: should see JSON events

### Backend Logs

```bash
cd ~/work/primat-plus-be/primat-plus
docker-compose logs -f app

# Look for:
# - "Flashcard generation queued"
# - "Published flashcard event"
# - Centrifugo publish confirmations
```

### Centrifugo Logs

```bash
docker-compose logs -f centrifugo

# Look for:
# - Client connections
# - Channel subscriptions
# - Published messages
```

## Performance Metrics

**Expected Performance:**
- Connection time: < 5 seconds
- Event latency: < 200ms
- Reconnection: < 10 seconds (with backoff)
- Upload processing: 10-30 seconds (depending on file size)
- Flashcard generation: 5-15 seconds (5 cards)

## Troubleshooting

### WebSocket Connection Refused

**Symptoms:**
- Console: "WebSocket connection failed"
- No `[Centrifuge] Connected` log

**Solutions:**
1. Verify backend is running: `docker ps | grep centrifugo`
2. Check WebSocket URL is correct in `.env.local`
3. Test direct WebSocket connection:
   ```bash
   wscat -c ws://api.primat-plus.localhost/connection/websocket
   ```
4. Check if port 8000 is accessible

### Events Not Received

**Symptoms:**
- Progress stuck at 0%
- No console logs after `job_started`

**Solutions:**
1. Check channel name format: `flashcards:job:{jobId}`
2. Verify backend is publishing events (check backend logs)
3. Check Centrifugo configuration
4. Verify subscription is active: `isSubscribed` should be `true`

### Progress Not Updating

**Symptoms:**
- Events received but UI not updating
- Progress bar stuck

**Solutions:**
1. Check React Query invalidation is working
2. Verify state updates in `useJobSubscription`
3. Check component re-renders with React DevTools
4. Ensure `enabled` prop is `true` on subscription

## Success Criteria

✅ **Connection:**
- WebSocket connects successfully on both platforms
- Auto-reconnects after disconnection

✅ **Upload:**
- Progress updates smoothly from 0% to 100%
- All event types received in order
- MaterialCard shows processing overlay
- Source appears in list when complete

✅ **Flashcards:**
- Dialog closes after submit
- JobStatusIndicator shows with real-time updates
- Flashcards appear in grid when complete
- Success toast displayed

✅ **Error Handling:**
- Errors show appropriate messages
- UI returns to normal state after error
- Can retry after error

✅ **Platform Compatibility:**
- Works on native Linux
- Works on WSL with proper configuration
- No proxy issues

## Next Steps

After successful testing:

1. Document any platform-specific issues found
2. Update configuration examples if needed
3. Consider adding health check endpoint for WebSocket
4. Set up monitoring for production WebSocket connections

## Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review backend logs
3. Test with `wscat` for direct WebSocket testing
4. Verify network configuration (especially in WSL)
5. Check firewall settings

---

**Last Updated:** 2025-01-12
**WebSocket Spec Version:** 1.0 (see `docs/websocket-states-spec.md`)




