import { create } from "zustand";
import type { PaywallReason, BillingLimits } from "@/lib/validations/billing";

interface PaywallStore {
  isOpen: boolean;
  reason: PaywallReason | null;
  limits: BillingLimits | null;

  open: (reason: PaywallReason, limits?: BillingLimits | null) => void;
  close: () => void;
}

export const usePaywallStore = create<PaywallStore>((set) => ({
  isOpen: false,
  reason: null,
  limits: null,

  open: (reason, limits = null) => set({ isOpen: true, reason, limits }),
  close: () => set({ isOpen: false, reason: null }),
}));

