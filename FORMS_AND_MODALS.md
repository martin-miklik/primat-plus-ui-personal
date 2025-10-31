# Forms & Modals Pattern

Complete guide to implementing forms and modal dialogs in the Primát Plus learning platform.

## 📋 Table of Contents

- [Form Validation with Zod](#form-validation-with-zod)
- [Field API (New!)](#field-api-new)
- [Form States](#form-states)
- [Modal Dialogs](#modal-dialogs)
- [Features](#features)
- [Examples](#examples)
- [Best Practices](#best-practices)

---

## Form Validation with Zod

All forms use Zod schemas defined in `lib/validations/` for type-safe validation.

### Basic Pattern

```typescript
// 1. Define schema in lib/validations/
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

// 2. Infer TypeScript type
type FormData = z.infer<typeof schema>;

// 3. Use with React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    email: "",
    password: "",
  },
});
```

### Advanced Schema Features

```typescript
// Password confirmation
const registerSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Error will appear on confirmPassword field
  });

// Optional fields with defaults
const schema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().max(500).optional(),
  remember: z.boolean().default(false).optional(),
});

// Regex validation
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");
```

---

## Field API (New!)

The new Field components from shadcn/ui provide consistent, accessible form structure.

### Basic Field Structure

```typescript
<Field data-invalid={!!errors.fieldName}>
  <FieldLabel htmlFor="field-id">
    Label <span className="text-destructive">*</span>
  </FieldLabel>
  <Input id="field-id" {...register("fieldName")} />
  <FieldDescription>Optional helper text</FieldDescription>
  {errors.fieldName && (
    <FieldError>{errors.fieldName.message}</FieldError>
  )}
</Field>
```

### Field Orientations

```typescript
// Vertical (default) - stacked layout
<Field>
  <FieldLabel>Name</FieldLabel>
  <Input />
</Field>

// Horizontal - side-by-side layout
<Field orientation="horizontal">
  <Checkbox id="remember" />
  <FieldLabel htmlFor="remember">Remember me</FieldLabel>
</Field>

// Responsive - adapts to container width
<Field orientation="responsive">
  <FieldContent>
    <FieldLabel>Name</FieldLabel>
    <FieldDescription>Your full name</FieldDescription>
  </FieldContent>
  <Input />
</Field>
```

### Grouping Fields

```typescript
<FieldGroup>
  <Field>...</Field>
  <Field>...</Field>
  <FieldSeparator />
  <Field>...</Field>
</FieldGroup>
```

---

## Form States

### 1. Submitting State

Always disable inputs and button during submission:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<Button disabled={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save"}
</Button>

<Input disabled={isSubmitting} {...register("name")} />
```

### 2. Validation Errors

Inline errors appear below fields via `FieldError`:

```typescript
<Field data-invalid={!!form.formState.errors.email}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input
    id="email"
    aria-invalid={!!form.formState.errors.email}
    {...register("email")}
  />
  {form.formState.errors.email && (
    <FieldError>{form.formState.errors.email.message}</FieldError>
  )}
</Field>
```

### 3. Backend Errors

TanStack Query mutations automatically show toast notifications:

```typescript
// Mutations show errors automatically
const createSubject = useCreateSubject();

try {
  await createSubject.mutateAsync(data);
  // Success toast shown automatically
} catch (error) {
  // Error toast shown automatically
}
```

### 4. Success State

Reset form and close dialog on success:

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
    dialog.close();
    form.reset(); // Clear all fields
  } catch (error) {
    // Error handled by mutation
  }
};
```

---

## Modal Dialogs

### 1. Create Dialog Hook

Use the `useDialog` hook to manage dialog state:

```typescript
const dialog = useDialog("unique-dialog-id");

// dialog.isOpen - boolean state
// dialog.open() - open the dialog
// dialog.close() - close the dialog
```

### 2. Trigger Dialog

```typescript
<Button onClick={dialog.open}>
  <PlusIcon className="mr-2 h-4 w-4" />
  Open Dialog
</Button>
```

### 3. Dialog Component

```typescript
<Dialog
  open={dialog.isOpen}
  onOpenChange={(open) => !open && dialog.close()}
>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Optional description for accessibility
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* Form fields */}
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={dialog.close}
        >
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

### Dialog + Form Pattern

Always handle form reset on close:

```typescript
const handleClose = () => {
  dialog.close();
  form.reset(); // Reset to default values
};

<Dialog
  open={dialog.isOpen}
  onOpenChange={(open) => !open && handleClose()}
>
  {/* ... */}
</Dialog>
```

---

## Features

### ✅ Accessibility

- **Focus trap**: Radix Dialog traps focus automatically
- **Keyboard navigation**: Tab through fields, Enter to submit, Esc to close
- **ARIA labels**: DialogTitle and DialogDescription for screen readers
- **aria-invalid**: Added to inputs with errors
- **FieldError**: Announces validation errors

### ✅ User Experience

- **Esc to close**: Dialog closes on Esc key
- **Backdrop click**: Dialog closes when clicking outside
- **Submit on Enter**: Native form behavior
- **Inline validation**: Errors appear immediately below fields
- **Loading states**: Buttons show "Saving..." text
- **Disabled state**: All inputs disabled during submission
- **Form reset**: Clear fields on close/success

### ✅ Developer Experience

- **Type safety**: Zod schemas infer TypeScript types
- **Reusable hooks**: `useDialog` for any dialog
- **Consistent patterns**: Field API for all forms
- **Multiple modals**: UI store supports modal stack
- **Auto toasts**: Mutations show success/error toasts

---

## Examples

### Example 1: Basic Form in Dialog

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/use-dialog";

export function CreateItemDialog() {
  const dialog = useDialog("create-item");
  const form = useForm({
    resolver: zodResolver(itemSchema),
  });

  const onSubmit = async (data) => {
    await createItem.mutateAsync(data);
    dialog.close();
    form.reset();
  };

  return (
    <Dialog open={dialog.isOpen} onOpenChange={(open) => !open && dialog.close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Item</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field data-invalid={!!form.formState.errors.name}>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <FieldError>{form.formState.errors.name.message}</FieldError>
              )}
            </Field>
            
            <Button type="submit">Create</Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Example 2: Standalone Login Form

```typescript
export function LoginForm({ onSubmit }) {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <FieldError>{form.formState.errors.email.message}</FieldError>
          )}
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password && (
            <FieldError>{form.formState.errors.password.message}</FieldError>
          )}
        </Field>

        <Field orientation="horizontal">
          <Checkbox id="remember" {...form.register("remember")} />
          <FieldLabel htmlFor="remember">Remember me</FieldLabel>
        </Field>

        <Button type="submit" className="w-full">Sign in</Button>
      </FieldGroup>
    </form>
  );
}
```

---

## Best Practices

### ✅ DO

1. **Always validate with Zod** - Define schemas in `lib/validations/`
2. **Use Field API** - Consistent error display and accessibility
3. **Show loading states** - Disable inputs and show "Saving..." text
4. **Reset on close** - Clear form when dialog closes or on success
5. **Use unique dialog IDs** - e.g., "create-subject", "edit-topic-123"
6. **Add ARIA attributes** - `aria-invalid` on inputs with errors
7. **Handle errors gracefully** - Mutations show toasts automatically

### ❌ DON'T

1. **Don't skip validation** - Always use Zod schemas
2. **Don't forget to reset** - Forms should clear on close/success
3. **Don't block submission** - Show loading state instead
4. **Don't use generic IDs** - Dialog IDs must be unique
5. **Don't forget disabled state** - Disable all inputs during submission
6. **Don't ignore accessibility** - Use DialogTitle, FieldLabel, aria-invalid

---

## Real Implementations

See these files for working examples:

- **CreateSubjectDialog**: `src/components/dialogs/create-subject-dialog.tsx`
- **LoginForm**: `src/components/forms/login-form.tsx`
- **FormFieldWrapper**: `src/components/forms/form-field-wrapper.tsx`
- **useDialog hook**: `src/hooks/use-dialog.ts`

---

## Testing

### Manual Testing Checklist

- [ ] Form validates on submit
- [ ] Inline errors appear below fields
- [ ] Submit on Enter works
- [ ] Esc closes dialog
- [ ] Backdrop click closes dialog
- [ ] Focus trapped in dialog
- [ ] Tab navigates through fields
- [ ] Loading state disables inputs
- [ ] Success: form resets, dialog closes, toast shows
- [ ] Error: toast shows, form stays open
- [ ] Screen reader announces errors

### Example Test

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("validates email field", async () => {
  render(<LoginForm onSubmit={jest.fn()} />);
  
  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, "invalid");
  await userEvent.tab();
  
  expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
});
```

---

**Last Updated**: January 2025  
**Maintained by**: Primát Plus Team

