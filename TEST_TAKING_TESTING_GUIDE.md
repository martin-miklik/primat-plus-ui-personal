# Test Taking Feature - Testing Guide

## Overview
This document outlines the testing scenarios for the enhanced test-taking experience. All critical bugs have been fixed and new features have been implemented.

## What Was Implemented

### ✅ Fixed Issues
1. **Navigation Controls** - Proper restrictions based on review mode
2. **WebSocket Integration** - Real-time AI evaluation for open-ended questions
3. **Answer Display** - Full answer text shown instead of "a,c,d"
4. **Form Reset** - Previous selections no longer persist when navigating
5. **Auto-Advance Bug** - Fixed double-jump issue with debouncing
6. **UI Layout** - Progress and navigation dots moved to top for stability

### ✅ New Features
1. **Open-ended evaluation component** with real-time WebSocket feedback
2. **Navigation restrictions** for "during" mode
3. **Auto-advance control** - Only in "during" mode with correct answers
4. **Debounced navigation** - Prevents rapid clicking bugs
5. **Visual indicators** - Auto-advance countdown, disabled states

## Testing Scenarios

### 1. "During" Mode - Navigation Restrictions ⚠️

**Setup**: Create a test with reviewMode = "during"

**Test Cases**:
- [ ] Cannot click dot navigation before answering current question
- [ ] Cannot click Next/Prev buttons before answering
- [ ] Info message appears: "Nejprve zodpovězte současnou otázku..."
- [ ] After answering, can navigate to any answered question
- [ ] Can navigate to next unanswered question
- [ ] Cannot skip ahead to unanswered questions beyond the next one

### 2. "After" Mode - Free Navigation ✓

**Setup**: Create a test with reviewMode = "after"

**Test Cases**:
- [ ] Can click any dot to jump to any question
- [ ] Can use Next/Prev freely
- [ ] Can answer questions in any order
- [ ] No navigation restrictions

### 3. Auto-Advance Behavior 🔄

**"During" Mode**:
- [ ] Correct answer triggers 2-second auto-advance
- [ ] "Automaticky pokračuji..." message appears
- [ ] All navigation disabled during countdown
- [ ] Cannot manually navigate during auto-advance
- [ ] Auto-advance completes smoothly

**"After" Mode**:
- [ ] No auto-advance at all
- [ ] User controls navigation completely

### 4. Form Reset Between Questions 🔄

**Test Cases**:
- [ ] Navigate to Q1, select option A
- [ ] Navigate to Q2, verify no selection
- [ ] Navigate back to Q1, verify option A still selected
- [ ] Navigate to Q3, verify no selection
- [ ] Test with multiple-choice (checkboxes)
- [ ] Test with true/false buttons
- [ ] Test with open-ended textarea

### 5. Open-Ended Questions with WebSocket ("During" Mode) 🌐

**Setup**: Test with open-ended questions in "during" mode

**Test Cases**:
- [ ] Submit answer, see "AI vyhodnocuje vaši odpověď"
- [ ] Loading spinner and status messages appear
- [ ] Evaluation completes within 30 seconds
- [ ] Score and feedback displayed correctly
- [ ] If correct, auto-advance after 2 seconds
- [ ] If incorrect, can manually navigate
- [ ] Timeout after 30 seconds shows error message

**Error Scenarios**:
- [ ] WebSocket connection fails - shows error
- [ ] Backend returns error - handled gracefully
- [ ] Network interruption during evaluation

### 6. Answer Display in Results 📊

**Test Cases**:
- [ ] Single choice: Shows full option text, not just "a"
- [ ] Multiple choice: Shows "Option A text, Option C text", not "a,c"
- [ ] True/false: Shows "Pravda" or "Nepravda"
- [ ] Open-ended: Shows full text answer
- [ ] All answer types display correctly in results page

### 7. Double-Jump Bug Fix 🐛

**Test Cases**:
- [ ] Rapidly click Next button - only advances once
- [ ] Click Next while auto-advancing - doesn't double jump
- [ ] Click dots rapidly - handles gracefully
- [ ] During auto-advance, buttons are disabled
- [ ] 300ms debounce prevents double navigation

### 8. UI Layout and Stability 🎨

**Test Cases**:
- [ ] Progress bar stays at top, doesn't jump
- [ ] Navigation dots at top, not bottom
- [ ] Content area doesn't shift when answering
- [ ] Smooth transitions between questions
- [ ] Auto-advance indicator shows countdown
- [ ] Disabled states are visually clear

### 9. Complete Test Flow 🏁

**Full "During" Mode Test**:
1. [ ] Start test
2. [ ] Answer Q1 correctly - auto-advances
3. [ ] Try to skip ahead - blocked
4. [ ] Answer Q2 incorrectly - feedback shown, no auto-advance
5. [ ] Navigate back to Q1 - can review
6. [ ] Answer remaining questions
7. [ ] Complete test
8. [ ] View results with correct answer displays

**Full "After" Mode Test**:
1. [ ] Start test
2. [ ] Jump to Q5 using dots
3. [ ] Answer Q5
4. [ ] Jump back to Q1
5. [ ] Answer questions in random order
6. [ ] Try to complete without answering all - blocked
7. [ ] Answer all questions
8. [ ] Complete test
9. [ ] View results after completion

### 10. Edge Cases 🔍

- [ ] Test with 1 question
- [ ] Test with maximum questions (50)
- [ ] Test with only open-ended questions
- [ ] Test with mixed question types
- [ ] Refresh page mid-test (should preserve state)
- [ ] Network disconnection during test
- [ ] Multiple open-ended evaluations in sequence
- [ ] Browser back button during test
- [ ] Complete test with some unanswered (if allowed)

## Performance Checks ⚡

- [ ] Navigation responds instantly (<100ms)
- [ ] No UI jank when switching questions
- [ ] WebSocket connects quickly (<2s)
- [ ] Open-ended evaluation completes <30s
- [ ] No memory leaks during long tests
- [ ] Page doesn't slow down with many questions

## Accessibility ✓

- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Screen reader announces question changes
- [ ] Disabled buttons are properly announced
- [ ] Progress dots have aria-labels
- [ ] Color contrast is sufficient

## Browser Compatibility 🌐

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

## Known Limitations

1. **WebSocket reconnection**: If connection drops during open-ended evaluation, user may need to retry
2. **Auto-advance timing**: Fixed at 2 seconds, not configurable
3. **Timeout duration**: Fixed at 30 seconds for open-ended evaluation

## Regression Checks

Ensure these existing features still work:
- [ ] Test generation
- [ ] Test instance creation
- [ ] Test results page
- [ ] Test history
- [ ] All question types render correctly
- [ ] Feedback display in "during" mode
- [ ] Results display in "after" mode

## Success Criteria ✅

The implementation is successful if:
- ✅ All navigation restrictions work as specified
- ✅ No double-jump bugs occur
- ✅ Forms reset properly between questions
- ✅ Full answer text displays in results
- ✅ Open-ended WebSocket evaluation works
- ✅ UI is stable and doesn't jump
- ✅ Auto-advance behavior is correct per mode
- ✅ All edge cases handled gracefully

## Testing Status

- ⏳ Awaiting manual testing
- 🔧 Implementation: Complete
- 📝 Documentation: Complete

## Next Steps

1. Run through all test scenarios manually
2. Report any bugs found
3. Verify fixes for reported bugs
4. Get user acceptance
5. Deploy to production




