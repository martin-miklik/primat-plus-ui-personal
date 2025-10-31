# Zustand DevTools Guide

## 🛠️ Overview

All Zustand stores in this project are configured with DevTools support for easy debugging and state inspection.

## 📦 Stores

### 1. **AuthStore** (`src/stores/auth-store.ts`)
- **State:** user, token, isAuthenticated
- **Actions:** setAuth, clearAuth, updateUser
- **Persist:** ✅ localStorage (`auth-storage`)
- **DevTools:** ✅ Named "AuthStore"

### 2. **UploadStore** (`src/stores/upload-store.ts`)
- **State:** files queue with progress tracking
- **Actions:** addFiles, updateFileProgress, updateFileStatus, removeFile, clearCompleted, clearAll
- **Persist:** ❌ (ephemeral by design)
- **DevTools:** ✅ Named "UploadStore"

### 3. **UIStore** (`src/stores/ui-store.ts`)
- **State:** sidebarOpen, reducedMotion, modalStack
- **Actions:** toggleSidebar, openModal, closeModal, closeAllModals
- **Persist:** ✅ localStorage (`ui-storage`)
- **DevTools:** ✅ Named "UIStore"

## 🔍 Using DevTools

### Install Redux DevTools Extension

1. **Chrome:** [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
2. **Firefox:** [Redux DevTools](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
3. **Edge:** [Redux DevTools](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)

### Access DevTools

1. Open your app in development mode (`pnpm dev`)
2. Open browser DevTools (F12)
3. Navigate to "Redux" tab
4. Select store from dropdown:
   - `AuthStore`
   - `UploadStore`
   - `UIStore`

### Features Available

- **Time Travel Debugging** - Replay state changes
- **Action History** - See all dispatched actions
- **State Inspector** - View current state
- **Diff View** - See state changes between actions
- **Export/Import** - Save and restore state

## 📝 Action Naming Convention

All actions follow the pattern: `{store}/{action}`

### AuthStore Actions:
- `auth/setAuth` - User login
- `auth/clearAuth` - User logout
- `auth/updateUser` - Update user data

### UploadStore Actions:
- `upload/addFiles` - Add files to queue
- `upload/updateFileProgress` - Update upload progress
- `upload/updateFileStatus` - Update file status
- `upload/setMaterialId` - Link material ID to file
- `upload/removeFile` - Remove file from queue
- `upload/clearCompleted` - Remove completed uploads
- `upload/clearAll` - Clear entire queue

### UIStore Actions:
- `ui/toggleSidebar` - Toggle sidebar visibility
- `ui/setSidebarOpen` - Set sidebar state
- `ui/setReducedMotion` - Set motion preference
- `ui/openModal` - Open modal (adds to stack)
- `ui/closeModal` - Close modal (removes from stack)
- `ui/closeAllModals` - Close all modals

## 🎯 Usage Examples

### Auth Store
```typescript
import { useAuthStore } from "@/stores";

function LoginButton() {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const handleLogin = () => {
    setAuth(
      { id: "1", email: "user@example.com", name: "John", subscription: "free" },
      "token-123"
    );
    // DevTools will show: auth/setAuth
  };
}
```

### Upload Store
```typescript
import { useUploadStore } from "@/stores";

function FileUploader() {
  const addFiles = useUploadStore((state) => state.addFiles);
  const updateProgress = useUploadStore((state) => state.updateFileProgress);
  
  const handleUpload = (files: File[]) => {
    addFiles(files);
    // DevTools will show: upload/addFiles
  };
}
```

### UI Store (Modal Stack)
```typescript
import { useUIStore } from "@/stores";

function App() {
  const modalStack = useUIStore((state) => state.modalStack);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  
  // Open multiple modals (stacked)
  const handleOpenSettings = () => {
    openModal("settings");
    // DevTools will show: ui/openModal
    // modalStack: ["settings"]
  };
  
  const handleOpenConfirm = () => {
    openModal("confirm");
    // DevTools will show: ui/openModal
    // modalStack: ["settings", "confirm"]
  };
  
  // Close top modal
  const handleClose = () => {
    closeModal(); // No ID = close top modal
    // DevTools will show: ui/closeModal
    // modalStack: ["settings"]
  };
  
  // Close specific modal
  const handleCloseSettings = () => {
    closeModal("settings");
    // DevTools will show: ui/closeModal
    // modalStack: []
  };
  
  // Active modal is the last one in stack
  const activeModal = modalStack[modalStack.length - 1];
}
```

## 🚨 Production Behavior

DevTools middleware is smart:
- **Development:** Full DevTools integration enabled
- **Production:** DevTools code is tree-shaken (removed from bundle)

No performance impact in production! 🚀

## 🔧 Debugging Tips

### 1. Find When State Changed
Use the action list to find when specific state changed

### 2. Export State for Testing
Export current state and use it in tests or fixtures

### 3. Time Travel
Jump to any previous state to reproduce bugs

### 4. Monitor Performance
Watch for too many state updates (potential performance issue)

### 5. Validate Actions
Ensure action names follow convention and are descriptive

## 📊 State Persistence

### Persisted Stores:
- **AuthStore** → `localStorage.getItem('auth-storage')`
- **UIStore** → `localStorage.getItem('ui-storage')`

### Non-Persisted Stores:
- **UploadStore** → Ephemeral (resets on page refresh)

### Clear Persisted State:
```javascript
// In browser console
localStorage.removeItem('auth-storage');
localStorage.removeItem('ui-storage');
```

## 🎨 Modal Stack Pattern

The UI store implements a **modal stack** to support multiple overlapping modals:

### Benefits:
- ✅ Multiple modals can be open simultaneously
- ✅ Modals stack on top of each other (z-index)
- ✅ Close top modal or specific modal by ID
- ✅ Close all modals at once
- ✅ Track modal history

### Example Flow:
1. User opens "Settings" modal → `modalStack: ["settings"]`
2. User opens "Confirm" modal from settings → `modalStack: ["settings", "confirm"]`
3. User closes confirm → `modalStack: ["settings"]`
4. User closes all → `modalStack: []`

This pattern is common in complex UIs with nested dialogs, confirmations, and multi-step flows.

## 🔗 Resources

- [Zustand DevTools Docs](https://github.com/pmndrs/zustand#devtools)
- [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools)
- [Zustand Middleware Guide](https://github.com/pmndrs/zustand/blob/main/docs/integrations/persisting-store-data.md)


