# UI States Guide

Comprehensive guide for handling loading, error, and empty states in the application.

## 📦 Components

All state components are based on the shadcn/ui [Empty component](https://ui.shadcn.com/docs/components/empty) for consistency.

### Available Components:
- **Skeleton** - Loading states with shimmer animation
- **Spinner** - Inline loading indicator
- **Empty** - Base component for empty/error states
- **ErrorState** - Error handling with retry
- **EmptyState** - Generic empty state patterns
- **ErrorBoundary** - React Error Boundary for crash handling

---

## 🎨 Loading States

### 1. Skeleton Components

Use skeletons while data is loading to maintain layout stability.

#### Card Skeleton
```typescript
import { CardSkeleton } from "@/components/states";

function MyComponent() {
  if (isLoading) {
    return <CardSkeleton />;
  }
  
  return <Card>{/* content */}</Card>;
}
```

#### List Skeleton
```typescript
import { ListItemSkeleton } from "@/components/states";

function MyList() {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  return <div>{/* list items */}</div>;
}
```

#### Grid Skeleton
```typescript
import { GridSkeleton } from "@/components/states";

function MyGrid() {
  if (isLoading) {
    return <GridSkeleton count={6} columns={3} />;
  }
  
  return <div className="grid grid-cols-3 gap-4">{/* items */}</div>;
}
```

#### Custom Skeletons
```typescript
import { Skeleton, SkeletonGroup } from "@/components/states";

function CustomSkeleton() {
  return (
    <SkeletonGroup>
      <Skeleton className="h-8 w-48" /> {/* Title */}
      <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
      <Skeleton className="h-4 w-3/4" /> {/* Description line 2 */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" /> {/* Button 1 */}
        <Skeleton className="h-10 w-24" /> {/* Button 2 */}
      </div>
    </SkeletonGroup>
  );
}
```

### 2. Spinner

Use for inline loading indicators.

```typescript
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

function MyButton() {
  return (
    <Button disabled={isLoading}>
      {isLoading && <Spinner />}
      Save Changes
    </Button>
  );
}
```

---

## ❌ Error States

### 1. Generic Error State

```typescript
import { ErrorState } from "@/components/states";

function MyComponent() {
  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }
}
```

### 2. Network Error State

```typescript
import { NetworkErrorState } from "@/components/states";

function MyComponent() {
  if (isNetworkError) {
    return <NetworkErrorState onRetry={() => refetch()} />;
  }
}
```

### 3. Not Found State

```typescript
import { NotFoundState } from "@/components/states";

function MyComponent() {
  if (isNotFound) {
    return (
      <NotFoundState
        title="Subject not found"
        message="The subject you're looking for doesn't exist."
        onBack={() => router.back()}
      />
    );
  }
}
```

### 4. Custom Error with Empty

```typescript
import { 
  Empty, 
  EmptyHeader, 
  EmptyMedia, 
  EmptyTitle, 
  EmptyDescription,
  EmptyContent 
} from "@/components/ui/empty";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

function CustomError() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle className="text-destructive" />
        </EmptyMedia>
        <EmptyTitle>Payment Failed</EmptyTitle>
        <EmptyDescription>
          Your payment could not be processed. Please try again or contact support.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={retryPayment}>Retry Payment</Button>
      </EmptyContent>
    </Empty>
  );
}
```

---

## 📭 Empty States

### 1. No Data State

```typescript
import { NoDataState } from "@/components/states";

function MyList() {
  if (data.length === 0) {
    return (
      <NoDataState
        entityName="subjects"
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Create Subject"
      />
    );
  }
}
```

### 2. No Search Results

```typescript
import { NoResultsState } from "@/components/states";

function SearchResults() {
  if (results.length === 0) {
    return (
      <NoResultsState
        searchQuery={query}
        onClear={() => setQuery("")}
      />
    );
  }
}
```

### 3. No Files State

```typescript
import { NoFilesState } from "@/components/states";

function FileUploader() {
  if (files.length === 0) {
    return (
      <NoFilesState
        onUpload={() => fileInputRef.current?.click()}
        accept=".pdf, .docx, .txt"
      />
    );
  }
}
```

### 4. Custom Empty State

```typescript
import { EmptyState } from "@/components/states";
import { Trophy } from "lucide-react";

function Achievements() {
  if (achievements.length === 0) {
    return (
      <EmptyState
        icon={<Trophy />}
        title="No achievements yet"
        description="Complete tests and flashcards to earn achievements"
        action={{
          label: "Start Learning",
          onClick: () => router.push("/subjects"),
        }}
      />
    );
  }
}
```

---

## 🛡️ Error Boundary

Wrap components to catch React errors gracefully.

### Basic Usage
```typescript
import { ErrorBoundary } from "@/components/error-boundary";

function App() {
  return (
    <ErrorBoundary>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Custom Fallback
```typescript
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorState } from "@/components/states";

function App() {
  return (
    <ErrorBoundary
      fallback={
        <ErrorState
          title="Component Error"
          message="This component failed to load"
          onRetry={() => window.location.reload()}
        />
      }
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

---

## 🎯 Complete Pattern Examples

### TanStack Query Integration

```typescript
import { useSubjectsQuery } from "@/lib/api/queries/subjects";
import { CardSkeleton, ErrorState, NoDataState } from "@/components/states";

function SubjectsList() {
  const { data, isLoading, error, refetch } = useSubjectsQuery();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load subjects"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  // Empty state
  if (data?.data.length === 0) {
    return (
      <NoDataState
        entityName="subjects"
        onCreate={() => setCreateModalOpen(true)}
      />
    );
  }

  // Success state
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {data?.data.map((subject) => (
        <SubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
}
```

### Form with Loading State

```typescript
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

function MyForm() {
  const { mutate, isPending } = useCreateSubject();

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner />}
          Create Subject
        </Button>
        <Button type="button" variant="outline" disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### Page with Multiple States

```typescript
import { 
  PageHeaderSkeleton, 
  GridSkeleton,
  ErrorState,
  NoDataState 
} from "@/components/states";

function SubjectsPage() {
  const { data, isLoading, error, refetch } = useSubjectsQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <GridSkeleton count={6} columns={3} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load subjects"
        message={error.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (data?.data.length === 0) {
    return (
      <>
        <PageHeader />
        <NoDataState
          entityName="subjects"
          onCreate={() => setCreateModalOpen(true)}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader />
      <SubjectsGrid subjects={data.data} />
    </>
  );
}
```

---

## 📚 Component Reference

### Loading Components

| Component | Use Case | Props |
|-----------|----------|-------|
| `Skeleton` | Custom skeleton shapes | `className` |
| `Spinner` | Inline loading indicator | `className` |
| `CardSkeleton` | Card placeholder | `className` |
| `ListItemSkeleton` | List item placeholder | `className` |
| `TableRowSkeleton` | Table row placeholder | `columns`, `className` |
| `FormSkeleton` | Form placeholder | `fields` |
| `StatsSkeleton` | Stats/metrics placeholder | `count` |
| `GridSkeleton` | Grid layout placeholder | `count`, `columns`, `className` |

### Error Components

| Component | Use Case | Props |
|-----------|----------|-------|
| `ErrorState` | Generic error | `title`, `message`, `onRetry`, `retryLabel`, `className` |
| `NetworkErrorState` | Network errors | `message`, `onRetry`, `className` |
| `NotFoundState` | 404 errors | `title`, `message`, `onBack`, `className` |

### Empty Components

| Component | Use Case | Props |
|-----------|----------|-------|
| `EmptyState` | Generic empty state | `icon`, `title`, `description`, `action`, `className` |
| `NoDataState` | No items/records | `entityName`, `onCreate`, `createLabel`, `className` |
| `NoResultsState` | No search results | `searchQuery`, `onClear`, `className` |
| `NoFilesState` | No files uploaded | `onUpload`, `accept`, `className` |
| `ResourceNotFoundState` | Resource not found | `resourceType`, `onBack`, `className` |

### Boundary Components

| Component | Use Case | Props |
|-----------|----------|-------|
| `ErrorBoundary` | Catch React errors | `children`, `fallback` |

---

## 🎨 Styling & Customization

All components accept `className` for custom styling:

```typescript
<ErrorState
  className="min-h-screen bg-muted/50"
  title="Custom Error"
  message="Something went wrong"
/>

<CardSkeleton className="bg-card" />

<NoDataState
  className="border-2 border-dashed"
  entityName="items"
/>
```

---

## ✅ Best Practices

### 1. Always Handle All States
```typescript
// ✅ Good - handles all states
function MyComponent() {
  const { data, isLoading, error } = useQuery();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!data?.length) return <NoDataState />;
  
  return <Content data={data} />;
}

// ❌ Bad - missing states
function MyComponent() {
  const { data } = useQuery();
  return <Content data={data} />; // What if loading or error?
}
```

### 2. Use Appropriate Skeletons
```typescript
// ✅ Good - matches actual layout
if (isLoading) {
  return <GridSkeleton count={6} columns={3} />;
}
return <Grid columns={3}>{items}</Grid>;

// ❌ Bad - skeleton doesn't match
if (isLoading) {
  return <Spinner />; // Jarring layout shift
}
return <Grid columns={3}>{items}</Grid>;
```

### 3. Provide Retry Options
```typescript
// ✅ Good - user can retry
<ErrorState
  message={error.message}
  onRetry={() => refetch()}
/>

// ❌ Bad - user is stuck
<ErrorState message={error.message} />
```

### 4. Meaningful Empty States
```typescript
// ✅ Good - actionable, specific
<NoDataState
  entityName="flashcards"
  onCreate={() => generateFlashcards()}
  createLabel="Generate Flashcards"
/>

// ❌ Bad - vague, no action
<EmptyState title="No data" />
```

### 5. Wrap Critical Components
```typescript
// ✅ Good - isolated error handling
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>

// ❌ Bad - one error crashes everything
<CriticalComponent />
```

---

## 🚀 Quick Reference

### Common Patterns

**List with states:**
```typescript
{isLoading && <ListItemSkeleton />}
{error && <ErrorState onRetry={refetch} />}
{!data?.length && <NoDataState />}
{data?.map(item => <ListItem key={item.id} />)}
```

**Form submit:**
```typescript
<Button disabled={isPending}>
  {isPending && <Spinner />}
  Submit
</Button>
```

**Page:**
```typescript
{isLoading && <PageHeaderSkeleton />}
{isLoading && <GridSkeleton />}
{error && <ErrorState />}
{!data?.length && <NoDataState />}
```

---

## 📖 Resources

- [shadcn/ui Empty Component](https://ui.shadcn.com/docs/components/empty)
- [TanStack Query - Loading States](https://tanstack.com/query/latest/docs/react/guides/queries)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)


