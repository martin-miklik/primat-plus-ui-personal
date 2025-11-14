<!-- 906a5043-664a-4fd3-a124-24b7bbefd5ca 4c06d0b2-c878-4b05-8b98-1abc30eda901 -->
# Paywall & Subscription System - MVP Solution

## Overview

This document serves two purposes:

1. **Frontend Implementation Guide** - Components, hooks, and logic to build
2. **Backend Specification** - Complete API spec for backend developer

The solution prioritizes the backend specification requirements while ensuring a working MVP that can evolve based on client feedback.

---

## 1. Subscription Flow

### User Journey

```
Registration → Free Tier (14 days or until limits hit)
    ↓
Paywall Triggered (after 14 days OR hitting any limit)
    ↓
User Selects Plan → Enters Payment (GoPay)
    ↓
Premium Trial (14 days, full features)
    ↓
Auto-charge → Premium Subscription (monthly recurring)
```

### Subscription States

- **free**: Initial state after registration, limited features
- **trial**: 14-day Premium trial after payment method added  
- **premium**: Paid subscription with full features

**Extensibility**: Additional states (enterprise, team) can be added without restructuring

---

## 2. Free Tier Limits (Aligned with BE Spec)

### Resource Limits

| Resource | Free Limit | Premium |

|----------|-----------|---------|

| Subjects | 1 | Unlimited |

| Sources (per subject) | 1 | Unlimited |

| Test questions | Max 15 per test | Unlimited |

| Flashcards | Max 30 per generation | Unlimited |

| Chat conversations | 3 conversations (per source) | Unlimited |

| File upload size | 10 MB | 100 MB |

### Frontend Implementation

Update `src/lib/constants.ts`:

```typescript
export const FREE_TIER_LIMITS = {
  MAX_SUBJECTS: 1,
  MAX_SOURCES_PER_SUBJECT: 1,
  MAX_TEST_QUESTIONS: 15,
  MAX_FLASHCARDS_PER_GENERATION: 30,
  MAX_CHAT_CONVERSATIONS: 3,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const PREMIUM_TIER_LIMITS = {
  MAX_SUBJECTS: 999,
  MAX_SOURCES_PER_SUBJECT: 999,
  MAX_TEST_QUESTIONS: 100,
  MAX_FLASHCARDS_PER_GENERATION: 100,
  MAX_CHAT_CONVERSATIONS: 999,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
} as const;
```

**Extensibility**: Limits can be adjusted per tier; easy to add business/enterprise tiers later

---

## 3. Paywall Triggers

### When to Show Paywall

#### Time-based Trigger

- **Condition**: 14 days have passed since user registration
- **Frontend Check**: Calculate from `user.createdAt` or use backend `/billing/limits` endpoint
- **Backend Check**: `daysSinceRegistration >= 14`

#### Limit-based Triggers

1. **Adding Subject**: User tries to create 2nd subject → Hard paywall
2. **Adding Source**: User tries to add 2nd source to subject → Hard paywall
3. **Chat Usage**: 

   - User clicks into chat input field → Soft paywall (dismissible)
   - After 3rd conversation completed → Hard paywall (blocks sending)

4. **Generating Tests**: User tries to generate test with >15 questions → Hard paywall
5. **Generating Flashcards**: User tries to generate >30 flashcards → Hard paywall

### Paywall Types

- **Soft Paywall**: Shows upgrade prompt, user can dismiss and continue (informational)
- **Hard Paywall**: Blocks action completely, user must upgrade or go back (enforced)

**Extensibility**: New trigger points can be added modularly to `usePaywall` hook

---

## 4. Backend API Specification

> **Note**: This section is for backend developer reference. Frontend will consume these endpoints.

### 4.1 Database Schema

#### Users Table Extensions

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN trial_ends_at DATETIME NULL;
ALTER TABLE users ADD COLUMN payment_method_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN auto_renew BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN has_used_trial BOOLEAN DEFAULT FALSE;
```

#### Subscriptions Table (New)

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_type ENUM('monthly', 'yearly') NOT NULL,
  status ENUM('active', 'cancelled', 'expired', 'trial') NOT NULL,
  started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  gopay_payment_id VARCHAR(255) NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Billing Plans Table (New)

```sql
CREATE TABLE billing_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price_czk DECIMAL(10, 2) NOT NULL,
  billing_period ENUM('monthly', 'yearly') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  trial_days INT DEFAULT 14,
  features JSON,
  created_at DATETIME,
  updated_at DATETIME
);

-- Seed default plans
INSERT INTO billing_plans (name, price_czk, billing_period, is_active, features) VALUES
  ('Premium Monthly', 199.00, 'monthly', TRUE, '["Neomezené předměty", "Neomezené materiály", "AI chat bez limitů", "Testy do 100 otázek"]'),
  ('Premium Yearly', 1990.00, 'yearly', TRUE, '["Všechny Premium funkce", "Ušetříte 17%", "Prioritní podpora"]');
```

#### Chat Conversations Table (New)

```sql
CREATE TABLE chat_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  source_id INT NOT NULL,
  started_at DATETIME NOT NULL,
  last_message_at DATETIME NOT NULL,
  message_count INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  INDEX idx_user_source (user_id, source_id)
);
```

### 4.2 API Endpoints

#### GET `/api/v1/billing/limits`

Returns current usage and limits for authenticated user.

**Request**: `Authorization: Bearer {token}`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "subscriptionType": "free",
    "subscriptionExpiresAt": null,
    "daysSinceRegistration": 7,
    "daysUntilPaywall": 7,
    "hasUsedTrial": false,
    "limits": {
      "subjects": { "used": 1, "max": 1, "percentage": 100, "isAtLimit": true },
      "sources": { "used": 1, "max": 1, "percentage": 100, "isAtLimit": true },
      "chatConversations": { "used": 2, "max": 3, "percentage": 66, "isAtLimit": false },
      "testQuestions": { "max": 15 },
      "flashcards": { "max": 30 },
      "fileSize": { "max": 10485760 }
    }
  }
}
```

**Business Logic**:

- Count user's subjects: `SELECT COUNT(*) FROM subjects WHERE user_id = ?`
- Count user's sources: `SELECT COUNT(*) FROM sources WHERE user_id = ?`
- Count chat conversations: `SELECT COUNT(*) FROM chat_conversations WHERE user_id = ? AND source_id = ?`
- Calculate days since registration: `DATEDIFF(NOW(), user.created_at)`

---

#### GET `/api/v1/billing/plans`

Returns available subscription plans.

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "Premium Monthly",
        "priceCzk": 199.00,
        "priceFormatted": "199 Kč",
        "billingPeriod": "monthly",
        "trialDays": 14,
        "features": [
          "Neomezené předměty",
          "Neomezené materiály",
          "AI chat bez limitů",
          "Testy do 100 otázek",
          "Prioritní podpora"
        ]
      },
      {
        "id": 2,
        "name": "Premium Yearly",
        "priceCzk": 1990.00,
        "priceFormatted": "1 990 Kč",
        "pricePerMonth": 165.83,
        "billingPeriod": "yearly",
        "trialDays": 14,
        "savingsPercent": 17,
        "savingsAmount": 398.00,
        "features": [
          "Všechny Premium funkce",
          "Ušetříte 17% ročně",
          "Prioritní podpora"
        ]
      }
    ]
  }
}
```

**Business Logic**:

- Fetch from `billing_plans` table WHERE `is_active = TRUE`
- Calculate savings: `(monthly * 12 - yearly) / (monthly * 12) * 100`

---

#### POST `/api/v1/billing/checkout`

Creates GoPay payment and returns redirect URL.

**Request**:

```json
{
  "planId": 1,
  "returnUrl": "https://primat.cz/predplatne/uspech",
  "notifyUrl": "https://api.primat.cz/api/v1/billing/gopay-webhook"
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "paymentId": "3000123456",
    "gatewayUrl": "https://gate.gopay.cz/gw/v3/3000123456",
    "status": "CREATED"
  }
}
```

**Error Response** (400 Bad Request):

```json
{
  "success": false,
  "error": {
    "code": "TRIAL_ALREADY_USED",
    "message": "Zkušební období již bylo použito"
  }
}
```

**Business Logic**:

1. Check if user has already used trial (`has_used_trial = TRUE`) → Return error
2. Fetch plan from database
3. Create GoPay payment:

   - Amount: `plan.price_czk * 100` (GoPay uses haléře)
   - Description: `"Primát Plus - {plan.name}"`
   - Recurrence: `{ recurrence_cycle: "ON_DEMAND" }` for auto-renewal

4. Store payment in `subscriptions` table with status `pending`
5. Return GoPay gateway URL

---

#### POST `/api/v1/billing/gopay-webhook`

Webhook endpoint for GoPay payment notifications.

**Request** (from GoPay):

```json
{
  "id": 3000123456,
  "state": "PAID",
  "amount": 19900,
  "currency": "CZK",
  "gw_url": "...",
  "recurrence": {
    "recurrence_cycle": "ON_DEMAND",
    "recurrence_date_to": "2026-11-14"
  }
}
```

**Response**: `200 OK` (always, even on errors to prevent retries)

**Business Logic**:

1. Verify GoPay signature: `hash_hmac('sha256', $data, GOPAY_SECRET)`
2. Find subscription by `gopay_payment_id`
3. If `state === 'PAID'`:

   - Update user: `subscription_type = 'trial'`, `subscription_expires_at = NOW() + 14 days`, `has_used_trial = TRUE`
   - Update subscription: `status = 'trial'`, `gopay_payment_id = id`
   - Store recurrence ID for future charges
   - Schedule renewal job to run in 14 days

4. If `state === 'CANCELED' || state === 'TIMEOUT'`:

   - Delete pending subscription
   - Send email notification

---

#### GET `/api/v1/billing/subscription`

Returns current subscription details for authenticated user.

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "subscriptionType": "trial",
    "subscriptionExpiresAt": "2025-11-28T12:00:00Z",
    "daysRemaining": 12,
    "autoRenew": true,
    "currentPlan": {
      "id": 1,
      "name": "Premium Monthly",
      "priceCzk": 199.00,
      "billingPeriod": "monthly",
      "nextBillingDate": "2025-11-28",
      "nextBillingAmount": 199.00
    },
    "paymentHistory": [
      {
        "date": "2025-11-14",
        "amount": 199.00,
        "status": "paid",
        "description": "Primát Plus - Premium Monthly"
      }
    ]
  }
}
```

**For Free Users**:

```json
{
  "success": true,
  "data": {
    "subscriptionType": "free",
    "subscriptionExpiresAt": null,
    "daysRemaining": null,
    "autoRenew": false,
    "currentPlan": null,
    "paymentHistory": []
  }
}
```

---

#### POST `/api/v1/billing/cancel`

Cancels subscription auto-renewal (user keeps premium until expiration).

**Request**: Empty body

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Předplatné bude zrušeno k 2025-11-28",
    "expiresAt": "2025-11-28T12:00:00Z"
  }
}
```

**Business Logic**:

- Set `auto_renew = FALSE` in subscriptions table
- Keep `subscription_type` and `subscription_expires_at` unchanged
- Cancel GoPay recurrence via API
- After expiration date, cron job downgrades user to `free`

---

### 4.3 Limit Checking Middleware

Backend should validate limits on these endpoints:

```php
// Apply middleware to routes
Route::middleware(['auth', 'check.limits'])->group(function () {
  Route::post('/subjects', 'SubjectController@create')->name('subjects.create');
  Route::post('/sources', 'SourceController@create')->name('sources.create');
  Route::post('/chat/send', 'ChatController@send')->name('chat.send');
  Route::post('/sources/{id}/generate-flashcards', 'FlashcardController@generate');
  Route::post('/sources/{id}/generate-test', 'TestController@generate');
});

// Middleware implementation
class CheckLimitsMiddleware {
  public function handle(Request $request, Closure $next) {
    $user = $request->user();
    
    // Premium/trial users bypass all checks
    if (in_array($user->subscription_type, ['premium', 'trial'])) {
      return $next($request);
    }
    
    // Check 14-day free period
    if ($this->hasExpiredFreePeriod($user)) {
      return $this->paywallResponse('FREE_PERIOD_EXPIRED');
    }
    
    // Route-specific limit checks
    $route = $request->route()->getName();
    
    if ($route === 'subjects.create' && $this->hasReachedSubjectLimit($user)) {
      return $this->paywallResponse('SUBJECT_LIMIT_REACHED');
    }
    
    if ($route === 'sources.create' && $this->hasReachedSourceLimit($user)) {
      return $this->paywallResponse('SOURCE_LIMIT_REACHED');
    }
    
    if ($route === 'chat.send') {
      $sourceId = $request->input('sourceId');
      if ($this->hasReachedChatLimit($user, $sourceId)) {
        return $this->paywallResponse('CHAT_LIMIT_REACHED');
      }
    }
    
    // ... other checks
    
    return $next($request);
  }
  
  private function paywallResponse(string $code): JsonResponse {
    return response()->json([
      'success' => false,
      'error' => [
        'code' => $code,
        'message' => $this->getErrorMessage($code),
        'requiresUpgrade' => true,
      ]
    ], 402); // 402 Payment Required
  }
}
```

**Error Codes**:

- `FREE_PERIOD_EXPIRED`: 14 days have passed
- `SUBJECT_LIMIT_REACHED`: User tried to create 2nd subject
- `SOURCE_LIMIT_REACHED`: User tried to create 2nd source
- `CHAT_LIMIT_REACHED`: User exceeded 3 conversations on this source
- `TEST_QUESTION_LIMIT`: Test has >15 questions
- `FLASHCARD_LIMIT`: Flashcard generation >30 cards

---

### 4.4 GoPay Integration Guide

**Setup Steps**:

1. Register at https://gopay.cz
2. Get test credentials from developer portal
3. Install GoPay SDK: `composer require gopay/payments-sdk-php`
4. Configure in `.env`:
   ```
   GOPAY_GOID=8123456789
   GOPAY_CLIENT_ID=your_client_id
   GOPAY_CLIENT_SECRET=your_secret
   GOPAY_IS_PRODUCTION=false
   GOPAY_WEBHOOK_SECRET=your_webhook_secret
   ```


**Creating Payment**:

```php
$gopay = GoPay::createInstance([
  'goid' => config('gopay.goid'),
  'clientId' => config('gopay.client_id'),
  'clientSecret' => config('gopay.client_secret'),
  'isProductionMode' => config('gopay.is_production'),
]);

$payment = $gopay->createPayment([
  'amount' => $plan->price_czk * 100, // In haléře
  'currency' => 'CZK',
  'order_number' => $subscription->id,
  'order_description' => "Primát Plus - {$plan->name}",
  'items' => [
    ['name' => $plan->name, 'amount' => $plan->price_czk * 100, 'count' => 1]
  ],
  'callback' => [
    'return_url' => $request->input('returnUrl'),
    'notification_url' => $request->input('notifyUrl'),
  ],
  'recurrence' => [
    'recurrence_cycle' => 'ON_DEMAND', // For subscriptions
    'recurrence_date_to' => now()->addYear()->format('Y-m-d'),
  ],
]);

return [
  'paymentId' => $payment->id,
  'gatewayUrl' => $payment->gw_url,
  'status' => $payment->state,
];
```

**Recurring Charge** (for renewal after trial):

```php
$gopay->createRecurrentPayment($originalPaymentId, [
  'amount' => $plan->price_czk * 100,
  'currency' => 'CZK',
  'order_number' => $newSubscription->id,
  'order_description' => "Primát Plus - obnovení",
]);
```

---

## 5. Frontend Implementation

### 5.1 Types & Validations

Create `src/lib/validations/billing.ts`:

```typescript
import { z } from "zod";

export const billingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  priceCzk: z.number(),
  priceFormatted: z.string(),
  pricePerMonth: z.number().optional(),
  billingPeriod: z.enum(['monthly', 'yearly']),
  trialDays: z.number(),
  savingsPercent: z.number().optional(),
  savingsAmount: z.number().optional(),
  features: z.array(z.string()),
});

export const billingLimitsSchema = z.object({
  subscriptionType: z.enum(['free', 'trial', 'premium']),
  subscriptionExpiresAt: z.string().nullable(),
  daysSinceRegistration: z.number(),
  daysUntilPaywall: z.number(),
  hasUsedTrial: z.boolean(),
  limits: z.object({
    subjects: z.object({
      used: z.number(),
      max: z.number(),
      percentage: z.number(),
      isAtLimit: z.boolean(),
    }),
    sources: z.object({
      used: z.number(),
      max: z.number(),
      percentage: z.number(),
      isAtLimit: z.boolean(),
    }),
    chatConversations: z.object({
      used: z.number(),
      max: z.number(),
      percentage: z.number(),
      isAtLimit: z.boolean(),
    }),
    testQuestions: z.object({ max: z.number() }),
    flashcards: z.object({ max: z.number() }),
    fileSize: z.object({ max: z.number() }),
  }),
});

export const subscriptionSchema = z.object({
  subscriptionType: z.enum(['free', 'trial', 'premium']),
  subscriptionExpiresAt: z.string().nullable(),
  daysRemaining: z.number().nullable(),
  autoRenew: z.boolean(),
  currentPlan: billingPlanSchema.nullable(),
  paymentHistory: z.array(z.object({
    date: z.string(),
    amount: z.number(),
    status: z.string(),
    description: z.string(),
  })),
});

export type BillingPlan = z.infer<typeof billingPlanSchema>;
export type BillingLimits = z.infer<typeof billingLimitsSchema>;
export type Subscription = z.infer<typeof subscriptionSchema>;

export type PaywallReason = 
  | 'subject_limit'
  | 'source_limit'
  | 'chat_limit_soft'
  | 'chat_limit_hard'
  | 'test_question_limit'
  | 'flashcard_limit'
  | 'free_period_expired';

export type PaywallAction =
  | 'create_subject'
  | 'create_source'
  | 'chat_input'
  | 'chat_send'
  | 'generate_test'
  | 'generate_flashcards';
```

---

### 5.2 API Queries & Mutations

Create `src/lib/api/queries/billing.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api/client';
import { BillingLimits, BillingPlan, Subscription } from '@/lib/validations/billing';

export function useBillingLimits() {
  return useQuery({
    queryKey: ['billing', 'limits'],
    queryFn: () => get<{ data: BillingLimits }>('/billing/limits').then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

export function useBillingPlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: () => get<{ data: { plans: BillingPlan[] } }>('/billing/plans').then(r => r.data.plans),
    staleTime: 30 * 60 * 1000, // 30 minutes (plans rarely change)
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['billing', 'subscription'],
    queryFn: () => get<{ data: Subscription }>('/billing/subscription').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });
}
```

Create `src/lib/api/mutations/billing.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/lib/api/client';

interface CheckoutRequest {
  planId: number;
  returnUrl: string;
  notifyUrl: string;
}

interface CheckoutResponse {
  paymentId: string;
  gatewayUrl: string;
  status: string;
}

export function useCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutRequest) => 
      post<{ data: CheckoutResponse }>('/billing/checkout', data).then(r => r.data),
    onSuccess: (data) => {
      // Redirect to GoPay
      window.location.href = data.gatewayUrl;
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => post('/billing/cancel', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing', 'subscription'] });
    },
  });
}
```

---

### 5.3 Paywall Hook

Create `src/hooks/use-paywall.ts`:

```typescript
import { useCallback } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { useBillingLimits } from '@/lib/api/queries/billing';
import { usePaywallStore } from '@/stores/paywall-store';
import type { PaywallAction, PaywallReason } from '@/lib/validations/billing';

export function usePaywall() {
  const user = useAuthStore((state) => state.user);
  const { data: limits, isLoading } = useBillingLimits();
  const openPaywall = usePaywallStore((state) => state.open);
  
  const isPremiumUser = user?.subscriptionType === 'premium' || user?.subscriptionType === 'trial';
  
  const checkLimit = useCallback((action: PaywallAction): boolean => {
    // Premium users can do anything
    if (isPremiumUser) return true;
    
    // No limits data yet, allow action (will be caught by backend)
    if (!limits) return true;
    
    // Check 14-day free period
    if (limits.daysUntilPaywall <= 0) {
      return false;
    }
    
    // Check specific limits
    switch (action) {
      case 'create_subject':
        return !limits.limits.subjects.isAtLimit;
        
      case 'create_source':
        return !limits.limits.sources.isAtLimit;
        
      case 'chat_input':
        // Soft check for input focus (show warning at 80%)
        return limits.limits.chatConversations.percentage < 80;
        
      case 'chat_send':
        // Hard check for sending message
        return !limits.limits.chatConversations.isAtLimit;
        
      case 'generate_test':
      case 'generate_flashcards':
        // These have dynamic limits, backend will validate
        return true;
        
      default:
        return true;
    }
  }, [isPremiumUser, limits]);
  
  const showPaywall = useCallback((reason: PaywallReason) => {
    openPaywall(reason, limits);
  }, [openPaywall, limits]);
  
  const isAtLimit = useCallback((resource: 'subjects' | 'sources' | 'chat') => {
    if (isPremiumUser || !limits) return false;
    
    return limits.limits[resource === 'chat' ? 'chatConversations' : resource].isAtLimit;
  }, [isPremiumUser, limits]);
  
  return {
    checkLimit,
    showPaywall,
    isAtLimit,
    limits,
    isLoading,
    isPremiumUser,
  };
}
```

---

### 5.4 Paywall Store

Create `src/stores/paywall-store.ts`:

```typescript
import { create } from 'zustand';
import type { PaywallReason, BillingLimits } from '@/lib/validations/billing';

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
```

---

### 5.5 Paywall UI Components

#### Main Paywall Sheet

Create `src/components/paywall/paywall-sheet.tsx`:

```typescript
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePaywallStore } from '@/stores/paywall-store';
import { useBillingPlans } from '@/lib/api/queries/billing';
import { PricingTable } from './pricing-table';
import { LimitProgress } from './limit-progress';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const REASON_MESSAGES = {
  subject_limit: {
    title: 'Dosáhli jste limitu předmětů',
    description: 'Ve Free verzi můžete mít pouze 1 předmět. Přejděte na Premium a získejte neomezený počet předmětů.',
  },
  source_limit: {
    title: 'Dosáhli jste limitu materiálů',
    description: 'Ve Free verzi můžete mít pouze 1 materiál na předmět. Přejděte na Premium a přidávejte neomezeně.',
  },
  chat_limit_soft: {
    title: 'Blížíte se limitu konverzací',
    description: 'Ve Free verzi můžete vést 3 konverzace na materiál. Upgrade na Premium pro neomezené AI chaty.',
  },
  chat_limit_hard: {
    title: 'Dosáhli jste limitu konverzací',
    description: 'Vyčerpali jste 3 konverzace pro tento materiál. Přejděte na Premium pro neomezené AI chaty.',
  },
  test_question_limit: {
    title: 'Příliš mnoho otázek',
    description: 'Ve Free verzi můžete generovat testy max. do 15 otázek. Premium nabízí testy až se 100 otázkami.',
  },
  flashcard_limit: {
    title: 'Příliš mnoho kartiček',
    description: 'Ve Free verzi můžete generovat max. 30 kartiček najednou. Premium nabízí až 100 kartiček.',
  },
  free_period_expired: {
    title: 'Zkušební období vypršelo',
    description: 'Vaše 14denní zkušební období Free verze vypršelo. Přejděte na Premium a pokračujte bez omezení.',
  },
};

export function PaywallSheet() {
  const router = useRouter();
  const { isOpen, reason, limits, close } = usePaywallStore();
  const { data: plans } = useBillingPlans();
  
  if (!reason) return null;
  
  const message = REASON_MESSAGES[reason];
  const isSoftPaywall = reason === 'chat_limit_soft';
  
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <DialogTitle className="text-2xl">{message.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {message.description}
          </DialogDescription>
        </DialogHeader>
        
        {/* Current Limits */}
        {limits && (
          <div className="my-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Vaše aktuální využití:</h3>
            <LimitProgress 
              label="Předměty" 
              used={limits.limits.subjects.used} 
              max={limits.limits.subjects.max} 
            />
            <LimitProgress 
              label="Materiály" 
              used={limits.limits.sources.used} 
              max={limits.limits.sources.max} 
            />
            <LimitProgress 
              label="AI konverzace" 
              used={limits.limits.chatConversations.used} 
              max={limits.limits.chatConversations.max} 
            />
          </div>
        )}
        
        {/* Pricing Table */}
        {plans && <PricingTable plans={plans} />}
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {isSoftPaywall && (
            <Button variant="outline" onClick={close}>
              Pokračovat Free
            </Button>
          )}
          <Button 
            onClick={() => router.push('/predplatne')}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Vyzkoušet Premium zdarma 14 dní
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### Limit Progress Component

Create `src/components/paywall/limit-progress.tsx`:

```typescript
import { Progress } from '@/components/ui/progress';

interface LimitProgressProps {
  label: string;
  used: number;
  max: number;
}

export function LimitProgress({ label, used, max }: LimitProgressProps) {
  const percentage = (used / max) * 100;
  const isAtLimit = used >= max;
  const isNearLimit = percentage >= 80;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? 'text-destructive font-medium' : 'text-muted-foreground'}>
          {used} / {max}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2"
        indicatorClassName={isAtLimit ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : undefined}
      />
    </div>
  );
}
```

#### Pricing Table

Create `src/components/paywall/pricing-table.tsx`:

```typescript
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BillingPlan } from '@/lib/validations/billing';

interface PricingTableProps {
  plans: BillingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="p-6 relative">
          {plan.savingsPercent && (
            <Badge className="absolute top-4 right-4 bg-green-600">
              Ušetříte {plan.savingsPercent}%
            </Badge>
          )}
          
          <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
          
          <div className="mb-4">
            <span className="text-3xl font-bold">{plan.priceFormatted}</span>
            {plan.pricePerMonth && (
              <span className="text-muted-foreground text-sm ml-2">
                ({Math.round(plan.pricePerMonth)} Kč/měsíc)
              </span>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {plan.trialDays} dní zdarma, pak {plan.priceFormatted} /{' '}
              {plan.billingPeriod === 'monthly' ? 'měsíc' : 'rok'}
            </p>
          </div>
          
          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
```

---

### 5.6 Subscription Page

Create `src/app/(dashboard)/predplatne/page.tsx`:

```typescript
"use client";

import { useBillingPlans, useSubscription } from '@/lib/api/queries/billing';
import { useCheckout, useCancelSubscription } from '@/lib/api/mutations/billing';
import { PricingTable } from '@/components/paywall/pricing-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { data: plans, isLoading: plansLoading } = useBillingPlans();
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const checkoutMutation = useCheckout();
  const cancelMutation = useCancelSubscription();
  
  const handleUpgrade = (planId: number) => {
    checkoutMutation.mutate({
      planId,
      returnUrl: `${window.location.origin}/predplatne/uspech`,
      notifyUrl: `${process.env.NEXT_PUBLIC_API_URL}/billing/gopay-webhook`,
    });
  };
  
  if (plansLoading || subLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const isPremium = user?.subscriptionType === 'premium' || user?.subscriptionType === 'trial';
  
  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Předplatné</h1>
        <p className="text-muted-foreground">
          Spravujte své předplatné Primát Plus
        </p>
      </div>
      
      {/* Current Subscription */}
      {isPremium && subscription?.currentPlan && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Aktuální předplatné</h2>
          <div className="space-y-2">
            <p><strong>Plán:</strong> {subscription.currentPlan.name}</p>
            <p><strong>Stav:</strong> {subscription.subscriptionType === 'trial' ? 'Zkušební období' : 'Aktivní'}</p>
            {subscription.daysRemaining && (
              <p><strong>Zbývá dnů:</strong> {subscription.daysRemaining}</p>
            )}
            {subscription.currentPlan.nextBillingDate && (
              <p><strong>Další platba:</strong> {new Date(subscription.currentPlan.nextBillingDate).toLocaleDateString('cs-CZ')}</p>
            )}
          </div>
          
          {subscription.autoRenew && (
            <Button 
              variant="destructive" 
              className="mt-4"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              Zrušit předplatné
            </Button>
          )}
        </Card>
      )}
      
      {/* Available Plans */}
      {!isPremium && plans && (
        <>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Dostupné plány</h2>
            <PricingTable plans={plans} />
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <Button
                key={plan.id}
                size="lg"
                onClick={() => handleUpgrade(plan.id)}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Vybrat {plan.name}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

---

### 5.7 Paywall Guards Implementation

Add guards to existing components:

#### Subject Creation

Update `src/components/dialogs/create-subject-dialog.tsx`:

```typescript
import { usePaywall } from '@/hooks/use-paywall';

export function CreateSubjectDialog() {
  const { checkLimit, showPaywall } = usePaywall();
  const createMutation = useCreateSubject({
    onError: (error) => {
      if (error.code === 'SUBJECT_LIMIT_REACHED') {
        showPaywall('subject_limit');
      }
    },
  });
  
  const handleSubmit = () => {
    if (!checkLimit('create_subject')) {
      showPaywall('subject_limit');
      return;
    }
    
    createMutation.mutate(data);
  };
  
  // ... rest of component
}
```

#### Source Upload

Update `src/components/dialogs/upload-source-dialog.tsx`:

```typescript
import { usePaywall } from '@/hooks/use-paywall';

export function UploadSourceDialog() {
  const { checkLimit, showPaywall } = usePaywall();
  const uploadMutation = useUploadSource({
    onError: (error) => {
      if (error.code === 'SOURCE_LIMIT_REACHED') {
        showPaywall('source_limit');
      }
    },
  });
  
  const handleUpload = () => {
    if (!checkLimit('create_source')) {
      showPaywall('source_limit');
      return;
    }
    
    uploadMutation.mutate(data);
  };
  
  // ... rest
}
```

#### Chat Interface

Update `src/components/chat/chat-interface.tsx`:

```typescript
import { usePaywall } from '@/hooks/use-paywall';

export function ChatInterface() {
  const { checkLimit, showPaywall, isAtLimit } = usePaywall();
  const [inputValue, setInputValue] = useState('');
  
  const handleInputFocus = () => {
    if (!checkLimit('chat_input')) {
      showPaywall('chat_limit_soft');
    }
  };
  
  const handleSend = () => {
    if (!checkLimit('chat_send')) {
      showPaywall('chat_limit_hard');
      return;
    }
    
    sendMutation.mutate({ message: inputValue, sourceId, model });
  };
  
  return (
    <div>
      {/* ... messages */}
      <textarea 
        onFocus={handleInputFocus}
        disabled={isAtLimit('chat')}
        placeholder={isAtLimit('chat') ? 'Dosáhli jste limitu konverzací' : 'Napište zprávu...'}
      />
    </div>
  );
}
```

---

### 5.8 MSW Mock Handlers

Create `src/mocks/handlers/billing.ts`:

```typescript
import { http, HttpResponse } from 'msw';
import { apiPath } from '../utils';

const mockLimits = {
  subscriptionType: 'free' as const,
  subscriptionExpiresAt: null,
  daysSinceRegistration: 7,
  daysUntilPaywall: 7,
  hasUsedTrial: false,
  limits: {
    subjects: { used: 1, max: 1, percentage: 100, isAtLimit: true },
    sources: { used: 0, max: 1, percentage: 0, isAtLimit: false },
    chatConversations: { used: 2, max: 3, percentage: 66, isAtLimit: false },
    testQuestions: { max: 15 },
    flashcards: { max: 30 },
    fileSize: { max: 10485760 },
  },
};

const mockPlans = [
  {
    id: 1,
    name: 'Premium Monthly',
    priceCzk: 199.00,
    priceFormatted: '199 Kč',
    billingPeriod: 'monthly' as const,
    trialDays: 14,
    features: [
      'Neomezené předměty',
      'Neomezené materiály',
      'AI chat bez limitů',
      'Testy do 100 otázek',
      'Prioritní podpora',
    ],
  },
  {
    id: 2,
    name: 'Premium Yearly',
    priceCzk: 1990.00,
    priceFormatted: '1 990 Kč',
    pricePerMonth: 165.83,
    billingPeriod: 'yearly' as const,
    trialDays: 14,
    savingsPercent: 17,
    savingsAmount: 398.00,
    features: [
      'Všechny Premium funkce',
      'Ušetříte 17% ročně',
      'Prioritní podpora',
    ],
  },
];

export const billingHandlers = [
  http.get(apiPath('/billing/limits'), async () => {
    await new Promise(r => setTimeout(r, 300));
    
    return HttpResponse.json({
      success: true,
      data: mockLimits,
    });
  }),
  
  http.get(apiPath('/billing/plans'), async () => {
    await new Promise(r => setTimeout(r, 300));
    
    return HttpResponse.json({
      success: true,
      data: { plans: mockPlans },
    });
  }),
  
  http.post(apiPath('/billing/checkout'), async ({ request }) => {
    await new Promise(r => setTimeout(r, 500));
    
    const body = await request.json() as any;
    
    return HttpResponse.json({
      success: true,
      data: {
        paymentId: 'mock-payment-' + Date.now(),
        gatewayUrl: body.returnUrl + '?status=success&mock=true',
        status: 'CREATED',
      },
    });
  }),
  
  http.get(apiPath('/billing/subscription'), async () => {
    await new Promise(r => setTimeout(r, 300));
    
    return HttpResponse.json({
      success: true,
      data: {
        subscriptionType: 'free',
        subscriptionExpiresAt: null,
        daysRemaining: null,
        autoRenew: false,
        currentPlan: null,
        paymentHistory: [],
      },
    });
  }),
  
  http.post(apiPath('/billing/cancel'), async () => {
    await new Promise(r => setTimeout(r, 500));
    
    return HttpResponse.json({
      success: true,
      data: {
        message: 'Předplatné bude zrušeno k 2025-11-28',
        expiresAt: '2025-11-28T12:00:00Z',
      },
    });
  }),
];
```

Update `src/mocks/handlers/index.ts`:

```typescript
import { billingHandlers } from './billing';

export const handlers = [
  ...authHandlers,
  ...subjectsHandlers,
  ...billingHandlers, // Add this
  // ... other handlers
];
```

---

## 6. Testing Strategy

### Frontend Testing

**Unit Tests**:

- `usePaywall` hook logic
- Limit calculation functions
- Paywall reason mapping

**Integration Tests**:

- Paywall triggers on subject/source creation
- Chat limit enforcement
- MSW mock responses

**E2E Tests**:

- Full checkout flow (mocked GoPay)
- Subscription cancellation
- Paywall appearance after limits hit

### Backend Testing

**Unit Tests**:

- Limit checking functions
- Date calculations (14-day period)
- Conversation counting

**Integration Tests**:

- Billing endpoints
- Middleware responses (402 errors)
- GoPay webhook handling

**Manual Testing Checklist**:

- [ ] Free user sees paywall after 14 days
- [ ] Creating 2nd subject shows paywall
- [ ] Chat shows soft paywall at 3rd conversation
- [ ] Test generation blocks at >15 questions
- [ ] GoPay payment redirects correctly
- [ ] Trial activates after payment
- [ ] Subscription auto-renews after trial

---

## 7. Edge Cases & Error Handling

### Free Period Expiration

- **Scenario**: User registered 14+ days ago, tries any action
- **Backend**: Return 402 with code `FREE_PERIOD_EXPIRED`
- **Frontend**: Show paywall with countdown (e.g., "Zkušební období vypršelo před 3 dny")

### Race Condition on Limits

- **Scenario**: User creates subject while at limit (e.g., multiple tabs)
- **Backend**: Use database-level checks with `SELECT FOR UPDATE` to prevent race conditions
- **Frontend**: Show generic error, refetch limits

### Payment Failures

- **Scenario**: GoPay payment fails or is cancelled
- **Backend**: Webhook receives `CANCELED` state, delete pending subscription
- **Frontend**: Redirect to returnUrl with `?status=failed`, show error message

### Trial Already Used

- **Scenario**: User tries to get trial again with same account
- **Backend**: Check `has_used_trial` flag, return 400 error
- **Frontend**: Show message "Zkušební období lze použít pouze jednou"

### Conversation Counting

- **Scenario**: What counts as a conversation?
- **Definition**: 1 user message + 1 AI response = 1 conversation
- **Implementation**: Store in `chat_conversations` table, increment on each complete exchange
- **Note**: Conversations are per-source (user can have 3 conversations per source)

---

## 8. Extensibility Considerations

### Adding New Tiers

- Database-driven plans in `billing_plans` table
- Easy to add "Team" or "Enterprise" tiers
- Limits are configurable constants

### Changing Limits

- Update `FREE_TIER_LIMITS` constant in frontend
- Update validation in backend middleware
- No database changes needed for limit adjustments

### Alternative Payment Providers

- Abstract payment logic into `PaymentService` interface
- GoPay implementation in `GoPayPaymentService`
- Easy to add Stripe, PayPal, etc. by implementing same interface

### Feature Flags per Plan

- Store `features` JSON in `billing_plans` table
- Backend checks: `if (plan.features.includes('ai_chat'))`
- Frontend conditionally renders features based on plan

---

## 9. Implementation Deliverables

### Frontend Implementation

1. ✅ Paywall UI components (sheet, progress, pricing table)
2. ✅ `usePaywall` hook with limit checking
3. ✅ Billing API queries and mutations
4. ✅ MSW mock handlers
5. ✅ Paywall guards on all resource creation points
6. ✅ Subscription management page
7. ✅ Updated limits constants

### Backend Specification Document

- Comprehensive markdown document in `docs/paywall-billing-spec.md`
- Database schema with SQL
- API endpoints with full request/response examples
- GoPay integration guide
- Middleware implementation examples
- Testing requirements

---

## 10. Key Decisions Summary

| Decision | Choice | Rationale |

|----------|--------|-----------|

| Free trial period | 14 days from registration | Per BE spec |

| Free tier limits | 1 subject, 1 source | Per BE spec (not FE spec) |

| Trial period calculation | Use `user.created_at` | Simpler, no extra field needed |

| Chat limit counting | 3 complete conversations per source | Clear, trackable metric |

| Payment gateway | GoPay | Czech market standard |

| Trial activation | After first payment | Standard SaaS pattern |

| Paywall response code | 402 Payment Required | Standard HTTP code |

| Limit checking | Backend middleware | Security + consistency |

| Conversation storage | Separate table | Accurate counting, queryable |

| Extensibility | Database-driven plans | Easy to add tiers without code changes |

### To-dos

- [ ] Update FREE_TIER_LIMITS in src/lib/constants.ts to match BE spec (1 subject, 1 source, etc.)
- [ ] Create src/lib/validations/billing.ts with types for plans, limits, subscriptions
- [ ] Build paywall UI components (sheet, limit indicators, pricing table)
- [ ] Implement src/hooks/use-paywall.ts with limit checking and trigger logic
- [ ] Create frontend billing API mutations (checkout, cancel, fetch limits)
- [ ] Add MSW mock handlers for billing endpoints
- [ ] Add paywall guards to subject/source creation, chat, test/flashcard generation
- [ ] Backend: Create database migrations for subscriptions and billing_plans tables
- [ ] Backend: Implement LimitCheckMiddleware with 14-day check and resource limits
- [ ] Backend: Create /billing/limits, /billing/plans, /billing/checkout, /billing/subscription endpoints
- [ ] Backend: Integrate GoPay SDK and implement payment webhook handler
- [ ] Backend: Implement trial activation logic in webhook (subscriptionType=trial, expires in 14 days)
- [ ] Backend: Create cron job/queue for checking trial expiration and auto-charging premium