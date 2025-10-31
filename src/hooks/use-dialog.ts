import { useUIStore } from "@/stores";

/**
 * Hook for managing dialog state via Zustand UI store
 *
 * @param dialogId - Unique identifier for the dialog
 * @returns Object with isOpen state and open/close functions
 *
 * @example
 * const dialog = useDialog("create-subject");
 *
 * // Open dialog
 * <Button onClick={dialog.open}>Open</Button>
 *
 * // Use in Dialog component
 * <Dialog open={dialog.isOpen} onOpenChange={(open) => !open && dialog.close()}>
 *   ...
 * </Dialog>
 */
export function useDialog(dialogId: string) {
  const { modalStack, openModal, closeModal } = useUIStore();

  return {
    isOpen: modalStack.includes(dialogId),
    open: () => openModal(dialogId),
    close: () => closeModal(dialogId),
  };
}
