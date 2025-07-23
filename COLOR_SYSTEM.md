# FuelWarden Color System

This document outlines the color system used throughout the FuelWarden application.

## Brand Colors

### Primary Color
- **Main Orange**: `#FF5001` - Used for primary actions, buttons, and brand elements
- **Light Orange**: `#FF6B2A` - Used for hover states and secondary elements
- **Dark Orange**: `#E04500` - Used for active states and emphasis

## Background Colors

### Light Mode
- **Primary Background**: `#FFFFFF` (White)
- **Secondary Background**: `#F5F5F5` (Light Gray)

### Dark Mode
- **Primary Background**: `#0A0A0A` (Very Dark Gray)
- **Secondary Background**: `#191919` (Dark Gray)

## Text Colors

### Light Mode
- **Primary Text**: `#0A0A0A` (Very Dark Gray)
- **Secondary Text**: `#6B7280` (Medium Gray)

### Dark Mode
- **Primary Text**: `#FFFFFF` (White)
- **Secondary Text**: `#9CA3AF` (Light Gray)

## Usage

### 1. Using Tailwind Classes

The color system is integrated with Tailwind CSS. You can use these classes directly:

```tsx
// Primary brand color
<div className="bg-primary text-primary-foreground">Primary Button</div>

// Background colors
<div className="bg-background">Main background</div>
<div className="bg-card">Card background</div>

// Text colors
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
```

### 2. Using CSS Variables

You can also use CSS custom properties directly:

```css
.my-element {
  background-color: var(--fuel-orange);
  color: var(--foreground);
}
```

### 3. Using the Color Utility

Import the color utilities in your components:

```tsx
import { colors, colorUtils } from '@/lib/colors';

// Access specific colors
const primaryColor = colors.primary.main;
const isDark = true;
const bgColor = colorUtils.getBackground(isDark);
```

### 4. Component Examples

#### Button Component
```tsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>
```

#### Card Component
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  Card content
</div>
```

#### Navigation Component
```tsx
<nav className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
  Navigation items
</nav>
```

## Color Palette

### Primary Colors
- `#FF5001` - Main brand orange
- `#FF6B2A` - Light orange (hover states)
- `#E04500` - Dark orange (active states)

### Background Colors
- `#FFFFFF` - Light mode background
- `#0A0A0A` - Dark mode background
- `#191919` - Dark mode secondary background

### UI Colors
- `#F5F5F5` - Light mode muted background
- `#E5E7EB` - Light mode borders
- `#374151` - Dark mode borders

### Semantic Colors
- `#EF4444` - Destructive/Error
- `#10B981` - Success
- `#F59E0B` - Warning
- `#3B82F6` - Info

## Best Practices

1. **Always use semantic color classes** when possible (e.g., `bg-primary` instead of `bg-[#FF5001]`)
2. **Use the foreground colors** for text that goes on colored backgrounds
3. **Test in both light and dark modes** to ensure proper contrast
4. **Use muted colors** for secondary information
5. **Maintain consistency** by using the established color system

## Accessibility

The color system is designed with accessibility in mind:
- All text colors meet WCAG contrast requirements
- Color is never the only way to convey information
- Hover and focus states are clearly defined
- Dark mode support is built-in

## Adding New Colors

If you need to add new colors to the system:

1. Add the color to `src/lib/colors.ts`
2. Add the CSS variable to `src/app/globals.css`
3. Update this documentation
4. Consider both light and dark mode variants 