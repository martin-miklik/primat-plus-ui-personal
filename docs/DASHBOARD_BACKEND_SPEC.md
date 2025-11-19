# Dashboard Backend Specification

**Version:** 1.0  
**Date:** November 19, 2025  
**Estimated Implementation:** 6-8 hours

---

## API Endpoint

```
GET /api/v1/dashboard
```

**Authentication:** Required (JWT Bearer token)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "subjectsCount": 3,
      "topicsCount": 12,
      "sourcesCount": 8,
      "flashcardsCount": 145,
      "dueCardsCount": 12,
      "testsCompletedCount": 7,
      "averageTestScore": 78,
      "studyStreak": 5,
      "reviewedToday": 8
    },
    "recentSubjects": [
      {
        "id": 1,
        "name": "Biologie",
        "description": "Základy biologie pro střední školy",
        "icon": "microscope",
        "color": "#10b981",
        "topicsCount": 4,
        "createdAt": "2025-11-15T10:30:00.000Z"
      }
    ],
    "recentTopics": [
      {
        "id": 5,
        "name": "Buněčná biologie",
        "subjectId": 1,
        "subjectName": "Biologie",
        "subjectColor": "#10b981",
        "cardsCount": 23,
        "createdAt": "2025-11-16T14:20:00.000Z"
      }
    ],
    "recentTests": [
      {
        "id": 123,
        "testId": 45,
        "name": "Test z buněčné biologie",
        "subjectId": 1,
        "subjectName": "Biologie",
        "subjectColor": "#10b981",
        "topicId": 5,
        "sourceId": 12,
        "score": 85,
        "totalQuestions": 10,
        "correctAnswers": 9,
        "completedAt": "2025-11-18T16:45:00.000Z"
      }
    ],
    "recommendedAction": {
      "type": "practice_cards",
      "message": "Máte 12 kartiček připravených k procvičování",
      "subjectId": 1,
      "subjectName": "Biologie",
      "sourceId": 12,
      "count": 12
    }
  },
  "timestamp": "2025-11-19T10:00:00.000Z",
  "version": "v1"
}
```

---

## Features Overview

| Feature | Effort | Requires New Table | Priority |
|---------|--------|-------------------|----------|
| Basic Counts | 30 min | No | High |
| Recent Items | 30 min | No | High |
| Due Cards Count | 15 min | No | High |
| Average Test Score | 15 min | No | Medium |
| Study Streak | 1 hour | Yes (flashcard_reviews) | Medium |
| Reviewed Today | 15 min | Yes (flashcard_reviews) | Medium |
| Recommended Action | 45 min | No | High |

**Total Estimated Time:** 3.5 hours (without review table) or 4.5 hours (with review table)

---

## Database Changes Required

### New Table: flashcard_reviews

**Purpose:** Track when users review flashcards for streak calculation and activity metrics.

```sql
CREATE TABLE flashcard_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  flashcard_id VARCHAR(255) NOT NULL,
  rating TINYINT NOT NULL COMMENT '1=Again, 2=Hard, 3=Good, 4=Easy',
  reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_date (user_id, reviewed_at),
  INDEX idx_flashcard (flashcard_id),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Integration Point:** 
Insert a row whenever user reviews a flashcard (endpoint: `PUT /api/v1/sources/:sourceId/flashcards/:flashcardId/next-repetition`)

```php
// In FlashcardController::updateNextRepetition()
$this->db->query(
    'INSERT INTO flashcard_reviews (user_id, flashcard_id, rating, reviewed_at) 
     VALUES (?, ?, ?, NOW())',
    [$userId, $flashcardId, $rating]
);
```

**Time:** 1 hour (migration + integration into existing review endpoint)

---

## Feature Implementation

### 1. Basic Stats

**Why:** Users need an overview of their content volume at a glance.

**How:**
```php
// In DashboardRepository.php

public function getStats(int $userId): array
{
    return [
        'subjectsCount' => $this->getSubjectsCount($userId),
        'topicsCount' => $this->getTopicsCount($userId),
        'sourcesCount' => $this->getSourcesCount($userId),
        'flashcardsCount' => $this->getFlashcardsCount($userId),
        'dueCardsCount' => $this->getDueCardsCount($userId),
        'testsCompletedCount' => $this->getTestsCompletedCount($userId),
        'averageTestScore' => $this->getAverageTestScore($userId),
        'studyStreak' => $this->getStudyStreak($userId),
        'reviewedToday' => $this->getReviewedTodayCount($userId),
    ];
}

private function getSubjectsCount(int $userId): int
{
    return $this->db->table('subjects')
        ->where('user_id', $userId)
        ->count('*');
}

private function getTopicsCount(int $userId): int
{
    return $this->db->table('topics')
        ->alias('t')
        ->select('COUNT(t.id)')
        ->innerJoin('subjects s', 't.subject_id = s.id')
        ->where('s.user_id', $userId)
        ->fetchSingle();
}

private function getSourcesCount(int $userId): int
{
    return $this->db->table('sources')
        ->alias('src')
        ->select('COUNT(src.id)')
        ->innerJoin('topics t', 'src.topic_id = t.id')
        ->innerJoin('subjects s', 't.subject_id = s.id')
        ->where('s.user_id', $userId)
        ->fetchSingle();
}

private function getFlashcardsCount(int $userId): int
{
    return $this->db->table('flashcards')
        ->alias('f')
        ->select('COUNT(f.id)')
        ->innerJoin('sources src', 'f.source_id = src.id')
        ->innerJoin('topics t', 'src.topic_id = t.id')
        ->innerJoin('subjects s', 't.subject_id = s.id')
        ->where('s.user_id', $userId)
        ->fetchSingle();
}

private function getDueCardsCount(int $userId): int
{
    return $this->db->query('
        SELECT COUNT(*)
        FROM flashcards f
        JOIN sources src ON f.source_id = src.id
        JOIN topics t ON src.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE s.user_id = ?
          AND f.next_repetition_date <= NOW()
    ', [$userId])->fetchSingle();
}

private function getTestsCompletedCount(int $userId): int
{
    return $this->db->table('test_instances')
        ->where('user_id', $userId)
        ->where('status', 'completed')
        ->count('*');
}

private function getAverageTestScore(int $userId): int
{
    $avg = $this->db->table('test_instances')
        ->where('user_id', $userId)
        ->where('status', 'completed')
        ->select('AVG(score) as avg_score')
        ->fetch();
    
    return $avg && $avg->avg_score ? (int) round($avg->avg_score) : 0;
}
```

**Time:** 30 minutes

---

### 2. Study Streak

**Why:** Gamification - encourages daily habit formation. Proven by Duolingo to increase retention.

**How:** Count consecutive days with at least one card review.

```php
private function getStudyStreak(int $userId): int
{
    // Get all distinct review dates, ordered DESC
    $reviewDates = $this->db->query('
        SELECT DISTINCT DATE(reviewed_at) as review_date
        FROM flashcard_reviews
        WHERE user_id = ?
        ORDER BY review_date DESC
    ', [$userId])->fetchAll();

    if (empty($reviewDates)) {
        return 0;
    }

    $streak = 0;
    $today = new DateTime();
    $yesterday = (clone $today)->modify('-1 day');
    
    // Check if user reviewed today or yesterday (don't break streak for incomplete day)
    $lastReview = new DateTime($reviewDates[0]->review_date);
    $daysDiff = $today->diff($lastReview)->days;
    
    if ($daysDiff > 1) {
        return 0; // Streak broken
    }
    
    // Count consecutive days
    $expectedDate = clone $lastReview;
    foreach ($reviewDates as $row) {
        $reviewDate = new DateTime($row->review_date);
        
        if ($reviewDate->format('Y-m-d') === $expectedDate->format('Y-m-d')) {
            $streak++;
            $expectedDate->modify('-1 day');
        } else {
            break;
        }
    }
    
    return $streak;
}
```

**Requires:** `flashcard_reviews` table

**Time:** 30 minutes (query logic)

---

### 3. Reviewed Today Count

**Why:** Shows today's progress - motivates users to keep going.

**How:**
```php
private function getReviewedTodayCount(int $userId): int
{
    return $this->db->query('
        SELECT COUNT(*)
        FROM flashcard_reviews
        WHERE user_id = ?
          AND DATE(reviewed_at) = CURDATE()
    ', [$userId])->fetchSingle();
}
```

**Requires:** `flashcard_reviews` table

**Time:** 10 minutes

---

### 4. Recent Subjects

**Why:** Quick access to what user is currently working on.

**How:**
```php
public function getRecentSubjects(int $userId, int $limit = 5): array
{
    $subjects = $this->db->query('
        SELECT 
            s.id,
            s.name,
            s.description,
            s.icon,
            s.color,
            s.created_at,
            COUNT(DISTINCT t.id) as topics_count
        FROM subjects s
        LEFT JOIN topics t ON s.id = t.subject_id
        WHERE s.user_id = ?
        GROUP BY s.id
        ORDER BY s.created_at DESC
        LIMIT ?
    ', [$userId, $limit])->fetchAll();

    return array_map(fn($s) => [
        'id' => (int) $s->id,
        'name' => $s->name,
        'description' => $s->description,
        'icon' => $s->icon,
        'color' => $s->color,
        'topicsCount' => (int) $s->topics_count,
        'createdAt' => (new DateTime($s->created_at))->format('c'),
    ], $subjects);
}
```

**Time:** 20 minutes

---

### 5. Recent Topics

**Why:** More granular than subjects - shows active learning areas.

**How:**
```php
public function getRecentTopics(int $userId, int $limit = 5): array
{
    $topics = $this->db->query('
        SELECT 
            t.id,
            t.name,
            t.subject_id,
            s.name as subject_name,
            s.color as subject_color,
            t.created_at,
            COUNT(DISTINCT f.id) as cards_count
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        LEFT JOIN sources src ON t.id = src.topic_id
        LEFT JOIN flashcards f ON src.id = f.source_id
        WHERE s.user_id = ?
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT ?
    ', [$userId, $limit])->fetchAll();

    return array_map(fn($t) => [
        'id' => (int) $t->id,
        'name' => $t->name,
        'subjectId' => (int) $t->subject_id,
        'subjectName' => $t->subject_name,
        'subjectColor' => $t->subject_color,
        'cardsCount' => (int) $t->cards_count,
        'createdAt' => (new DateTime($t->created_at))->format('c'),
    ], $topics);
}
```

**Time:** 20 minutes

---

### 6. Recent Tests

**Why:** Shows learning achievements and encourages retakes for improvement.

**How:**
```php
public function getRecentTests(int $userId, int $limit = 5): array
{
    // Note: Adjust JOINs based on your schema - verify if tests link via source_id or topic_id
    $tests = $this->db->query('
        SELECT 
            ti.id,
            ti.test_id,
            t.name,
            t.source_id,
            src.topic_id,
            top.subject_id,
            s.name as subject_name,
            s.color as subject_color,
            ti.score,
            ti.total_questions,
            ti.correct_answers,
            ti.completed_at
        FROM test_instances ti
        JOIN tests t ON ti.test_id = t.id
        JOIN sources src ON t.source_id = src.id
        JOIN topics top ON src.topic_id = top.id
        JOIN subjects s ON top.subject_id = s.id
        WHERE ti.user_id = ? 
          AND ti.status = "completed"
        ORDER BY ti.completed_at DESC
        LIMIT ?
    ', [$userId, $limit])->fetchAll();

    return array_map(fn($t) => [
        'id' => (int) $t->id,
        'testId' => (int) $t->test_id,
        'name' => $t->name,
        'subjectId' => (int) $t->subject_id,
        'subjectName' => $t->subject_name,
        'subjectColor' => $t->subject_color,
        'topicId' => (int) $t->topic_id,
        'sourceId' => (int) $t->source_id,
        'score' => (int) $t->score,
        'totalQuestions' => (int) $t->total_questions,
        'correctAnswers' => (int) $t->correct_answers,
        'completedAt' => (new DateTime($t->completed_at))->format('c'),
    ], $tests);
}
```

**Time:** 30 minutes (includes schema verification)

---

### 7. Recommended Next Action

**Why:** Guided learning - tells user exactly what to do next. Reduces decision paralysis.

**How:** Prioritize actions in this order:
1. Cards due for review (most urgent)
2. Incomplete tests (user started but didn't finish)
3. New content to study (if no cards due)

```php
public function getRecommendedAction(int $userId): ?array
{
    // 1. Check for due cards
    $dueCards = $this->db->query('
        SELECT 
            s.id as subject_id,
            s.name as subject_name,
            src.id as source_id,
            COUNT(f.id) as cards_count
        FROM flashcards f
        JOIN sources src ON f.source_id = src.id
        JOIN topics t ON src.topic_id = t.id
        JOIN subjects s ON t.subject_id = s.id
        WHERE s.user_id = ?
          AND f.next_repetition_date <= NOW()
        GROUP BY src.id
        ORDER BY cards_count DESC
        LIMIT 1
    ', [$userId])->fetch();

    if ($dueCards && $dueCards->cards_count > 0) {
        return [
            'type' => 'practice_cards',
            'message' => $dueCards->cards_count === 1 
                ? 'Máte 1 kartičku připravenou k procvičování'
                : "Máte {$dueCards->cards_count} kartiček připravených k procvičování",
            'subjectId' => (int) $dueCards->subject_id,
            'subjectName' => $dueCards->subject_name,
            'sourceId' => (int) $dueCards->source_id,
            'count' => (int) $dueCards->cards_count,
        ];
    }

    // 2. Check for active (incomplete) tests
    $activeTest = $this->db->query('
        SELECT 
            ti.id as instance_id,
            t.id as test_id,
            t.name,
            s.id as subject_id,
            s.name as subject_name
        FROM test_instances ti
        JOIN tests t ON ti.test_id = t.id
        JOIN sources src ON t.source_id = src.id
        JOIN topics top ON src.topic_id = top.id
        JOIN subjects s ON top.subject_id = s.id
        WHERE ti.user_id = ?
          AND ti.status = "active"
        ORDER BY ti.started_at DESC
        LIMIT 1
    ', [$userId])->fetch();

    if ($activeTest) {
        return [
            'type' => 'continue_test',
            'message' => "Dokončete test: {$activeTest->name}",
            'subjectId' => (int) $activeTest->subject_id,
            'subjectName' => $activeTest->subject_name,
            'testId' => (int) $activeTest->test_id,
            'instanceId' => (int) $activeTest->instance_id,
        ];
    }

    // 3. Suggest newest subject/topic
    $newestContent = $this->db->query('
        SELECT 
            s.id as subject_id,
            s.name as subject_name,
            t.id as topic_id,
            t.name as topic_name
        FROM topics t
        JOIN subjects s ON t.subject_id = s.id
        WHERE s.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT 1
    ', [$userId])->fetch();

    if ($newestContent) {
        return [
            'type' => 'explore_content',
            'message' => "Prozkoumejte: {$newestContent->topic_name}",
            'subjectId' => (int) $newestContent->subject_id,
            'subjectName' => $newestContent->subject_name,
            'topicId' => (int) $newestContent->topic_id,
        ];
    }

    // No content yet
    return [
        'type' => 'create_content',
        'message' => 'Začněte vytvořením prvního předmětu',
    ];
}
```

**Time:** 45 minutes

---

## Controller Implementation

```php
// app/Api/V1/Controllers/DashboardController.php

namespace App\Api\V1\Controllers;

use App\Api\V1\Attributes\{Path, Method};
use App\Model\Repositories\DashboardRepository;
use Nette\Http\IRequest;
use Nette\Caching\Cache;

class DashboardController extends BaseController
{
    public function __construct(
        private DashboardRepository $dashboardRepo,
        private Cache $cache
    ) {}

    #[Path("/dashboard")]
    #[Method(IRequest::Get)]
    public function index(ApiRequest $request): array
    {
        $userId = $this->session->getId();
        $cacheKey = "dashboard:user:{$userId}";

        // Try cache first (5 minute TTL)
        $data = $this->cache->load($cacheKey);
        
        if ($data === null) {
            $data = [
                'stats' => $this->dashboardRepo->getStats($userId),
                'recentSubjects' => $this->dashboardRepo->getRecentSubjects($userId, 5),
                'recentTopics' => $this->dashboardRepo->getRecentTopics($userId, 5),
                'recentTests' => $this->dashboardRepo->getRecentTests($userId, 5),
                'recommendedAction' => $this->dashboardRepo->getRecommendedAction($userId),
            ];

            $this->cache->save($cacheKey, $data, [
                Cache::EXPIRE => '5 minutes',
                Cache::TAGS => ["user-{$userId}", "dashboard"],
            ]);
        }

        return $data;
    }
}
```

**Cache Invalidation:**

Add to relevant controllers (SubjectController, TopicController, FlashcardController, TestController):

```php
// After creating/updating content
$this->cache->clean([
    Cache::TAGS => ["dashboard", "user-{$userId}"],
]);
```

**Time:** 30 minutes (controller + cache setup)

---

## Performance Optimization

### Required Indexes

```sql
-- Speed up dashboard queries
CREATE INDEX idx_subjects_user_created ON subjects(user_id, created_at);
CREATE INDEX idx_topics_subject_created ON topics(subject_id, created_at);
CREATE INDEX idx_flashcards_due ON flashcards(source_id, next_repetition_date);
CREATE INDEX idx_tests_user_status ON test_instances(user_id, status, completed_at);
```

**Time:** 10 minutes

### Caching Strategy

- **TTL:** 5 minutes (dashboard data doesn't need real-time updates)
- **Invalidation:** On any content creation/update by user
- **Tags:** User-specific + "dashboard" global tag
- **Expected hit rate:** >80% (most users refresh dashboard, not create content)

---

## Testing Checklist

### Unit Tests
- [ ] `getStats()` returns correct counts for user with data
- [ ] `getStats()` returns zeros for new user
- [ ] `getStudyStreak()` calculates consecutive days correctly
- [ ] `getStudyStreak()` resets after missed day
- [ ] `getRecommendedAction()` prioritizes due cards over tests
- [ ] All queries use proper JOINs and don't leak other users' data

### Integration Tests
- [ ] `GET /api/v1/dashboard` returns 200 with valid token
- [ ] Response matches JSON schema exactly
- [ ] Dashboard loads in < 500ms with 1000 flashcards (with indexes)
- [ ] Cache hit on 2nd request (faster response)
- [ ] Cache invalidates after creating subject

### Manual QA
1. New user → all counts are 0, recommended action is "create content"
2. User with 1 subject → subject appears in recent list
3. User with due cards → recommended action shows practice cards
4. User with active test → recommended action shows continue test
5. Review 5 cards → reviewedToday count increases to 5

---

## Deployment Steps

1. **Create migration:**
   ```sql
   -- migrations/2025_11_19_dashboard_support.sql
   
   CREATE TABLE flashcard_reviews (
     id INT PRIMARY KEY AUTO_INCREMENT,
     user_id INT NOT NULL,
     flashcard_id VARCHAR(255) NOT NULL,
     rating TINYINT NOT NULL,
     reviewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
     INDEX idx_user_date (user_id, reviewed_at),
     INDEX idx_flashcard (flashcard_id),
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   
   CREATE INDEX idx_subjects_user_created ON subjects(user_id, created_at);
   CREATE INDEX idx_topics_subject_created ON topics(subject_id, created_at);
   CREATE INDEX idx_flashcards_due ON flashcards(source_id, next_repetition_date);
   CREATE INDEX idx_tests_user_status ON test_instances(user_id, status, completed_at);
   ```

2. **Update FlashcardController** to log reviews

3. **Deploy DashboardRepository + DashboardController**

4. **Test on staging** with sample user data

5. **Monitor production:**
   - Dashboard endpoint response times
   - Cache hit rate
   - Error rate

---

## Success Metrics (Week 1)

- Dashboard load time < 500ms (p95)
- Zero 500 errors on `/dashboard` endpoint
- Cache hit rate > 80%
- Users visit dashboard 2+ times per session (engagement)

---

## Optional Enhancements (Post-MVP)

If time permits or requested later:

### Weekly Activity Chart
7-day card review counts for visualization.

**SQL:**
```sql
SELECT 
    DATE(reviewed_at) as date,
    COUNT(*) as reviews
FROM flashcard_reviews
WHERE user_id = ?
  AND reviewed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(reviewed_at)
ORDER BY date ASC
```

**Effort:** 30 minutes

### Mastery Distribution
Breakdown of cards by SRS difficulty level.

**SQL:**
```sql
SELECT 
    CASE 
        WHEN DATEDIFF(next_repetition_date, NOW()) <= 1 THEN 'learning'
        WHEN DATEDIFF(next_repetition_date, NOW()) <= 7 THEN 'reviewing'
        ELSE 'mastered'
    END as stage,
    COUNT(*) as count
FROM flashcards f
JOIN sources src ON f.source_id = src.id
JOIN topics t ON src.topic_id = t.id
JOIN subjects s ON t.subject_id = s.id
WHERE s.user_id = ?
GROUP BY stage
```

**Effort:** 20 minutes

---

## Summary

**Core Implementation:**
- 1 new table (flashcard_reviews)
- 7 repository methods
- 1 controller endpoint
- 4 database indexes
- Caching layer

**Total Time:** 4.5 hours (with review tracking) or 3.5 hours (basic stats only)

**Delivers:**
- Complete dashboard overview
- Gamification (study streak)
- Guided learning (recommended action)
- Performance metrics (average test score)
- Activity tracking (reviewed today)

**Frontend gets exactly what it expects** - response format matches existing dashboard component interface.
