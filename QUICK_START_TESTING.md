# Quick Start - Testing the Enhanced Test Taking

## 🚀 Get Started in 5 Minutes

### Step 1: Run the Development Server

```bash
npm run dev
```

### Step 2: Create Two Test Instances

1. **Test A - "During" Mode**
   - Go to any source material
   - Generate a test
   - Set review mode to "Zobrazit ihned"
   - Include at least one open-ended question
   - Start the test

2. **Test B - "After" Mode**
   - Generate another test
   - Set review mode to "Zobrazit po dokončení"
   - Start the test

### Step 3: Quick Validation Checklist

#### Test A - "During" Mode (5 min)
- [ ] Try clicking Next without answering → Should be blocked ✓
- [ ] Try clicking dots without answering → Should be blocked ✓
- [ ] Answer first question correctly → Should auto-advance after 2s ✓
- [ ] Try to click during auto-advance → Should be disabled ✓
- [ ] Navigate to a different question → Should see form is reset ✓
- [ ] For open-ended: Submit answer → Should see "AI vyhodnocuje..." ✓
- [ ] Wait for evaluation → Should see score and feedback ✓

#### Test B - "After" Mode (3 min)
- [ ] Click any dot → Should jump there freely ✓
- [ ] Answer questions in random order → Should work ✓
- [ ] After answering → Should NOT auto-advance ✓
- [ ] Navigate between questions → Forms should reset ✓
- [ ] Try to complete without all answered → Should be blocked ✓

#### Results Page (2 min)
- [ ] Open results
- [ ] Check multiple choice answers → Should see full text, not "a,c,d" ✓
- [ ] Check open-ended answers → Should see full feedback ✓

## ✅ If All Above Pass

Congratulations! The core functionality works. 

For comprehensive testing, see: **`TEST_TAKING_TESTING_GUIDE.md`**

## 🐛 Found a Bug?

1. Note which step failed
2. Describe what happened vs. what should happen
3. Check browser console for errors
4. Let me know and I'll fix it!

## 📝 Key Behaviors to Verify

### Navigation Rules

**During Mode**:
- ❌ Cannot navigate without answering
- ✅ Can navigate after answering
- ✅ Auto-advances on correct (2s delay)
- ❌ Cannot click during auto-advance

**After Mode**:
- ✅ Can navigate freely always
- ✅ Can answer in any order
- ❌ Never auto-advances

### Visual Indicators

- 🔵 Blue dot = Current question
- 🟢 Green dot = Answered question
- ⚪ Gray dot = Unanswered question
- 🚫 Grayed out buttons = Disabled
- ⏳ "Automaticky pokračuji..." = Auto-advancing

## 🎯 Most Important Tests

1. **No double-jump**: Rapidly click Next → should only move once
2. **Form reset**: Navigate Q1→Q2→Q1 → Q2 should be empty
3. **Answer display**: Results show full text, not IDs
4. **WebSocket works**: Open-ended gets evaluated and shows feedback

---

**Happy Testing! 🚀**

If everything works as described above, the implementation is successful and ready for production!

