# Component Playground

A full-featured development playground for exploring component variants, states, and interactions.

## Features

- ✨ **Sidebar Navigation** - Quick access to all components
- 🔍 **Search** - Find components instantly
- 🌓 **Theme Toggle** - Test in light, dark, or system theme
- 📋 **Code Snippets** - Copy-paste ready examples
- 🎯 **Collapsible Sections** - Clean, organized view
- 📱 **Responsive** - Works on all screen sizes
- 🚫 **Production Safe** - Automatically disabled in production

## Adding New Components

### 1. Create a Showcase Component

```tsx
// components/your-component-showcase.tsx
import { YourComponent } from "@/components/ui/your-component";
import { ShowcaseSection } from "./showcase-section";
import { VariantGrid } from "./variant-grid";
import { CodeBlock } from "./code-block";

export function YourComponentShowcase() {
  return (
    <ShowcaseSection
      title="Your Component"
      description="Component description"
    >
      <VariantGrid title="Variants">
        <YourComponent variant="default" />
        <YourComponent variant="secondary" />
      </VariantGrid>

      <CodeBlock
        code={`<YourComponent variant="default" />
<YourComponent variant="secondary" />`}
      />
    </ShowcaseSection>
  );
}
```

### 2. Register in page.tsx

```tsx
import { YourComponentShowcase } from "./components/your-component-showcase";

const showcases = [
  { id: "button", title: "Button", component: ButtonShowcase },
  { id: "your-component", title: "Your Component", component: YourComponentShowcase },
];
```

## Available Components

### ShowcaseSection
Main container for component examples. Supports collapsible sections.

```tsx
<ShowcaseSection
  title="Component Name"
  description="Brief description"
  defaultExpanded={true}
>
  {/* Your examples */}
</ShowcaseSection>
```

### VariantGrid
Displays variants in a flexible grid layout.

```tsx
<VariantGrid title="Variants">
  <Button variant="default">Example</Button>
  <Button variant="secondary">Example</Button>
</VariantGrid>
```

### CodeBlock
Shows code with syntax highlighting and copy button.

```tsx
<CodeBlock
  code={`<Button variant="default">
  Click me
</Button>`}
  language="tsx"
/>
```

## Access

- **Development**: Visit `/dev` in your browser
- **Production**: Route is automatically disabled and redirects to home

## Tips

### Organizing Examples

Group related variants together:
```tsx
<VariantGrid title="Variants">
  {/* Variant examples */}
</VariantGrid>

<VariantGrid title="Sizes">
  {/* Size examples */}
</VariantGrid>

<VariantGrid title="States">
  {/* State examples */}
</VariantGrid>
```

### Show Loading States

```tsx
<VariantGrid title="Loading">
  <Button>
    <Loader2 className="animate-spin" />
    Loading...
  </Button>
</VariantGrid>
```

### Include Skeletons

```tsx
<VariantGrid title="Loading Skeletons">
  <div className="h-9 w-20 bg-muted rounded-md animate-pulse" />
  <div className="h-9 w-32 bg-muted rounded-md animate-pulse" />
</VariantGrid>
```

### Interactive Examples

Use client components for interactive demos:
```tsx
"use client";

export function InteractiveShowcase() {
  const [value, setValue] = useState("");
  
  return (
    <ShowcaseSection title="Interactive">
      <YourComponent value={value} onChange={setValue} />
    </ShowcaseSection>
  );
}
```

## Customization

### Change Theme Preference
The playground remembers your theme preference in localStorage.

### Modify Layout
Edit `page.tsx` to adjust the overall layout and structure.

### Style Adjustments
All components use Tailwind classes and respect your global theme.
