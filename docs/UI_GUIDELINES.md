# SalsaNor Beat Machine - UI Design Guidelines

## Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography System](#typography-system)
4. [Spacing & Layout](#spacing--layout)
5. [Component Specifications](#component-specifications)
6. [Responsive Design](#responsive-design)
7. [Animation Guidelines](#animation-guidelines)
8. [Accessibility Standards](#accessibility-standards)
9. [Implementation Guide](#implementation-guide)
10. [Best Practices](#best-practices)

---

## Design Philosophy

### Frosted Studio Theme

The SalsaNor Beat Machine embraces a **"Frosted Studio"** aesthetic that combines the elegance of glassmorphism with the energy of music production. Our design language creates an immersive, modern interface that feels both professional and approachable.

**Core Principles:**

1. **Transparency & Depth**: Layered glass surfaces create visual hierarchy and spatial relationships
2. **Fluid Motion**: Smooth animations reflect the rhythmic nature of music
3. **Vibrant Accents**: Bold, saturated colors highlight interactive elements against subtle backgrounds
4. **Clarity First**: Despite visual effects, readability and usability remain paramount
5. **Responsive Elegance**: The design adapts gracefully across all device sizes

**Visual Language:**

- **Cosmic Background**: Deep purple-to-blue gradient evokes evening studio sessions
- **Frosted Panels**: Semi-transparent surfaces with backdrop blur create floating UI elements
- **Neon Accents**: Cyan, purple, and pink glows add energy and guide user attention
- **Soft Shadows**: Layered shadows provide depth without harsh edges
- **Rounded Corners**: Consistent border radius creates a friendly, modern aesthetic

---

## Color System

### Background Gradients

Our background uses a three-stop gradient creating a cosmic, immersive environment:

```css
background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
```

**Gradient Stops:**
- `#0f0c29` - Deep midnight blue (top-left)
- `#302b63` - Rich cosmic purple (center)
- `#24243e` - Dark twilight (bottom-right)

### Glass Material Colors

Glassmorphic surfaces use white with varying opacity levels and backdrop blur:

**Glass Light** - Subtle surfaces
```scss
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.15);
```

**Glass Medium** - Standard containers
```scss
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

**Glass Dark** - Emphasized sections
```scss
background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(30px);
border: 1px solid rgba(255, 255, 255, 0.25);
```

### Accent Colors

**Primary Purple**
- Base: `#667eea`
- Light: `#8b9fef`
- Dark: `#4d5ed7`
- Usage: Primary actions, main interactive elements

**Cyan**
- Base: `#00f5ff`
- Light: `#4dfbff`
- Dark: `#00c7d4`
- Usage: Focus states, solo highlighting, active indicators

**Pink**
- Base: `#f093fb`
- Light: `#f5b5fc`
- Dark: `#e76af0`
- Usage: Accent details, secondary actions

**Gradient Accent**
```scss
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Semantic Colors

**Success** - `#10b981` (Green)
- Usage: Confirmation, successful operations

**Warning** - `#f59e0b` (Amber)
- Usage: Warnings, important notices

**Error** - `#ef4444` (Red)
- Usage: Errors, destructive actions

**Info** - `#3b82f6` (Blue)
- Usage: Informational messages, tips

### Interactive State Colors

**Hover**
```scss
background: rgba(255, 255, 255, 0.25);
transform: translateY(-2px);
```

**Active**
```scss
background: rgba(102, 126, 234, 0.3);
transform: scale(0.98);
```

**Focus**
```scss
outline: 2px solid #00f5ff;
outline-offset: 2px;
box-shadow: 0 0 0 4px rgba(0, 245, 255, 0.2);
```

**Disabled**
```scss
opacity: 0.5;
cursor: not-allowed;
```

### Text Colors

**Primary Text** - `rgba(255, 255, 255, 0.95)`
- Usage: Headings, important labels

**Secondary Text** - `rgba(255, 255, 255, 0.75)`
- Usage: Body text, descriptions

**Muted Text** - `rgba(255, 255, 255, 0.5)`
- Usage: Helper text, placeholders

**Disabled Text** - `rgba(255, 255, 255, 0.3)`
- Usage: Disabled states

### Border Colors

**Default** - `rgba(255, 255, 255, 0.15)`
**Hover** - `rgba(255, 255, 255, 0.3)`
**Focus** - `#00f5ff`
**Accent** - `rgba(102, 126, 234, 0.5)`

---

## Typography System

### Font Families

**UI Font Stack (Inter)**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```
- Usage: All UI elements, buttons, labels, body text

**Display Font (Merriweather)**
```css
font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
```
- Usage: Large headings, marketing content

**Monospace Font (Fira Code)**
```css
font-family: 'Fira Code', 'Monaco', 'Courier New', monospace;
```
- Usage: Code snippets, technical labels, BPM display

### Fluid Font Sizes

Using `clamp()` for responsive typography:

**Heading 1**
```css
font-size: clamp(2rem, 4vw + 1rem, 3.5rem);
line-height: 1.2;
font-weight: 700;
```

**Heading 2**
```css
font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
line-height: 1.3;
font-weight: 600;
```

**Heading 3**
```css
font-size: clamp(1.5rem, 2vw + 0.5rem, 2rem);
line-height: 1.4;
font-weight: 600;
```

**Body Large**
```css
font-size: clamp(1.125rem, 1vw + 0.5rem, 1.25rem);
line-height: 1.6;
font-weight: 400;
```

**Body**
```css
font-size: clamp(0.875rem, 0.5vw + 0.5rem, 1rem);
line-height: 1.6;
font-weight: 400;
```

**Small**
```css
font-size: clamp(0.75rem, 0.5vw + 0.25rem, 0.875rem);
line-height: 1.5;
font-weight: 400;
```

### Font Weights

- **Light**: 300 - Subtle text, large displays
- **Regular**: 400 - Body text, labels
- **Medium**: 500 - Emphasized body text
- **Semibold**: 600 - Subheadings, button text
- **Bold**: 700 - Headings, strong emphasis

### Line Heights

- **Tight**: 1.2 - Large headings
- **Normal**: 1.5 - UI elements
- **Relaxed**: 1.6 - Body text, readability
- **Loose**: 1.8 - Documentation, long-form content

### Letter Spacing

- **Tight**: -0.025em - Large headings
- **Normal**: 0 - Default
- **Wide**: 0.025em - Uppercase labels
- **Wider**: 0.05em - Buttons, small caps

---

## Spacing & Layout

### Spacing Scale (8px Grid)

Our spacing system is based on multiples of 8px for visual consistency:

```scss
$spacing: (
  0: 0,
  1: 0.25rem,  // 4px
  2: 0.5rem,   // 8px
  3: 0.75rem,  // 12px
  4: 1rem,     // 16px
  5: 1.25rem,  // 20px
  6: 1.5rem,   // 24px
  8: 2rem,     // 32px
  10: 2.5rem,  // 40px
  12: 3rem,    // 48px
  16: 4rem,    // 64px
  20: 5rem,    // 80px
  24: 6rem,    // 96px
);
```

**Usage Guidelines:**
- `spacing-2` (8px) - Minimum padding, tight spacing
- `spacing-4` (16px) - Default padding for buttons, form fields
- `spacing-6` (24px) - Card padding, section spacing
- `spacing-8` (32px) - Large component spacing
- `spacing-12` (48px) - Section breaks

### Border Radius

```scss
$radius: (
  sm: 0.375rem,   // 6px - Small buttons, badges
  md: 0.5rem,     // 8px - Default for most components
  lg: 0.75rem,    // 12px - Cards, panels
  xl: 1rem,       // 16px - Large containers
  2xl: 1.5rem,    // 24px - Hero sections
  full: 9999px,   // Circular - Pills, avatars
);
```

### Container Sizes

```scss
$containers: (
  xs: 20rem,    // 320px
  sm: 24rem,    // 384px
  md: 28rem,    // 448px
  lg: 32rem,    // 512px
  xl: 36rem,    // 576px
  2xl: 42rem,   // 672px
  full: 100%,
);
```

### Responsive Breakpoints

```scss
$breakpoints: (
  mobile: 480px,
  tablet: 640px,
  tablet-lg: 768px,
  desktop: 1024px,
  desktop-lg: 1280px,
  wide: 1536px,
);
```

**Usage:**
- **< 480px**: Mobile small (single column, stacked layout)
- **480-640px**: Mobile large (single column with more breathing room)
- **640-1023px**: Tablet (2-column grid for instruments)
- **≥ 1024px**: Desktop (3-column grid, full features)

### Grid System

**Default Grid:**
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 1.5rem;
```

**Responsive Instrument Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

---

## Component Specifications

### Buttons

#### Primary Button
```scss
padding: 0.75rem 1.5rem;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
border-radius: 0.5rem;
font-weight: 600;
color: white;
box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}
```

#### Ghost Button
```scss
padding: 0.75rem 1.5rem;
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 0.5rem;

&:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

#### Icon Button
```scss
width: 2.5rem;
height: 2.5rem;
padding: 0.5rem;
border-radius: 0.5rem;
display: flex;
align-items: center;
justify-content: center;
```

### Sliders

```scss
.slider {
  width: 100%;
  height: 0.375rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  
  &::-webkit-slider-thumb {
    width: 1rem;
    height: 1rem;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(0, 245, 255, 0.6);
  }
}
```

### Cards (Instrument Tiles)

```scss
padding: 1.5rem;
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.2);
border-radius: 0.75rem;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Toggle Switches

```scss
width: 3rem;
height: 1.5rem;
background: rgba(255, 255, 255, 0.2);
border-radius: 9999px;
position: relative;

.toggle-thumb {
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  
  &.active {
    transform: translateX(1.5rem);
    background: #00f5ff;
  }
}
```

### Step Sequencer Grid

```scss
display: grid;
grid-template-columns: repeat(16, 1fr);
gap: 0.375rem;

.step {
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  
  &.active {
    background: #667eea;
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
  }
  
  &.playing {
    animation: pulse 0.3s ease-out;
  }
}

@media (max-width: 640px) {
  grid-template-columns: repeat(8, 1fr);
}
```

### Beat Indicator

```scss
display: flex;
gap: 0.5rem;

.beat-dot {
  width: 0.75rem;
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  
  &.active {
    background: #00f5ff;
    box-shadow: 0 0 10px #00f5ff;
    transform: scale(1.2);
  }
}
```

---

## Responsive Design

### Mobile-First Approach

Always start with mobile styles and progressively enhance:

```scss
// Mobile default
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

// Tablet
@media (min-width: 640px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

// Desktop
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Responsive Patterns

**Stacked to Grid:**
```scss
.instrument-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}
```

**Fluid Typography:**
```scss
h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
}
```

**Adaptive Step Grid:**
```scss
.step-grid {
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  max-width: 100%;
}
```

---

## Animation Guidelines

### Timing Functions

**Standard Easing:**
```scss
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

**Ease Out (Entering):**
```scss
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
```

**Ease In (Exiting):**
```scss
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

**Spring (Playful):**
```scss
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Duration Guidelines

- **Instant**: 100ms - Hover effects, highlights
- **Quick**: 150ms - Button states, toggles
- **Normal**: 250ms - Panel transitions, fades
- **Slow**: 400ms - Large movements, page transitions
- **Deliberate**: 600ms+ - Emphasis, celebrations

### Common Animations

**Hover Lift:**
```scss
transition: transform 0.2s ease;

&:hover {
  transform: translateY(-2px);
}
```

**Pulse (Beat Indicator):**
```scss
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

**Glow:**
```scss
@keyframes glow {
  0%, 100% { box-shadow: 0 0 10px currentColor; }
  50% { box-shadow: 0 0 20px currentColor; }
}
```

**Reduced Motion:**
```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG AA Compliance

**Contrast Ratios:**
- Normal text (< 18pt): Minimum 4.5:1
- Large text (≥ 18pt or bold ≥ 14pt): Minimum 3:1
- UI components: Minimum 3:1

**Our Implementation:**
- White text on dark background: ~15:1 ✓
- Colored text on glass: Tested for minimum 4.5:1 ✓
- Interactive elements: Minimum 3:1 contrast ✓

### Focus Management

```scss
:focus-visible {
  outline: 2px solid #00f5ff;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 245, 255, 0.2);
}
```

### Screen Reader Support

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order follows logical visual flow
- Enter/Space activates buttons
- Arrow keys navigate step sequencer
- Escape closes modals/menus

### ARIA Labels

```html
<button aria-label="Play beat">▶</button>
<input type="range" aria-label="BPM slider" aria-valuemin="60" aria-valuemax="200">
<div role="grid" aria-label="Step sequencer">
```

---

## Implementation Guide

### Setting Up SCSS

1. **Install dependencies:**
```bash
npm install sass --save-dev
```

2. **Import design tokens:**
```scss
@import 'tokens/colors';
@import 'tokens/typography';
@import 'tokens/spacing';
@import 'tokens/shadows';
```

3. **Use mixins:**
```scss
@import 'abstracts/functions';
@import 'abstracts/mixins';

.card {
  @include glass-medium;
  @include smooth-transition(all, 0.3s, ease);
}
```

### Using CSS Custom Properties

```javascript
// Access in JavaScript
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary');
```

### Component Structure

```scss
.component {
  // Layout
  display: flex;
  padding: spacing(4);
  
  // Visual
  @include glass-medium;
  border-radius: var(--radius-md);
  
  // Typography
  font-size: var(--font-size-body);
  
  // Interaction
  @include smooth-transition(all, 0.2s, ease);
  
  &:hover {
    @include hover-lift;
  }
}
```

---

## Best Practices

### Do's ✓

1. **Use design tokens** - Never hardcode values
2. **Mobile-first** - Start small, scale up
3. **Semantic HTML** - Use appropriate elements
4. **Progressive enhancement** - Core functionality without JS
5. **Test accessibility** - Use keyboard, screen readers
6. **Optimize performance** - Minimize repaints, use transforms
7. **Consistent spacing** - Stick to 8px grid
8. **Clear hierarchy** - Visual weight matches importance

### Don'ts ✗

1. **Don't skip focus states** - Always provide visible focus
2. **Don't use color alone** - Add icons, text, patterns
3. **Don't animate everything** - Be purposeful
4. **Don't break keyboard nav** - Test thoroughly
5. **Don't ignore reduced motion** - Respect user preferences
6. **Don't use fixed units** - Prefer rem, em, %
7. **Don't nest too deep** - Keep specificity low
8. **Don't sacrifice performance** - Profile animations

### Code Quality

**Write maintainable SCSS:**
```scss
// Good
.button {
  @include glass-light;
  padding: spacing(4);
  
  &--primary {
    background: var(--color-primary);
  }
}

// Avoid
.button {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
}
.button.primary {
  background: #667eea;
}
```

### Performance Tips

1. Use `transform` and `opacity` for animations
2. Minimize backdrop-filter usage (expensive)
3. Use `will-change` sparingly
4. Debounce resize handlers
5. Lazy load off-screen content

---

## Conclusion

This design system provides a solid foundation for building the SalsaNor Beat Machine UI. By following these guidelines, you'll create a consistent, accessible, and visually stunning experience that delights users while maintaining excellent performance and usability.

For questions or suggestions, please open an issue in the GitHub repository.

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Maintained by**: SalsaNor Team
