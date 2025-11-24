# Subject Delete Feature - Already Implemented ✅

## Status: **COMPLETE** ✅

The three-dot menu with delete option is **already working** on the subjects page!

## What's Implemented

### 1. SubjectCard Component ✅
- **File:** `src/components/ui/subject-card.tsx`
- Three-dot menu appears on hover (top-right)
- Contains:
  - ✏️ Edit option
  - 🗑️ Delete option (red/destructive style)

### 2. Delete Mutation ✅
- **File:** `src/lib/api/mutations/subjects.ts`
- `useDeleteSubject()` hook
- Endpoint: `DELETE /subjects/{id}`
- Optimistic updates included

### 3. Delete Dialog ✅
- **File:** `src/components/dialogs/delete-subject-dialog.tsx`
- Shows subject icon, name, description
- Warning about deleting all related data
- Confirmation required
- Loading state during deletion

### 4. Translations ✅
- **File:** `messages/cs.json` (lines 161-200)
- All Czech translations present:
  - `subjects.edit` → "Upravit"
  - `subjects.delete` → "Smazat"
  - `subjects.dialog.deleteTitle` → "Smazat předmět"
  - `subjects.dialog.deleteDescription` → "Tato akce je nevratná."
  - `subjects.dialog.deleteConfirmation` → "Opravdu chcete smazat předmět \"{name}\"?"
  - `subjects.dialog.deleteWarning` → "Všechna témata, zdroje a kartičky spojené s tímto předmětem budou také smazány."
  - `subjects.dialog.deleting` → "Mazání..."
  - `subjects.dialog.deleteButton` → "Smazat předmět"

### 5. Page Integration ✅
- **File:** `src/app/(dashboard)/predmety/page.tsx`
- `onEdit={handleEdit}` - line 131
- `onDelete={handleDelete}` - line 132
- `<DeleteSubjectDialog>` - line 143

## How It Works

1. **Hover over subject card** → Three dots appear (top-right)
2. **Click three dots** → Menu opens
3. **Click "Smazat"** → Delete dialog opens
4. **Confirm deletion** → Subject deleted with toast notification

## Visual Flow

```
Subject Card (hover)
    ↓
Three-dot menu appears
    ↓
Click menu → Opens dropdown
    ↓
Options shown:
  ✏️ Upravit
  ────────
  🗑️ Smazat
    ↓
Click Smazat → Opens dialog
    ↓
Dialog shows:
  - Subject icon + name
  - Warning message
  - [Cancel] [Smazat předmět]
    ↓
Confirm → Subject deleted
```

## No Changes Needed

Everything is already implemented and working! The feature includes:
- ✅ UI component with three-dot menu
- ✅ Delete mutation with API call
- ✅ Confirmation dialog
- ✅ Complete Czech translations
- ✅ Page handlers and integration

**Status:** Production ready ✅

