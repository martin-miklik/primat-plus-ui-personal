# Material Card Delete Feature ✅

## Implemented

Three-dot menu with delete option for MaterialCard components.

## Changes

### 1. Delete Mutation ✅
**File:** `src/lib/api/mutations/sources.ts` (new)
- `useDeleteSource()` hook
- Endpoint: `DELETE /sources/{id}`
- Auto-invalidates sources queries
- Success/error toasts

### 2. MaterialCard Updates ✅
**File:** `src/components/materials/material-card.tsx`
- Added three-dot menu (top-right, on hover)
- Shows only when NOT uploading (uploadState check)
- Delete option in dropdown menu
- Uses `sources.card.delete` translation

### 3. Delete Dialog ✅
**File:** `src/components/dialogs/delete-source-dialog.tsx` (new)
- Shows source icon, name, type
- Warning about deleting related data
- Confirmation required
- Loading state

### 4. Materials List Integration ✅
**File:** `src/components/materials/materials-list.tsx`
- Added `handleDelete` function
- Passes `onDelete` prop to MaterialCard
- Renders DeleteSourceDialog
- Manages selected source state

### 5. Translations ✅
**File:** `messages/cs.json`
- `sources.card.delete` → "Smazat"
- `sources.dialog.deleteTitle` → "Smazat zdroj"
- `sources.dialog.deleteDescription` → "Tato akce je nevratná."
- `sources.dialog.deleteConfirmation` → "Opravdu chcete smazat zdroj \"{name}\"?"
- `sources.dialog.deleteWarning` → "Všechny kartičky, testy a související data budou také smazány."
- `sources.dialog.deleting` → "Mazání..."
- `sources.dialog.deleteButton` → "Smazat zdroj"

### 6. Export Updates ✅
**File:** `src/components/dialogs/index.ts`
- Exported DeleteSourceDialog

## How It Works

```
MaterialCard (hover, when NOT uploading)
    ↓
Three dots appear (top-right)
    ↓
Click → Dropdown menu
    ↓
"Smazat" option
    ↓
Click → Dialog opens
    ↓
Confirm → Source deleted
    ↓
Success toast + list refresh
```

## Status Badge vs Menu

- **During upload:** Status badge visible (top-right) → No menu
- **After upload:** Status badge gone → Three-dot menu appears on hover

**No conflicts!** ✅

## Files Changed (7)
1. `src/lib/api/mutations/sources.ts` - New
2. `src/components/dialogs/delete-source-dialog.tsx` - New
3. `src/components/materials/material-card.tsx` - Added menu
4. `src/components/materials/materials-list.tsx` - Integration
5. `src/components/dialogs/index.ts` - Export
6. `messages/cs.json` - Translations

**No linter errors** ✅

