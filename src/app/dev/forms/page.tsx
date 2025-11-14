"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateSubjectDialog } from "@/components/dialogs";
import { useDialog } from "@/hooks/use-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

/**
 * Forms & Modals Showcase Page
 *
 * Demonstrates all form and modal patterns implemented in the application.
 * Visit /dev/forms to see examples.
 */
export default function FormsShowcasePage() {
  const dialog = useDialog("showcase-subject");

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dev">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Forms & Modals Showcase</h1>
          <p className="text-muted-foreground mt-1">
            Examples of form validation and modal dialogs
          </p>
        </div>
      </div>

      <Tabs defaultValue="login" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login">Login Form</TabsTrigger>
          <TabsTrigger value="dialog">Dialog Form</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        {/* Login Form Tab */}
        <TabsContent value="login" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Login Form Example</CardTitle>
                <CardDescription>
                  Standalone form with name, password, and remember me checkbox
                </CardDescription>
              </CardHeader>
              <CardContent></CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Implemented in this form</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Name validation (required field)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Password validation (min 8 characters)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Inline error messages below fields</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Submit on Enter key</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Loading state during submission</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Disabled inputs while submitting</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Checkbox for &quot;Remember me&quot;</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dialog Form Tab */}
        <TabsContent value="dialog" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Subject Dialog</CardTitle>
                <CardDescription>
                  Form inside a modal dialog with validation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={dialog.open} className="w-full">
                  Open Create Subject Dialog
                </Button>
                <CreateSubjectDialog />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>Implemented in this dialog</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Focus trap (Tab stays within dialog)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Esc key closes dialog</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Backdrop click closes dialog</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Form resets on close/success</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>ARIA labels for accessibility</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Inline validation errors</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Success toast notification</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Patterns</CardTitle>
                <CardDescription>
                  Code patterns used throughout the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">
                    1. Zod Schema Definition
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  remember: z.boolean().default(false).optional(),
});

type LoginInput = z.infer<typeof loginSchema>;`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    2. React Hook Form Integration
                  </h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: {
    email: "",
    password: "",
    remember: false,
  },
});`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">3. Field API Usage</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`<Field data-invalid={!!errors.email}>
  <FieldLabel htmlFor="email">
    Email <span className="text-destructive">*</span>
  </FieldLabel>
  <Input 
    id="email" 
    aria-invalid={!!errors.email}
    {...register("email")} 
  />
  {errors.email && (
    <FieldError>{errors.email.message}</FieldError>
  )}
</Field>`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">4. Dialog Management</h3>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {`const dialog = useDialog("unique-id");

<Button onClick={dialog.open}>Open</Button>

<Dialog 
  open={dialog.isOpen} 
  onOpenChange={(open) => !open && dialog.close()}
>
  <DialogContent>
    {/* Form here */}
  </DialogContent>
</Dialog>`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Complete pattern documentation and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For detailed documentation, examples, and best practices, see:
                </p>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  FORMS_AND_MODALS.md
                </code>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
