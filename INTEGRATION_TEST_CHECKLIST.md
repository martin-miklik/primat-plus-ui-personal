# Upload Integration Test Checklist

This document provides a comprehensive checklist for testing the real backend upload integration with Centrifugo real-time streaming.

## Prerequisites

- [ ] Backend server is running at `http://api.primat-plus.localhost`
- [ ] Centrifugo server is running at `ws://localhost:8000/connection/websocket`
- [ ] Redis is running (for message queue)
- [ ] Frontend `.env` has `NEXT_PUBLIC_ENABLE_MSW=false`
- [ ] Backend database is migrated and ready

## File Upload Tests

### Basic File Upload
- [ ] Select a topic from the left sidebar
- [ ] Click "Upload Source" button
- [ ] Upload a PDF file (<50MB)
- [ ] Verify upload card appears with progress bar
- [ ] Verify status changes: `uploading` → `processing`
- [ ] Verify real-time progress updates via Centrifugo
- [ ] Verify status changes to `completed` when done
- [ ] Verify new source appears in the materials list
- [ ] Verify upload card disappears after completion

### File Type Validation
- [ ] Try uploading PDF - should succeed
- [ ] Try uploading DOCX - should succeed
- [ ] Try uploading PPTX - should succeed
- [ ] Try uploading TXT - should succeed
- [ ] Try uploading unsupported file type (e.g., .mp3) - should show error
- [ ] Verify error message is displayed

### File Size Validation
- [ ] Try uploading file >50MB - should show error
- [ ] Verify error message mentions size limit

### Multiple File Upload
- [ ] Upload 2-3 files simultaneously
- [ ] Verify each file has its own upload card
- [ ] Verify each file gets its own Centrifugo channel
- [ ] Verify progress updates independently for each file
- [ ] Verify all files complete successfully

## URL Source Tests

### YouTube Upload
- [ ] Click "Upload Source" button
- [ ] Switch to "YouTube" tab
- [ ] Enter a valid YouTube URL
- [ ] Click upload
- [ ] Verify upload card appears
- [ ] Verify status: `processing`
- [ ] Verify real-time updates via Centrifugo
- [ ] Verify completion and source appears

### Website Upload
- [ ] Click "Upload Source" button
- [ ] Switch to "Website" tab
- [ ] Enter a valid website URL
- [ ] Click upload
- [ ] Verify upload card appears
- [ ] Verify status: `processing`
- [ ] Verify real-time updates via Centrifugo
- [ ] Verify completion and source appears

## Centrifugo Real-Time Updates

### Message Types
- [ ] Verify `processing` message updates status
- [ ] Verify `gemini_chunk` messages show AI generation progress
- [ ] Verify `gemini_complete` message shows near-complete state
- [ ] Verify `completed` message marks upload as done
- [ ] Verify `error` message shows error state
- [ ] Check browser DevTools console for Centrifugo connection logs

### Connection Handling
- [ ] Start upload, then disconnect network - verify reconnection
- [ ] Verify exponential backoff on reconnection attempts
- [ ] Verify updates continue after reconnection
- [ ] Check that subscription is cleaned up after completion

## Error Handling

### Network Errors
- [ ] Disconnect network before upload - verify error message
- [ ] Disconnect network during upload - verify retry/error handling
- [ ] Verify user-friendly error messages

### Backend Errors
- [ ] Stop backend server and try upload - verify error
- [ ] Verify error message is displayed
- [ ] Verify upload card shows error state

### Centrifugo Errors
- [ ] Stop Centrifugo and upload - upload should succeed but no real-time updates
- [ ] Verify graceful degradation without Centrifugo

### Cancel Upload
- [ ] Start upload
- [ ] Click cancel button on upload card
- [ ] Verify upload is removed from list
- [ ] Verify Centrifugo subscription is cleaned up

## Data Integrity

### Source Data
- [ ] Upload file and verify source has correct:
  - [ ] Name (from filename)
  - [ ] Type (pdf, docx, etc.)
  - [ ] File size
  - [ ] Topic ID
  - [ ] Status
  - [ ] Job ID
  - [ ] Created timestamp

### Context Generation
- [ ] After upload completes, check source detail
- [ ] Verify AI-generated context is present
- [ ] Verify context length is correct

## UI/UX Tests

### Upload Dialog
- [ ] Open upload dialog
- [ ] Switch between File/YouTube/Website tabs
- [ ] Verify proper validation on each tab
- [ ] Verify close button works

### Materials List
- [ ] Verify sources are displayed correctly
- [ ] Verify upload cards show proper progress
- [ ] Verify smooth transitions between states
- [ ] Verify empty state shows when no sources

### Topic Switching
- [ ] Start upload in Topic A
- [ ] Switch to Topic B
- [ ] Verify upload continues in background
- [ ] Switch back to Topic A
- [ ] Verify upload card is still visible with progress

## Performance Tests

### Large Files
- [ ] Upload a ~40MB file
- [ ] Verify smooth progress updates
- [ ] Verify no UI freezing

### Multiple Uploads
- [ ] Upload 5+ files at once
- [ ] Verify all complete successfully
- [ ] Verify no memory leaks
- [ ] Check browser DevTools Performance tab

## Browser DevTools Checks

### Console
- [ ] Check for errors in console
- [ ] Verify Centrifugo connection logs
- [ ] Verify no React warnings

### Network Tab
- [ ] Verify POST to `/api/v1/sources` with correct payload
- [ ] Verify WebSocket connection to Centrifugo
- [ ] Verify response format matches expected structure

### Application Tab
- [ ] Check Zustand store (upload-store)
- [ ] Verify files array updates correctly
- [ ] Verify cleanup happens on completion

## Backend Verification

### Database
- [ ] Check `sources` table for new records
- [ ] Verify `status` updates from `uploaded` → `processing` → `processed`
- [ ] Verify `job_id` is set
- [ ] Check `contexts` table for generated content

### File Storage
- [ ] Verify uploaded files exist in `/var/www/html/www/uploads/`
- [ ] Verify filenames are unique (with UUID prefix)

### Logs
- [ ] Check backend logs for processing messages
- [ ] Check Centrifugo logs for published messages
- [ ] Verify no errors in logs

## Edge Cases

### Rapid Actions
- [ ] Upload file, immediately switch topics
- [ ] Upload file, immediately refresh page
- [ ] Upload multiple files, cancel some mid-upload

### Invalid Data
- [ ] Try uploading without selecting topic (shouldn't be possible)
- [ ] Try uploading empty file
- [ ] Try uploading file with no extension

## Cleanup

After testing:
- [ ] Delete test sources from database
- [ ] Delete test files from uploads directory
- [ ] Clear any test data from Redis

## Known Issues / Notes

Document any issues found during testing:

```
Issue: [Description]
Steps to reproduce: [Steps]
Expected: [Expected behavior]
Actual: [Actual behavior]
Severity: [Low/Medium/High/Critical]
```

## Integration Success Criteria

The integration is successful if:
- ✅ All file uploads complete successfully
- ✅ Real-time progress updates work via Centrifugo
- ✅ Error handling is graceful and user-friendly
- ✅ No console errors or warnings
- ✅ UI remains responsive during uploads
- ✅ Data integrity is maintained
- ✅ Backend processing completes and generates context

