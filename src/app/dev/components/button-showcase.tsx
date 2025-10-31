import { Button } from "@/components/ui/button";
import { ShowcaseSection } from "./showcase-section";
import { VariantGrid } from "./variant-grid";
import { CodeBlock } from "./code-block";
import { Loader2, Download, Mail } from "lucide-react";

export function ButtonShowcase() {
  return (
    <ShowcaseSection
      title="Button"
      description="Displays a button with various styles and states"
    >
      {/* Variants */}
      <VariantGrid title="Variants">
        <Button variant="default">Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </VariantGrid>

      <CodeBlock
        code={`<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>`}
      />

      {/* Sizes */}
      <VariantGrid title="Sizes">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
      </VariantGrid>

      <CodeBlock
        code={`<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>`}
      />

      {/* With Icons */}
      <VariantGrid title="With Icons">
        <Button>
          <Mail />
          Login with Email
        </Button>
        <Button variant="secondary">
          <Download />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <Mail />
          Small with Icon
        </Button>
      </VariantGrid>

      <CodeBlock
        code={`import { Mail, Download } from "lucide-react"

<Button>
  <Mail />
  Login with Email
</Button>
<Button variant="secondary">
  <Download />
  Download
</Button>`}
      />

      {/* Icon Only */}
      <VariantGrid title="Icon Only">
        <Button size="icon-sm" variant="outline">
          <Download />
        </Button>
        <Button size="icon">
          <Download />
        </Button>
        <Button size="icon-lg" variant="secondary">
          <Download />
        </Button>
      </VariantGrid>

      <CodeBlock
        code={`<Button size="icon-sm" variant="outline">
  <Download />
</Button>
<Button size="icon">
  <Download />
</Button>
<Button size="icon-lg" variant="secondary">
  <Download />
</Button>`}
      />

      {/* States */}
      <VariantGrid title="States">
        <Button disabled>Disabled</Button>
        <Button disabled variant="secondary">
          Disabled Secondary
        </Button>
        <Button>
          <Loader2 className="animate-spin" />
          Loading...
        </Button>
        <Button variant="destructive">
          <Loader2 className="animate-spin" />
          Deleting...
        </Button>
      </VariantGrid>

      <CodeBlock
        code={`import { Loader2 } from "lucide-react"

<Button disabled>Disabled</Button>
<Button>
  <Loader2 className="animate-spin" />
  Loading...
</Button>`}
      />

      {/* Loading Skeletons */}
      <VariantGrid title="Loading Skeletons">
        <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
        <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-24 bg-muted rounded-md animate-pulse" />
      </VariantGrid>

      <CodeBlock
        code={`<div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
<div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
<div className="h-10 w-24 bg-muted rounded-md animate-pulse" />`}
      />

      {/* Variant × Size Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Variant × Size Matrix
        </h3>
        <div className="grid gap-6">
          {(
            [
              "default",
              "secondary",
              "destructive",
              "outline",
              "ghost",
              "link",
            ] as const
          ).map((variant) => (
            <div key={variant} className="space-y-2">
              <p className="text-xs text-muted-foreground capitalize">
                {variant}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={variant} size="sm">
                  Small
                </Button>
                <Button variant={variant} size="default">
                  Default
                </Button>
                <Button variant={variant} size="lg">
                  Large
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ShowcaseSection>
  );
}
