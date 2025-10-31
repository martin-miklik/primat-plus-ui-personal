# 🧪 Subjects CRUD - Testing Guide

## Quick Start

The development server is already running at: **http://localhost:3000**

Navigate to: **http://localhost:3000/subjects**

---

## ✅ Testing Checklist

### 1. Initial Load (Loading State)
- [ ] Page shows 8 skeleton cards in grid layout
- [ ] Skeletons match card dimensions
- [ ] Transition to real data is smooth

### 2. Subjects Grid
- [ ] 8 mock subjects display correctly
- [ ] Each card shows: icon, name, description, topic count, material count
- [ ] Cards animate in with stagger effect (50ms delay between cards)
- [ ] Grid adjusts to screen size:
  - **Desktop (≥1024px)**: 4 columns
  - **Tablet (768-1023px)**: 2 columns
  - **Mobile (<768px)**: 1 column

### 3. Create Subject
1. Click **"Vytvořit předmět"** button (top right)
2. Dialog opens with form
3. Test validation:
   - [ ] Leave name empty → shows error
   - [ ] Enter long name (>100 chars) → shows error
4. Fill in form:
   - [ ] Enter name (e.g., "TestSubject")
   - [ ] Enter description (optional)
   - [ ] Select a color from palette (12 colors available)
   - [ ] Select an emoji from picker (24 educational emojis)
5. Click **"Vytvořit předmět"**
6. Verify:
   - [ ] Loading state: button shows "Vytváření..."
   - [ ] Success toast appears
   - [ ] Dialog closes automatically
   - [ ] New subject appears in grid **immediately** (optimistic update)
   - [ ] Subject card animates in

### 4. Edit Subject
1. Find any subject card in the grid
2. Click the **⋮** (three dots) button on the card
3. Click **"Upravit"** from dropdown
4. Verify dialog:
   - [ ] Dialog opens with "Upravit předmět" title
   - [ ] Form is pre-filled with existing data
   - [ ] Name field has current name
   - [ ] Description field has current description
   - [ ] Selected color is highlighted
   - [ ] Selected emoji is highlighted
5. Make changes:
   - [ ] Change name
   - [ ] Modify description
   - [ ] Select different color
   - [ ] Select different emoji
6. Click **"Uložit změny"**
7. Verify:
   - [ ] Loading state: button shows "Ukládání..."
   - [ ] Changes appear **immediately** on card (optimistic update)
   - [ ] Success toast appears
   - [ ] Dialog closes
   - [ ] Card reflects all changes

### 5. Delete Subject
1. Click the **⋮** button on any card
2. Click **"Smazat"** from dropdown (red/destructive option)
3. Verify confirmation dialog:
   - [ ] Shows "Smazat předmět" title
   - [ ] Alert icon visible (warning triangle)
   - [ ] Shows subject preview (icon, name, description)
   - [ ] Shows warning message about cascading delete
   - [ ] Two buttons: "Zrušit" (outline) and "Smazat předmět" (destructive)
4. Click **"Zrušit"** → dialog closes, no changes
5. Open delete dialog again
6. Click **"Smazat předmět"**
7. Verify:
   - [ ] Loading state: button shows "Mazání..."
   - [ ] Subject disappears **immediately** (optimistic update)
   - [ ] Exit animation plays (scale down + fade out)
   - [ ] Success toast appears
   - [ ] Dialog closes
   - [ ] Grid adjusts layout smoothly

### 6. Empty State
To test empty state, you need to delete all subjects:
1. Delete all 8 subjects one by one
2. Verify empty state:
   - [ ] Plus icon displayed
   - [ ] Title: "Zatím žádné předměty"
   - [ ] Description explains what to do
   - [ ] Button: "Vytvořit první předmět"
3. Click the button
4. Verify:
   - [ ] Create dialog opens
   - [ ] Can create first subject successfully

### 7. Error State
To test error state (requires MSW modification or network throttling):
1. Open browser DevTools
2. Go to Network tab
3. Enable "Offline" mode
4. Refresh the page
5. Verify error state:
   - [ ] Alert icon with red color
   - [ ] Error title and description
   - [ ] "Zkusit znovu" button
6. Disable offline mode
7. Click "Zkusit znovu"
8. Verify:
   - [ ] Data loads successfully
   - [ ] Grid displays subjects

### 8. Animations
- [ ] **Initial Load**: Cards fade in + slide up from 20px
- [ ] **Stagger Effect**: Each card delays by 50ms
- [ ] **Delete**: Card scales down to 0.9 + fades out
- [ ] **Smooth Transitions**: No jank or flicker
- [ ] **Duration**: All animations complete in 300ms

### 9. Responsive Design

#### Desktop (≥1024px)
- [ ] 4 columns grid
- [ ] Cards have consistent width
- [ ] Proper spacing between cards
- [ ] Dialogs centered

#### Tablet (768-1023px)
- [ ] 2 columns grid
- [ ] Cards maintain aspect ratio
- [ ] Readable text sizes

#### Mobile (<768px)
- [ ] 1 column grid
- [ ] Cards full width (minus padding)
- [ ] Dialogs scroll if content is tall
- [ ] Touch-friendly button sizes
- [ ] Dropdowns work with touch

### 10. Accessibility

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter opens dialogs
- [ ] Escape closes dialogs
- [ ] Arrow keys navigate pickers

#### Screen Reader
- [ ] ARIA labels on color picker buttons
- [ ] ARIA labels on emoji picker buttons
- [ ] Dialog roles correct
- [ ] Form labels associated with inputs

#### Focus Management
- [ ] Focus trap works in dialogs
- [ ] Focus returns to trigger after dialog closes
- [ ] Visible focus indicators

### 11. Color & Emoji Pickers

#### Color Picker
- [ ] 12 colors in 6-column grid
- [ ] Selected color has border and checkmark
- [ ] Hover scales up button (110%)
- [ ] Click selects color
- [ ] Visual feedback immediate

#### Emoji Picker
- [ ] 24 emojis in 8-column grid
- [ ] Selected emoji has border and background
- [ ] Hover scales up button (110%)
- [ ] Tooltips show emoji names on hover
- [ ] Click selects emoji

### 12. Dropdown Menu
- [ ] Opens on click
- [ ] Closes on outside click
- [ ] Closes on Escape key
- [ ] Edit option with pencil icon
- [ ] Separator between options
- [ ] Delete option in red (destructive variant)
- [ ] Hover highlights options

### 13. Form Validation

#### Create/Edit Dialog
Test with invalid inputs:
- [ ] Name too long (>100 chars) → error message
- [ ] Description too long (>500 chars) → error message
- [ ] Submit empty name → "Název předmětu je povinný"

Valid inputs:
- [ ] Name with special characters → accepted
- [ ] Empty description → accepted (optional)
- [ ] All validations pass → can submit

### 14. Optimistic Updates

#### Create
1. Network throttling: Slow 3G
2. Create subject
3. Verify:
   - [ ] Subject appears immediately in grid
   - [ ] After ~1-2 seconds, subject gets real ID from server
   - [ ] No flash or content shift

#### Update
1. Network throttling: Slow 3G
2. Edit subject
3. Verify:
   - [ ] Changes appear immediately on card
   - [ ] After ~1-2 seconds, server confirms changes
   - [ ] No rollback (success)

#### Delete
1. Network throttling: Slow 3G
2. Delete subject
3. Verify:
   - [ ] Subject disappears immediately
   - [ ] Exit animation plays
   - [ ] After ~1-2 seconds, server confirms deletion
   - [ ] No rollback (success)

### 15. Error Handling & Rollback

To test rollback (requires MSW modification):
1. Simulate create error:
   - Subject appears optimistically
   - After error, subject disappears
   - Error toast shows
   - Grid returns to previous state

2. Simulate update error:
   - Changes appear optimistically
   - After error, changes revert
   - Error toast shows
   - Original data restored

3. Simulate delete error:
   - Subject disappears optimistically
   - After error, subject reappears
   - Error toast shows
   - Subject animates back in

---

## 🔍 Visual Regression Checklist

- [ ] Cards maintain consistent height
- [ ] Icons always centered in colored box
- [ ] Text never overflows containers
- [ ] Grid gaps consistent across breakpoints
- [ ] Animations smooth at 60fps
- [ ] No layout shift during loading
- [ ] Dialogs properly centered
- [ ] Scrollbars only when needed

---

## 🌐 Browser Testing

Recommended browsers to test:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## 🐛 Known Issues

None at this time.

---

## 📝 Reporting Issues

If you find any issues, please note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Browser and screen size
5. Console errors (if any)

---

## ✅ Success Criteria

All tests above should pass without issues. The feature is ready for production when:
- ✅ All CRUD operations work smoothly
- ✅ Animations are smooth (no jank)
- ✅ Responsive design works on all screen sizes
- ✅ No TypeScript or linting errors
- ✅ Build completes successfully
- ✅ Optimistic updates provide instant feedback
- ✅ Error handling gracefully recovers

---

**Happy Testing! 🎉**

