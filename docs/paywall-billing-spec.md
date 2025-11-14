# Paywall & Billing System - Backend Specification

## Document Overview

This specification defines the complete backend implementation for the paywall and subscription system in Primát Plus. It includes database schema, API endpoints, business logic, GoPay payment integration, and middleware for limit enforcement.

**Version:** 1.0  
**Date:** 2025-01-14  
**Target:** Backend Developer  
**Frontend Status:** ✅ Implemented and ready for integration

---

## Table of Contents

1. [Business Requirements](#1-business-requirements)
2. [Database Schema](#2-database-schema)
3. [API Endpoints](#3-api-endpoints)
4. [Limit Checking Middleware](#4-limit-checking-middleware)
5. [GoPay Payment Integration](#5-gopay-payment-integration)
6. [Subscription Management](#6-subscription-management)
7. [Error Handling](#7-error-handling)
8. [Testing Requirements](#8-testing-requirements)
9. [Security Considerations](#9-security-considerations)
10. [Implementation Checklist](#10-implementation-checklist)

---

## 1. Business Requirements

### 1.1 Subscription Tiers

| Tier | Description | Duration | Price |
|------|-------------|----------|-------|
| **Free** | Limited features, 14-day grace period | Unlimited | Free |
| **Trial** | Full Premium features after payment | 14 days | Free (requires payment method) |
| **Premium** | Full features, recurring billing | Monthly/Yearly | 199 Kč / 1990 Kč |

### 1.2 Free Tier Limits

| Resource | Free Limit | Premium |
|----------|-----------|---------|
| Subjects | 1 | Unlimited |
| Sources (materials per subject) | 1 | Unlimited |
| Test questions | 15 per test | 100 per test |
| Flashcards | 30 per generation | 100 per generation |
| Chat conversations | 3 per source | Unlimited |
| File upload size | 10 MB | 100 MB |

### 1.3 User Journey

```
1. User registers → subscription_type = 'free', created_at = NOW()
2. User has 14 days OR until hitting limits (whichever comes first)
3. Paywall triggered → User sees upgrade options
4. User selects plan → Redirected to GoPay
5. User enters payment → Payment webhook received
6. Backend activates trial → subscription_type = 'trial', expires_at = NOW() + 14 days
7. After 14 days → Auto-charge via GoPay recurring payment
8. Backend updates → subscription_type = 'premium', expires_at = NOW() + 1 month/year
```

### 1.4 Paywall Triggers

**Time-based:**
- 14 days have passed since user registration (`DATEDIFF(NOW(), user.created_at) >= 14`)

**Resource-based:**
- Creating 2nd subject
- Adding 2nd source to any subject
- Generating test with >15 questions
- Generating >30 flashcards
- Using chat after 3 conversations on a source

---

## 2. Database Schema

### 2.1 Users Table Extensions

Add these columns to the existing `users` table:

```sql
ALTER TABLE users 
  ADD COLUMN trial_ends_at DATETIME NULL COMMENT 'End date of Premium trial period',
  ADD COLUMN payment_method_id VARCHAR(255) NULL COMMENT 'GoPay recurring payment ID for auto-renewal',
  ADD COLUMN auto_renew BOOLEAN DEFAULT TRUE COMMENT 'Whether subscription auto-renews',
  ADD COLUMN has_used_trial BOOLEAN DEFAULT FALSE COMMENT 'Prevents users from using trial multiple times';
```

**Existing columns used:**
- `subscription_type` - Already exists: ENUM('free', 'premium', 'trial')
- `subscription_expires_at` - Already exists: DATETIME
- `created_at` - Used for calculating 14-day period

### 2.2 Subscriptions Table (New)

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  plan_id INT NOT NULL,
  status ENUM('pending', 'active', 'trial', 'cancelled', 'expired') NOT NULL DEFAULT 'pending',
  started_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  gopay_payment_id VARCHAR(255) NULL COMMENT 'GoPay payment ID for this subscription',
  gopay_recurrence_id VARCHAR(255) NULL COMMENT 'GoPay recurrence ID for auto-renewal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES billing_plans(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2.3 Billing Plans Table (New)

```sql
CREATE TABLE billing_plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price_czk DECIMAL(10, 2) NOT NULL,
  billing_period ENUM('monthly', 'yearly') NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  trial_days INT DEFAULT 14,
  features JSON COMMENT 'Array of feature strings for display',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default plans
INSERT INTO billing_plans (name, price_czk, billing_period, is_active, trial_days, features) VALUES
  ('Premium Monthly', 199.00, 'monthly', TRUE, 14, 
   '["Neomezené předměty", "Neomezené materiály", "AI chat bez limitů", "Testy do 100 otázek", "Prioritní podpora"]'),
  ('Premium Yearly', 1990.00, 'yearly', TRUE, 14, 
   '["Všechny Premium funkce", "Ušetříte 17% ročně", "Prioritní podpora", "Fakturace jednou ročně"]');
```

### 2.4 Chat Conversations Table (New)

```sql
CREATE TABLE chat_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  source_id INT NOT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_count INT DEFAULT 0,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  INDEX idx_user_source (user_id, source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Purpose:** Track chat conversations per source to enforce the 3-conversation limit for free users.

**When to increment:**
- When a user sends a message AND receives an AI response (1 complete conversation = 1 user message + 1 AI response)
- Create new row if none exists, otherwise increment `message_count` and update `last_message_at`

---

## 3. API Endpoints

All endpoints are under `/api/v1/billing/` and require authentication.

### 3.1 GET `/api/v1/billing/limits`

Returns current usage and limits for the authenticated user.

**Authentication:** Required  
**HTTP Method:** GET  
**Request Headers:**
```
Authorization: Bearer {jwt_token}
```

**Response (200 OK):**
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
      "subjects": { 
        "used": 1, 
        "max": 1, 
        "percentage": 100, 
        "isAtLimit": true 
      },
      "sources": { 
        "used": 0, 
        "max": 1, 
        "percentage": 0, 
        "isAtLimit": false 
      },
      "chatConversations": { 
        "used": 2, 
        "max": 3, 
        "percentage": 66, 
        "isAtLimit": false 
      },
      "testQuestions": { "max": 15 },
      "flashcards": { "max": 30 },
      "fileSize": { "max": 10485760 }
    }
  }
}
```

**Business Logic:**

```php
public function getLimits(Request $request): JsonResponse
{
    $user = $request->user();
    
    // Determine limits based on subscription type
    $isPremium = in_array($user->subscription_type, ['premium', 'trial']);
    $maxSubjects = $isPremium ? 999 : 1;
    $maxSources = $isPremium ? 999 : 1;
    $maxChat = $isPremium ? 999 : 3;
    
    // Count current usage
    $usedSubjects = Subject::where('user_id', $user->id)->count();
    $usedSources = Source::where('user_id', $user->id)->count();
    
    // Count chat conversations (sum of all conversations across all sources)
    $usedChat = ChatConversation::where('user_id', $user->id)->count();
    
    // Calculate days since registration
    $daysSince = now()->diffInDays($user->created_at);
    $daysUntil = max(0, 14 - $daysSince);
    
    return response()->json([
        'success' => true,
        'data' => [
            'subscriptionType' => $user->subscription_type,
            'subscriptionExpiresAt' => $user->subscription_expires_at,
            'daysSinceRegistration' => $daysSince,
            'daysUntilPaywall' => $daysUntil,
            'hasUsedTrial' => $user->has_used_trial,
            'limits' => [
                'subjects' => [
                    'used' => $usedSubjects,
                    'max' => $maxSubjects,
                    'percentage' => ($usedSubjects / $maxSubjects) * 100,
                    'isAtLimit' => $usedSubjects >= $maxSubjects,
                ],
                'sources' => [
                    'used' => $usedSources,
                    'max' => $maxSources,
                    'percentage' => ($usedSources / $maxSources) * 100,
                    'isAtLimit' => $usedSources >= $maxSources,
                ],
                'chatConversations' => [
                    'used' => $usedChat,
                    'max' => $maxChat,
                    'percentage' => ($usedChat / $maxChat) * 100,
                    'isAtLimit' => $usedChat >= $maxChat,
                ],
                'testQuestions' => ['max' => $isPremium ? 100 : 15],
                'flashcards' => ['max' => $isPremium ? 100 : 30],
                'fileSize' => ['max' => $isPremium ? 104857600 : 10485760],
            ],
        ],
    ]);
}
```

---

### 3.2 GET `/api/v1/billing/plans`

Returns available subscription plans.

**Authentication:** Not required (public endpoint)  
**HTTP Method:** GET

**Response (200 OK):**
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

**Business Logic:**

```php
public function getPlans(): JsonResponse
{
    $plans = BillingPlan::where('is_active', true)->get();
    
    $formattedPlans = $plans->map(function ($plan) {
        $data = [
            'id' => $plan->id,
            'name' => $plan->name,
            'priceCzk' => $plan->price_czk,
            'priceFormatted' => number_format($plan->price_czk, 0, ',', ' ') . ' Kč',
            'billingPeriod' => $plan->billing_period,
            'trialDays' => $plan->trial_days,
            'features' => json_decode($plan->features),
        ];
        
        // Calculate savings for yearly plan
        if ($plan->billing_period === 'yearly') {
            $monthlyPlan = BillingPlan::where('billing_period', 'monthly')
                ->where('is_active', true)
                ->first();
            
            if ($monthlyPlan) {
                $yearlyPrice = $plan->price_czk;
                $monthlyYearly = $monthlyPlan->price_czk * 12;
                $savings = $monthlyYearly - $yearlyPrice;
                $savingsPercent = ($savings / $monthlyYearly) * 100;
                
                $data['pricePerMonth'] = $yearlyPrice / 12;
                $data['savingsPercent'] = round($savingsPercent);
                $data['savingsAmount'] = $savings;
            }
        }
        
        return $data;
    });
    
    return response()->json([
        'success' => true,
        'data' => ['plans' => $formattedPlans],
    ]);
}
```

---

### 3.3 POST `/api/v1/billing/checkout`

Creates a GoPay payment and returns the payment gateway URL.

**Authentication:** Required  
**HTTP Method:** POST  
**Request Body:**
```json
{
  "planId": 1,
  "returnUrl": "https://primat.cz/predplatne/uspech",
  "notifyUrl": "https://api.primat.cz/api/v1/billing/gopay-webhook"
}
```

**Response (200 OK):**
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

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "code": "TRIAL_ALREADY_USED",
    "message": "Zkušební období již bylo použito"
  }
}
```

**Business Logic:**

```php
public function createCheckout(Request $request): JsonResponse
{
    $user = $request->user();
    $planId = $request->input('planId');
    $returnUrl = $request->input('returnUrl');
    $notifyUrl = $request->input('notifyUrl');
    
    // Check if user has already used trial
    if ($user->has_used_trial) {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'TRIAL_ALREADY_USED',
                'message' => 'Zkušební období již bylo použito',
            ],
        ], 400);
    }
    
    // Get plan
    $plan = BillingPlan::findOrFail($planId);
    
    // Create subscription record
    $subscription = Subscription::create([
        'user_id' => $user->id,
        'plan_id' => $plan->id,
        'status' => 'pending',
        'started_at' => now(),
        'expires_at' => now()->addDays($plan->trial_days),
        'auto_renew' => true,
    ]);
    
    // Create GoPay payment
    $gopayService = app(GoPayService::class);
    $payment = $gopayService->createPayment([
        'amount' => $plan->price_czk * 100, // Convert to haléře
        'currency' => 'CZK',
        'order_number' => (string) $subscription->id,
        'order_description' => "Primát Plus - {$plan->name}",
        'items' => [
            [
                'name' => $plan->name,
                'amount' => $plan->price_czk * 100,
                'count' => 1,
            ],
        ],
        'callback' => [
            'return_url' => $returnUrl,
            'notification_url' => $notifyUrl,
        ],
        'recurrence' => [
            'recurrence_cycle' => 'ON_DEMAND',
            'recurrence_date_to' => now()->addYear()->format('Y-m-d'),
        ],
    ]);
    
    // Store GoPay payment ID
    $subscription->update([
        'gopay_payment_id' => $payment->id,
    ]);
    
    return response()->json([
        'success' => true,
        'data' => [
            'paymentId' => $payment->id,
            'gatewayUrl' => $payment->gw_url,
            'status' => $payment->state,
        ],
    ]);
}
```

---

### 3.4 POST `/api/v1/billing/gopay-webhook`

Handles payment notifications from GoPay.

**Authentication:** GoPay signature verification  
**HTTP Method:** POST  
**Request Body (from GoPay):**
```json
{
  "id": 3000123456,
  "state": "PAID",
  "amount": 19900,
  "currency": "CZK",
  "gw_url": "https://gate.gopay.cz/gw/v3/3000123456",
  "recurrence": {
    "recurrence_cycle": "ON_DEMAND",
    "recurrence_state": "STARTED",
    "recurrence_date_to": "2026-11-14"
  }
}
```

**Response:** Always `200 OK` (to prevent GoPay retries)

**Business Logic:**

```php
public function handleGoPayWebhook(Request $request): JsonResponse
{
    // Verify GoPay signature
    $gopayService = app(GoPayService::class);
    if (!$gopayService->verifyWebhookSignature($request)) {
        Log::warning('Invalid GoPay webhook signature');
        return response()->json(['success' => false], 401);
    }
    
    $paymentId = $request->input('id');
    $state = $request->input('state');
    $recurrence = $request->input('recurrence');
    
    // Find subscription by GoPay payment ID
    $subscription = Subscription::where('gopay_payment_id', $paymentId)->first();
    
    if (!$subscription) {
        Log::error("Subscription not found for GoPay payment: {$paymentId}");
        return response()->json(['success' => true]); // Return 200 to prevent retries
    }
    
    $user = $subscription->user;
    
    switch ($state) {
        case 'PAID':
            // Payment successful - activate trial
            $subscription->update([
                'status' => 'trial',
                'gopay_recurrence_id' => $recurrence['recurrence_state'] ?? null,
            ]);
            
            $user->update([
                'subscription_type' => 'trial',
                'subscription_expires_at' => $subscription->expires_at,
                'trial_ends_at' => $subscription->expires_at,
                'has_used_trial' => true,
                'payment_method_id' => $recurrence['recurrence_state'] ?? null,
            ]);
            
            // Schedule renewal job to run when trial expires
            dispatch(new SubscriptionRenewalJob($subscription->id))
                ->delay($subscription->expires_at);
            
            // Send confirmation email
            Mail::to($user->email)->send(new TrialActivatedMail($user, $subscription));
            
            Log::info("Trial activated for user {$user->id}, expires at {$subscription->expires_at}");
            break;
            
        case 'CANCELED':
        case 'TIMEOUTED':
            // Payment cancelled or timed out
            $subscription->update(['status' => 'cancelled']);
            
            // Send notification email
            Mail::to($user->email)->send(new PaymentFailedMail($user));
            
            Log::info("Payment {$state} for subscription {$subscription->id}");
            break;
            
        case 'REFUNDED':
            // Handle refund
            $subscription->update(['status' => 'cancelled']);
            $user->update([
                'subscription_type' => 'free',
                'subscription_expires_at' => null,
            ]);
            
            Log::info("Payment refunded for subscription {$subscription->id}");
            break;
    }
    
    return response()->json(['success' => true]);
}
```

---

### 3.5 GET `/api/v1/billing/subscription`

Returns current subscription details for the authenticated user.

**Authentication:** Required  
**HTTP Method:** GET

**Response (200 OK) - Trial User:**
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
      "priceFormatted": "199 Kč",
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

**Response (200 OK) - Free User:**
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

**Business Logic:**

```php
public function getSubscription(Request $request): JsonResponse
{
    $user = $request->user();
    
    $currentSubscription = Subscription::where('user_id', $user->id)
        ->whereIn('status', ['trial', 'active'])
        ->with('plan')
        ->first();
    
    $data = [
        'subscriptionType' => $user->subscription_type,
        'subscriptionExpiresAt' => $user->subscription_expires_at,
        'daysRemaining' => $user->subscription_expires_at 
            ? max(0, now()->diffInDays($user->subscription_expires_at, false))
            : null,
        'autoRenew' => $user->auto_renew,
        'currentPlan' => null,
        'paymentHistory' => [],
    ];
    
    if ($currentSubscription && $currentSubscription->plan) {
        $plan = $currentSubscription->plan;
        $data['currentPlan'] = [
            'id' => $plan->id,
            'name' => $plan->name,
            'priceCzk' => $plan->price_czk,
            'priceFormatted' => number_format($plan->price_czk, 0, ',', ' ') . ' Kč',
            'billingPeriod' => $plan->billing_period,
            'nextBillingDate' => $currentSubscription->expires_at->format('Y-m-d'),
            'nextBillingAmount' => $plan->price_czk,
        ];
    }
    
    // Get payment history (could add a payments table for this)
    $paymentHistory = Subscription::where('user_id', $user->id)
        ->whereIn('status', ['active', 'trial', 'expired'])
        ->with('plan')
        ->get()
        ->map(function ($sub) {
            return [
                'date' => $sub->created_at->format('Y-m-d'),
                'amount' => $sub->plan->price_czk,
                'status' => $sub->status === 'active' || $sub->status === 'trial' ? 'paid' : 'expired',
                'description' => "Primát Plus - {$sub->plan->name}",
            ];
        });
    
    $data['paymentHistory'] = $paymentHistory;
    
    return response()->json([
        'success' => true,
        'data' => $data,
    ]);
}
```

---

### 3.6 POST `/api/v1/billing/cancel`

Cancels subscription auto-renewal (user keeps premium until expiration).

**Authentication:** Required  
**HTTP Method:** POST  
**Request Body:** Empty

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Předplatné bude zrušeno k 2025-11-28",
    "expiresAt": "2025-11-28T12:00:00Z"
  }
}
```

**Business Logic:**

```php
public function cancelSubscription(Request $request): JsonResponse
{
    $user = $request->user();
    
    // Find active subscription
    $subscription = Subscription::where('user_id', $user->id)
        ->whereIn('status', ['trial', 'active'])
        ->first();
    
    if (!$subscription) {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => 'NO_ACTIVE_SUBSCRIPTION',
                'message' => 'Žádné aktivní předplatné',
            ],
        ], 404);
    }
    
    // Disable auto-renewal
    $subscription->update(['auto_renew' => false]);
    $user->update(['auto_renew' => false]);
    
    // Cancel GoPay recurrence
    if ($subscription->gopay_recurrence_id) {
        $gopayService = app(GoPayService::class);
        $gopayService->cancelRecurrence($subscription->gopay_recurrence_id);
    }
    
    // Send confirmation email
    Mail::to($user->email)->send(new SubscriptionCancelledMail($user, $subscription));
    
    return response()->json([
        'success' => true,
        'data' => [
            'message' => "Předplatné bude zrušeno k {$subscription->expires_at->format('d.m.Y')}",
            'expiresAt' => $subscription->expires_at->toIso8601String(),
        ],
    ]);
}
```

---

## 4. Limit Checking Middleware

Create middleware to enforce limits on resource creation endpoints.

### 4.1 Middleware Implementation

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\Subject;
use App\Models\Source;
use App\Models\ChatConversation;

class CheckSubscriptionLimits
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        
        // Premium and trial users bypass all checks
        if (in_array($user->subscription_type, ['premium', 'trial'])) {
            return $next($request);
        }
        
        // Check 14-day free period
        if ($this->hasExpiredFreePeriod($user)) {
            return $this->paywallResponse('FREE_PERIOD_EXPIRED', 
                'Zkušební období vypršelo. Přejděte na Premium.');
        }
        
        // Route-specific limit checks
        $route = $request->route()->getName();
        
        switch ($route) {
            case 'subjects.store':
                if ($this->hasReachedSubjectLimit($user)) {
                    return $this->paywallResponse('SUBJECT_LIMIT_REACHED',
                        'Dosáhli jste limitu předmětů (1). Přejděte na Premium.');
                }
                break;
                
            case 'sources.store':
                if ($this->hasReachedSourceLimit($user)) {
                    return $this->paywallResponse('SOURCE_LIMIT_REACHED',
                        'Dosáhli jste limitu materiálů (1). Přejděte na Premium.');
                }
                break;
                
            case 'chat.send':
                $sourceId = $request->input('sourceId');
                if ($this->hasReachedChatLimit($user, $sourceId)) {
                    return $this->paywallResponse('CHAT_LIMIT_REACHED',
                        'Dosáhli jste limitu konverzací (3 na materiál). Přejděte na Premium.');
                }
                break;
                
            case 'tests.generate':
                $questionCount = $request->input('questionCount');
                if ($questionCount > 15) {
                    return $this->paywallResponse('TEST_QUESTION_LIMIT',
                        'Ve Free verzi můžete generovat maximálně 15 otázek.');
                }
                break;
                
            case 'flashcards.generate':
                $count = $request->input('count');
                if ($count > 30) {
                    return $this->paywallResponse('FLASHCARD_LIMIT',
                        'Ve Free verzi můžete generovat maximálně 30 kartiček.');
                }
                break;
        }
        
        return $next($request);
    }
    
    private function hasExpiredFreePeriod($user): bool
    {
        $daysSinceRegistration = now()->diffInDays($user->created_at);
        return $daysSinceRegistration >= 14;
    }
    
    private function hasReachedSubjectLimit($user): bool
    {
        $count = Subject::where('user_id', $user->id)->count();
        return $count >= 1;
    }
    
    private function hasReachedSourceLimit($user): bool
    {
        $count = Source::where('user_id', $user->id)->count();
        return $count >= 1;
    }
    
    private function hasReachedChatLimit($user, $sourceId): bool
    {
        $count = ChatConversation::where('user_id', $user->id)
            ->where('source_id', $sourceId)
            ->count();
        return $count >= 3;
    }
    
    private function paywallResponse(string $code, string $message): JsonResponse
    {
        return response()->json([
            'success' => false,
            'error' => [
                'code' => $code,
                'message' => $message,
                'requiresUpgrade' => true,
            ],
        ], 402); // 402 Payment Required
    }
}
```

### 4.2 Register Middleware

In `app/Http/Kernel.php`:

```php
protected $routeMiddleware = [
    // ... existing middleware
    'check.limits' => \App\Http\Middleware\CheckSubscriptionLimits::class,
];
```

### 4.3 Apply to Routes

In `routes/api.php`:

```php
Route::middleware(['auth:sanctum', 'check.limits'])->group(function () {
    Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::post('/sources', [SourceController::class, 'store'])->name('sources.store');
    Route::post('/chat/send', [ChatController::class, 'send'])->name('chat.send');
    Route::post('/sources/{id}/generate-flashcards', [FlashcardController::class, 'generate'])->name('flashcards.generate');
    Route::post('/sources/{id}/generate-test', [TestController::class, 'generate'])->name('tests.generate');
});
```

---

## 5. GoPay Payment Integration

### 5.1 Installation

```bash
composer require gopay/payments-sdk-php
```

### 5.2 Configuration

Add to `.env`:

```env
GOPAY_GOID=8123456789
GOPAY_CLIENT_ID=your_client_id
GOPAY_CLIENT_SECRET=your_secret
GOPAY_IS_PRODUCTION=false
GOPAY_WEBHOOK_SECRET=your_webhook_secret
```

Add to `config/services.php`:

```php
'gopay' => [
    'goid' => env('GOPAY_GOID'),
    'client_id' => env('GOPAY_CLIENT_ID'),
    'client_secret' => env('GOPAY_CLIENT_SECRET'),
    'is_production' => env('GOPAY_IS_PRODUCTION', false),
    'webhook_secret' => env('GOPAY_WEBHOOK_SECRET'),
],
```

### 5.3 GoPay Service

Create `app/Services/GoPayService.php`:

```php
<?php

namespace App\Services;

use GoPay\GoPay;
use Illuminate\Http\Request;

class GoPayService
{
    private $gopay;
    
    public function __construct()
    {
        $this->gopay = GoPay::payments([
            'goid' => config('services.gopay.goid'),
            'clientId' => config('services.gopay.client_id'),
            'clientSecret' => config('services.gopay.client_secret'),
            'isProductionMode' => config('services.gopay.is_production'),
        ]);
    }
    
    public function createPayment(array $data)
    {
        $response = $this->gopay->createPayment([
            'payer' => [
                'default_payment_instrument' => 'PAYMENT_CARD',
                'allowed_payment_instruments' => ['PAYMENT_CARD'],
                'contact' => [
                    'email' => auth()->user()->email ?? '',
                ],
            ],
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'order_number' => $data['order_number'],
            'order_description' => $data['order_description'],
            'items' => $data['items'],
            'callback' => $data['callback'],
            'recurrence' => $data['recurrence'],
            'lang' => 'CS',
        ]);
        
        if ($response->hasSucceed()) {
            return $response->json;
        }
        
        throw new \Exception('GoPay payment creation failed: ' . json_encode($response->json));
    }
    
    public function createRecurrentPayment($parentPaymentId, array $data)
    {
        $response = $this->gopay->createRecurrence($parentPaymentId, [
            'amount' => $data['amount'],
            'currency' => $data['currency'],
            'order_number' => $data['order_number'],
            'order_description' => $data['order_description'],
            'items' => $data['items'] ?? [],
        ]);
        
        if ($response->hasSucceed()) {
            return $response->json;
        }
        
        throw new \Exception('GoPay recurrent payment failed: ' . json_encode($response->json));
    }
    
    public function cancelRecurrence($recurrenceId)
    {
        $response = $this->gopay->voidRecurrence($recurrenceId);
        return $response->hasSucceed();
    }
    
    public function verifyWebhookSignature(Request $request): bool
    {
        $signature = $request->header('X-Signature');
        $body = $request->getContent();
        $secret = config('services.gopay.webhook_secret');
        
        $expectedSignature = hash_hmac('sha256', $body, $secret);
        
        return hash_equals($expectedSignature, $signature);
    }
}
```

---

## 6. Subscription Management

### 6.1 Renewal Job

Create `app/Jobs/SubscriptionRenewalJob.php`:

```php
<?php

namespace App\Jobs;

use App\Models\Subscription;
use App\Services\GoPayService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SubscriptionRenewalJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $subscriptionId;
    
    public function __construct($subscriptionId)
    {
        $this->subscriptionId = $subscriptionId;
    }
    
    public function handle(GoPayService $gopayService)
    {
        $subscription = Subscription::find($this->subscriptionId);
        
        if (!$subscription || !$subscription->auto_renew) {
            return; // Subscription cancelled or not found
        }
        
        $user = $subscription->user;
        $plan = $subscription->plan;
        
        try {
            // Charge via GoPay recurring payment
            $payment = $gopayService->createRecurrentPayment(
                $subscription->gopay_payment_id,
                [
                    'amount' => $plan->price_czk * 100,
                    'currency' => 'CZK',
                    'order_number' => 'renewal-' . $subscription->id . '-' . now()->timestamp,
                    'order_description' => "Primát Plus - obnovení - {$plan->name}",
                    'items' => [
                        [
                            'name' => $plan->name,
                            'amount' => $plan->price_czk * 100,
                            'count' => 1,
                        ],
                    ],
                ]
            );
            
            // Update subscription
            $newExpiresAt = now()->add(
                $plan->billing_period === 'yearly' ? 'year' : 'month'
            );
            
            $subscription->update([
                'status' => 'active',
                'expires_at' => $newExpiresAt,
            ]);
            
            $user->update([
                'subscription_type' => 'premium',
                'subscription_expires_at' => $newExpiresAt,
            ]);
            
            // Schedule next renewal
            dispatch(new SubscriptionRenewalJob($subscription->id))
                ->delay($newExpiresAt);
            
            Log::info("Subscription renewed for user {$user->id}");
            
        } catch (\Exception $e) {
            Log::error("Subscription renewal failed for user {$user->id}: {$e->getMessage()}");
            
            // Send email notification about failed payment
            // Retry in 3 days
            dispatch(new SubscriptionRenewalJob($subscription->id))
                ->delay(now()->addDays(3));
        }
    }
}
```

### 6.2 Expiration Check Command

Create a daily command to check for expired subscriptions:

```php
<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class CheckExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check-expired';
    protected $description = 'Check and downgrade expired subscriptions';
    
    public function handle()
    {
        $expired = Subscription::where('status', 'active')
            ->where('expires_at', '<', now())
            ->where('auto_renew', false) // Only those that cancelled auto-renewal
            ->get();
        
        foreach ($expired as $subscription) {
            $user = $subscription->user;
            
            $subscription->update(['status' => 'expired']);
            $user->update([
                'subscription_type' => 'free',
                'subscription_expires_at' => null,
            ]);
            
            $this->info("Downgraded user {$user->id} to free tier");
        }
        
        $this->info("Checked {$expired->count()} expired subscriptions");
    }
}
```

Register in `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    $schedule->command('subscriptions:check-expired')->daily();
}
```

---

## 7. Error Handling

### 7.1 Error Codes

| Code | HTTP Status | Message (Czech) | Trigger |
|------|-------------|-----------------|---------|
| `FREE_PERIOD_EXPIRED` | 402 | "Zkušební období vypršelo" | 14+ days since registration |
| `SUBJECT_LIMIT_REACHED` | 402 | "Dosáhli jste limitu předmětů" | Trying to create 2nd subject |
| `SOURCE_LIMIT_REACHED` | 402 | "Dosáhli jste limitu materiálů" | Trying to create 2nd source |
| `CHAT_LIMIT_REACHED` | 402 | "Dosáhli jste limitu konverzací" | 3+ conversations on source |
| `TEST_QUESTION_LIMIT` | 402 | "Příliš mnoho otázek v testu" | >15 questions |
| `FLASHCARD_LIMIT` | 402 | "Příliš mnoho kartiček" | >30 flashcards |
| `TRIAL_ALREADY_USED` | 400 | "Zkušební období již bylo použito" | `has_used_trial = TRUE` |
| `NO_ACTIVE_SUBSCRIPTION` | 404 | "Žádné aktivní předplatné" | Cancel endpoint, no subscription |
| `PAYMENT_FAILED` | 500 | "Platba se nezdařila" | GoPay error |

### 7.2 Frontend Handling

Frontend should check for:
- HTTP status `402` (Payment Required) → Show paywall
- `error.requiresUpgrade = true` → Show paywall with specific reason
- `error.code` → Map to appropriate paywall message

---

## 8. Testing Requirements

### 8.1 Unit Tests

**Test cases:**
- Limit checking functions return correct values
- Date calculations (14-day period)
- Conversation counting logic
- Plan savings calculations

**Example:**
```php
public function test_free_user_reaches_subject_limit()
{
    $user = User::factory()->create(['subscription_type' => 'free']);
    Subject::factory()->create(['user_id' => $user->id]);
    
    $this->actingAs($user)
        ->postJson('/api/v1/subjects', ['name' => 'Test Subject'])
        ->assertStatus(402)
        ->assertJson([
            'error' => [
                'code' => 'SUBJECT_LIMIT_REACHED',
            ],
        ]);
}
```

### 8.2 Integration Tests

**Test cases:**
- Complete checkout flow (mocked GoPay)
- Webhook handling (all payment states)
- Subscription renewal flow
- Middleware enforcement on all protected routes

### 8.3 Manual Testing

**Checklist:**
- [ ] GoPay test payment works (sandbox)
- [ ] Trial activation after payment
- [ ] Limits enforced for free users
- [ ] Premium users bypass all limits
- [ ] Webhook signature verification
- [ ] Email notifications sent
- [ ] Renewal job scheduled correctly
- [ ] Cancellation works without downgrading immediately

---

## 9. Security Considerations

### 9.1 GoPay Webhook Security

- **Always verify signature** using `X-Signature` header
- Use constant-time comparison (`hash_equals`)
- Log all webhook attempts
- Return `200 OK` even on errors to prevent retries

### 9.2 Limit Checking

- **Server-side validation only** - Never trust frontend
- Use database transactions for atomic checks
- Lock user row during limit checks to prevent race conditions:
  ```php
  DB::transaction(function () use ($user) {
      $user = User::where('id', $user->id)->lockForUpdate()->first();
      // Check limits and create resource
  });
  ```

### 9.3 Payment Data

- **Never store full card numbers**
- Only store GoPay payment/recurrence IDs
- Use HTTPS for all payment redirects
- Log payment events for audit trail

---

## 10. Implementation Checklist

### Database
- [ ] Create `subscriptions` table migration
- [ ] Create `billing_plans` table migration
- [ ] Create `chat_conversations` table migration
- [ ] Add columns to `users` table (trial_ends_at, payment_method_id, auto_renew, has_used_trial)
- [ ] Seed default billing plans

### API Endpoints
- [ ] Implement `GET /billing/limits`
- [ ] Implement `GET /billing/plans`
- [ ] Implement `POST /billing/checkout`
- [ ] Implement `POST /billing/gopay-webhook`
- [ ] Implement `GET /billing/subscription`
- [ ] Implement `POST /billing/cancel`

### Middleware & Guards
- [ ] Create `CheckSubscriptionLimits` middleware
- [ ] Register middleware in Kernel
- [ ] Apply to protected routes
- [ ] Implement limit checking functions

### GoPay Integration
- [ ] Install GoPay SDK
- [ ] Configure credentials in .env
- [ ] Create `GoPayService`
- [ ] Implement payment creation
- [ ] Implement recurring payments
- [ ] Implement webhook signature verification

### Background Jobs
- [ ] Create `SubscriptionRenewalJob`
- [ ] Create `CheckExpiredSubscriptions` command
- [ ] Schedule daily expiration check
- [ ] Test job execution

### Chat Conversation Tracking
- [ ] Update chat endpoint to create/increment conversations
- [ ] Implement conversation counter in middleware
- [ ] Test limit enforcement

### Testing
- [ ] Write unit tests for limit functions
- [ ] Write integration tests for endpoints
- [ ] Test webhook handling (all states)
- [ ] Manual testing with GoPay sandbox
- [ ] Test renewal flow

### Documentation & Deployment
- [ ] Document GoPay setup process
- [ ] Create deployment checklist
- [ ] Add monitoring/alerts for failed payments
- [ ] Prepare support documentation

---

## Appendix A: GoPay Sandbox Testing

### Test Card Numbers

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111111111111111 | any | any future date |
| MasterCard | 5555555555554444 | any | any future date |

### Test Scenarios

1. **Successful Payment:** Use test card, complete payment
2. **Cancelled Payment:** Start payment, click "Zrušit"
3. **Timeout:** Start payment, wait 15 minutes
4. **Failed Payment:** Use card `4000000000000002` (always fails)

---

## Appendix B: Email Templates

### Trial Activated Email

**Subject:** Vítejte v Primát Plus Premium! 🎉

**Body:**
```
Dobrý den,

vaše Premium zkušební období bylo úspěšně aktivováno!

Období: 14 dní zdarma
Konec: {expires_at}
Cena po uplynutí: {price} Kč/{period}

Nyní máte přístup ke všem funkcím:
✓ Neomezené předměty
✓ Neomezené materiály
✓ AI chat bez limitů
✓ Testy až 100 otázek
✓ Prioritní podpora

Po skončení zkušebního období bude vaše předplatné automaticky obnoveno.

S pozdravem,
Tým Primát Plus
```

### Payment Failed Email

**Subject:** Problém s platbou - Primát Plus

**Body:**
```
Dobrý den,

při zpracování vaší platby došlo k chybě.

Zkuste to prosím znovu nebo kontaktujte podporu.

S pozdravem,
Tým Primát Plus
```

---

## Appendix C: Useful SQL Queries

### Find users approaching limits
```sql
SELECT u.id, u.email, u.subscription_type,
       (SELECT COUNT(*) FROM subjects WHERE user_id = u.id) as subject_count,
       (SELECT COUNT(*) FROM sources WHERE user_id = u.id) as source_count
FROM users u
WHERE u.subscription_type = 'free'
  AND (SELECT COUNT(*) FROM subjects WHERE user_id = u.id) >= 1;
```

### Find expiring trials
```sql
SELECT u.id, u.email, u.subscription_expires_at, DATEDIFF(u.subscription_expires_at, NOW()) as days_remaining
FROM users u
WHERE u.subscription_type = 'trial'
  AND u.subscription_expires_at IS NOT NULL
  AND DATEDIFF(u.subscription_expires_at, NOW()) <= 3;
```

### Revenue report
```sql
SELECT 
  DATE_FORMAT(s.created_at, '%Y-%m') as month,
  bp.name as plan,
  COUNT(*) as subscriptions,
  SUM(bp.price_czk) as revenue
FROM subscriptions s
JOIN billing_plans bp ON s.plan_id = bp.id
WHERE s.status IN ('active', 'trial')
GROUP BY month, bp.name
ORDER BY month DESC;
```

---

**End of Specification**

This document should be updated as requirements change. Frontend implementation is complete and ready for backend integration.

