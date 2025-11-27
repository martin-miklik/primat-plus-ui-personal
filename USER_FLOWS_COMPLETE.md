# Complete User Flows & Edge Cases - Subscription System

## 🎯 All Possible User States

### 1. **Free User - Never Had Premium** (New User)
```
State:
- subscriptionType: "free"
- hasUsedTrial: false
- subscriptionExpiresAt: null
- autoRenew: N/A

Access:
✅ Can access /predplatne (landing page)
✅ Can access /predplatne/checkout
❌ Blocked from /predplatne/sprava (redirects to /predplatne)

Flow:
1. Clicks upgrade → Goes to /predplatne
2. Selects plan → Goes to /predplatne/checkout
3. Sees "14 dní zdarma" offer
4. Checks 3 consent boxes → Proceeds to GoPay
5. Completes payment
6. Returns to /predplatne/uspech
7. Becomes TRIAL user
```

### 2. **Free User - Used Trial Before** (Returning User)
```
State:
- subscriptionType: "free"
- hasUsedTrial: true
- subscriptionExpiresAt: null (or past date)
- autoRenew: false

Access:
✅ Can access /predplatne (landing page)
✅ Can access /predplatne/checkout
❌ Blocked from /predplatne/sprava (redirects to /predplatne)

Flow:
1. Clicks upgrade → Goes to /predplatne
2. Selects plan → Goes to /predplatne/checkout
3. Sees "199 Kč/měsíc" (NO TRIAL OFFER)
4. Checks 3 consent boxes → Proceeds to GoPay
5. Pays 199 Kč immediately (no 1 CZK trial charge)
6. Returns to /predplatne/uspech
7. Becomes PREMIUM user
```

### 3. **Trial User** (Active Trial)
```
State:
- subscriptionType: "trial"
- hasUsedTrial: true
- subscriptionExpiresAt: future date (e.g., +14 days)
- autoRenew: true
- daysRemaining: 1-14

Access:
❌ Blocked from /predplatne (redirects to /sprava)
❌ Blocked from /predplatne/checkout (redirects to /sprava)
✅ Can access /predplatne/sprava

Flow:
- Enjoys premium features for 14 days
- Can cancel anytime (becomes "Canceled Trial" - see below)
- After 14 days → Backend auto-charges 199 Kč
- Becomes PREMIUM user
```

### 4. **Premium User - Active with Auto-Renew**
```
State:
- subscriptionType: "premium"
- hasUsedTrial: true
- subscriptionExpiresAt: future date (e.g., +30 days)
- autoRenew: true
- daysRemaining: 1-30

Access:
❌ Blocked from /predplatne (redirects to /sprava)
❌ Blocked from /predplatne/checkout (redirects to /sprava)
✅ Can access /predplatne/sprava

Flow:
- Pays monthly (199 Kč/month)
- Can cancel anytime (becomes "Canceled Premium" - see below)
- Each month → Backend auto-charges 199 Kč
- Continues indefinitely
```

### 5. **Premium User - Canceled (Still Active)** ⚠️ CRITICAL FLOW
```
State:
- subscriptionType: "premium"
- hasUsedTrial: true
- subscriptionExpiresAt: future date (e.g., Dec 14, 2025)
- autoRenew: false ⚠️ KEY DIFFERENCE
- daysRemaining: varies

Access:
✅ Can access /predplatne (to re-subscribe!)
✅ Can access /predplatne/checkout (to re-subscribe!)
✅ Can access /predplatne/sprava (to see current status)

Flow:
1. User canceled subscription but still has days remaining
2. Can still use premium features until expiry
3. Can visit /predplatne to see re-subscription options
4. Can go through checkout again to re-activate
5. If re-subscribes → autoRenew becomes true again
6. If doesn't re-subscribe → becomes FREE after expiry
```

### 6. **Trial User - Canceled (Still Active)** ⚠️ EDGE CASE
```
State:
- subscriptionType: "trial"
- hasUsedTrial: true
- subscriptionExpiresAt: future date
- autoRenew: false
- daysRemaining: varies

Access:
✅ Can access /predplatne (to re-subscribe!)
✅ Can access /predplatne/checkout (to pay now!)
✅ Can access /predplatne/sprava

Flow:
1. User canceled during trial
2. Can still use premium features until trial ends
3. Can visit /predplatne to pay and continue
4. If pays before trial ends → becomes PREMIUM
5. If doesn't pay → becomes FREE after trial ends
```

### 7. **Expired Premium** (Back to Free)
```
State:
- subscriptionType: "free"
- hasUsedTrial: true
- subscriptionExpiresAt: past date
- autoRenew: false

Access:
✅ Can access /predplatne
✅ Can access /predplatne/checkout
❌ Blocked from /predplatne/sprava

Flow:
- Same as "Free User - Used Trial Before" (#2)
- No trial offered, pays immediately
```

---

## 🔧 Implementation Changes Made

### 1. **Updated Type Definitions**
```typescript
// Added to User schema
hasUsedTrial: z.boolean().optional()

// Added to BillingLimits schema (already existed)
hasUsedTrial: z.boolean()

// Added to Subscription schema
hasUsedTrial: z.boolean().optional()
```

### 2. **Enhanced Subscription Guard**
```typescript
// Now checks autoRenew status
if (requiredType === "free") {
  // Allow premium users who have CANCELED to re-subscribe
  if (isPremium && subscription && !subscription.autoRenew) {
    return; // Let them access /predplatne and /checkout
  }
}
```

### 3. **Cancel Mutation Updates**
```typescript
onSuccess: async () => {
  // Invalidate billing queries
  await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_SUBSCRIPTION });
  await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BILLING_LIMITS });
  // Refetch user data to update auth store
  await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
}
```

### 4. **Conditional Text Display** (TODO - Next Step)

Need to update these components to check `hasUsedTrial`:

**Landing Page** (`/predplatne/page.tsx`):
```typescript
const { data: limits } = useBillingLimits();
const hasUsedTrial = limits?.hasUsedTrial || false;

// Show different text:
hasUsedTrial 
  ? "Pokračovat s Premium za 199 Kč/měsíc"
  : "Vyzkoušet 14 dní zdarma, poté 199 Kč/měsíc"
```

**Checkout Page** (`/predplatne/checkout/page.tsx`):
```typescript
const { data: limits } = useBillingLimits();
const hasUsedTrial = limits?.hasUsedTrial || false;

// Show trial info conditionally:
{!hasUsedTrial && (
  <div>🎉 14denní zkušební období zdarma!</div>
)}
```

---

## 📋 Backend Checklist

### ✅ Already Implemented
- [x] `hasUsedTrial` field on User model
- [x] Returns `hasUsedTrial` in `/billing/limits` endpoint
- [x] Logic to check trial eligibility in `/payments/create`
- [x] Sets `hasUsedTrial = true` after first trial

### ⚠️ Needs Verification
- [ ] Does `/billing/subscription` return `hasUsedTrial`?
- [ ] After cancel, does `autoRenew` get set to `false`?
- [ ] After cancel, does user keep access until `subscriptionExpiresAt`?
- [ ] Can canceled user create new payment to re-activate?
- [ ] Does re-activation set `autoRenew` back to `true`?

### 📝 Backend Questions for Dev

1. **Cancel Flow:**
   - When user cancels, does `autoRenew` become `false`?
   - Does subscription remain active until `subscriptionExpiresAt`?
   - Can they still use premium features during this time?

2. **Re-activation:**
   - Can a canceled premium user create a new payment?
   - Does this re-activate their subscription?
   - Does `autoRenew` get set back to `true`?

3. **hasUsedTrial:**
   - Is this field returned in `/billing/subscription` response?
   - Is it set to `true` after first trial payment?

---

## 🎨 Frontend TODO

### Pages to Update

1. **`/predplatne/page.tsx`** (Landing)
   - Fetch `hasUsedTrial` from billing limits
   - Conditionally show trial offer
   - Update CTA button text

2. **`/predplatne/checkout/page.tsx`** (Checkout)
   - Fetch `hasUsedTrial` from billing limits
   - Hide trial info if already used
   - Update pricing display
   - Update confirmation text

3. **`/predplatne/sprava/page.tsx`** (Management)
   - Show re-activation CTA if `autoRenew === false`
   - Add "Reaktivovat předplatné" button
   - Link to `/predplatne` for easy re-subscription

---

## 🚨 Critical User Experience Notes

### For Canceled Users:
- They should CLEARLY see they can re-activate
- "Reaktivovat předplatné" button should be prominent
- Should explain: "Stále máš přístup do [date], poté budeš free"

### For Trial Repeaters:
- NEVER offer trial twice to same user
- Must show immediate pricing (199 Kč)
- Must explain no trial available
- Consider showing: "Již jsi využil zkušební období"

### For All Users:
- Always show days remaining clearly
- Always show next billing date
- Always allow cancellation
- Always explain what happens after cancel

---

## ✅ Testing Checklist

- [ ] Free user (new) sees trial offer
- [ ] Free user (used trial) doesn't see trial offer
- [ ] Trial user can't access /predplatne
- [ ] Premium user can't access /predplatne (unless canceled)
- [ ] Canceled premium user CAN access /predplatne
- [ ] Canceled premium user CAN re-subscribe
- [ ] After cancel, data refetches correctly
- [ ] After cancel, auth store updates
- [ ] After re-subscription, autoRenew becomes true
- [ ] Expired users become free again

---

**Status:** 🟡 Partially Complete
- ✅ Route guards updated
- ✅ Cancel mutation refetches data
- ✅ Type definitions updated
- 🟡 Conditional text needs implementation
- 🟡 Backend verification needed

