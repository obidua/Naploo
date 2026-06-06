# Naploo™ UI/UX Design System

> Complete design specifications and guidelines for the Naploo™ ecosystem  
> **Last Updated:** June 6, 2026

---

## ⚠️ Implementation Status

> This design system is **implemented in the customer website** (`apps/web`). The shared UI package (`packages/ui`) is still empty — components currently live inside `apps/web/src/components/`.

### Implemented Components

| Component | File | Description |
|-----------|------|-------------|
| Button | `components/ui/Button.tsx` | Primary, secondary, outline variants |
| GlassCard | `components/ui/GlassCard.tsx` | Glassmorphism card component |
| HeroPodSlider | `components/ui/HeroPodSlider.tsx` | Hero section image slider |
| ImageSlider | `components/ui/ImageSlider.tsx` | Generic image carousel |
| Input | `components/ui/Input.tsx` | Form input with validation |
| Navbar | `components/layout/Navbar.tsx` | Main navigation header (now driven by Zustand `useAuthStore`) |
| Footer | `components/layout/Footer.tsx` | Site footer |
| LayoutWrapper | `components/layout/LayoutWrapper.tsx` | Page layout wrapper |
| MobileBottomNav | `components/layout/MobileBottomNav.tsx` | Mobile bottom navigation |
| PWAInstallPrompt | `components/PWAInstallPrompt.tsx` | PWA install banner |
| FilterSection | `components/pods/FilterSection.tsx` | Pod filtering controls (legacy /pods page) |
| PodCard | `components/pods/PodCard.tsx` | Pod listing card |
| PropertyCard | `components/pods/PropertyCard.tsx` | Property listing card |
| **SearchBar** | `components/search/SearchBar.tsx` | OYO-style search: hero + compact variants, mode toggle (hourly pods / nightly rooms), location autocomplete, date+duration / check-in+out, guest stepper. Must be wrapped in `<Suspense>` on statically rendered pages because it uses `useSearchParams`. |
| **FilterPanel** | `app/search/SearchPageClient.tsx` (inline) | Search results filters: property type, price range slider, amenity chips |
| **Property page rooms/pods tabs** | `app/property/[id]/PropertyPageClient.tsx` | Tabbed booking surface with sticky sidebar |
| **CheckoutClient** | `app/booking/checkout/CheckoutClient.tsx` | Guest details, payment method radios, coupon code, GST breakdown |
| **Confirmation page** | `app/booking/confirmation/[id]/page.tsx` | Branded success state + booking code (`NP######`) |
| **My Bookings** | `app/profile/bookings/page.tsx` | Auth-gated upcoming + past sections, status badges, cancel flow |

---

## Table of Contents

1. [Brand Identity](#1-brand-identity)
2. [Color System](#2-color-system)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Components](#5-components)
6. [Icons & Illustrations](#6-icons--illustrations)
7. [Motion & Animation](#7-motion--animation)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility](#9-accessibility)
10. [Design Tokens](#10-design-tokens)

---

## 1. Brand Identity

### 1.1 Brand Values

| Value | Description |
|-------|-------------|
| **Innovation** | Futuristic, tech-forward design |
| **Comfort** | Warm, inviting, restful experience |
| **Trust** | Reliable, secure, professional |
| **Accessibility** | Affordable luxury for everyone |

### 1.2 Brand Personality

- **Tone:** Friendly yet professional
- **Voice:** Clear, helpful, reassuring
- **Feel:** Modern, clean, premium

### 1.3 Logo Usage

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     ╔═╗╔═╗╔═╗╦  ╔═╗╔═╗                                     │
│     ║║║╠═╣╠═╝║  ║ ║║ ║                                     │
│     ╝╚╝╩ ╩╩  ╩═╝╚═╝╚═╝                                     │
│                                                             │
│     Primary Logo (Horizontal)                               │
│     Min width: 120px                                        │
│     Clear space: 16px around                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Logo Variants:**
- Primary (Full color on light background)
- Reversed (White on dark background)
- Monochrome (Single color)
- Icon only (Pod symbol)

---

## 2. Color System

### 2.1 Primary Colors

```css
/* Primary Indigo - Trust, Technology, Premium */
--color-primary-50:  #eef2ff;
--color-primary-100: #e0e7ff;
--color-primary-200: #c7d2fe;
--color-primary-300: #a5b4fc;
--color-primary-400: #818cf8;
--color-primary-500: #6366f1;  /* ← Main Primary (Indigo) */
--color-primary-600: #4f46e5;
--color-primary-700: #4338ca;
--color-primary-800: #3730a3;
--color-primary-900: #312e81;
--color-primary-950: #1e1b4b;
```

### 2.2 Secondary Colors

```css
/* Secondary Violet - Premium, Luxury */
--color-secondary: #8b5cf6;  /* ← Main Secondary (Violet) */

/* Accent Cyan - Technology, Fresh */
--color-accent: #06b6d4;  /* ← Accent Color */

/* Naploo Brand Gradient */
--gradient-start: #6366f1;  /* Indigo */
--gradient-middle: #8b5cf6; /* Violet */
--gradient-end: #06b6d4;    /* Cyan */

/* Dark Theme */
--naploo-dark: #0f0f23;
--naploo-dark-50: #1a1a2e;
--naploo-dark-100: #16213e;
--naploo-dark-200: #1f2937;
```

### 2.3 Semantic Colors

```css
/* Success - Emerald (as defined in naploo config) */
--color-success: #10b981;

/* Warning - Amber */
--color-warning: #f59e0b;

/* Error - Red */
--color-error: #ef4444;
```

### 2.4 Neutral Colors

```css
/* Gray Scale */
--color-gray-50:  #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-400: #9ca3af;
--color-gray-500: #6b7280;
--color-gray-600: #4b5563;
--color-gray-700: #374151;
--color-gray-800: #1f2937;
--color-gray-900: #111827;
--color-gray-950: #030712;
```

### 2.5 Background Colors

```css
/* Light Mode */
--bg-primary:   #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary:  #f3f4f6;

/* Dark Mode */
--bg-primary-dark:   #111827;
--bg-secondary-dark: #1f2937;
--bg-tertiary-dark:  #374151;
```

### 2.6 Color Usage Guidelines

| Usage | Color | Example |
|-------|-------|---------|
| Primary CTA | `primary-500` | Book Now button |
| Secondary CTA | `gray-100` | Cancel button |
| Links | `primary-600` | Text links |
| Success states | `success-500` | Confirmed booking |
| Error states | `error-500` | Form errors |
| Text primary | `gray-900` | Headings, body |
| Text secondary | `gray-500` | Captions, hints |
| Borders | `gray-200` | Card borders |
| Dividers | `gray-100` | Section dividers |

---

## 3. Typography

### 3.1 Font Families

```css
/* Primary Font - UI and Body */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display Font - Headlines */
--font-display: 'Plus Jakarta Sans', var(--font-primary);

/* Mono Font - Code, Numbers */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### 3.2 Font Sizes

```css
/* Type Scale */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-6xl:  3.75rem;   /* 60px */
--text-7xl:  4.5rem;    /* 72px */
```

### 3.3 Font Weights

```css
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
--font-extrabold: 800;
```

### 3.4 Line Heights

```css
--leading-none:    1;
--leading-tight:   1.25;
--leading-snug:    1.375;
--leading-normal:  1.5;
--leading-relaxed: 1.625;
--leading-loose:   2;
```

### 3.5 Typography Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | 48px / 3rem | Bold (700) | 1.25 | -0.02em |
| H2 | 36px / 2.25rem | Bold (700) | 1.25 | -0.01em |
| H3 | 30px / 1.875rem | Semibold (600) | 1.375 | 0 |
| H4 | 24px / 1.5rem | Semibold (600) | 1.375 | 0 |
| H5 | 20px / 1.25rem | Medium (500) | 1.5 | 0 |
| H6 | 18px / 1.125rem | Medium (500) | 1.5 | 0 |
| Body Large | 18px | Normal (400) | 1.625 | 0 |
| Body | 16px | Normal (400) | 1.5 | 0 |
| Body Small | 14px | Normal (400) | 1.5 | 0 |
| Caption | 12px | Normal (400) | 1.5 | 0.01em |
| Overline | 12px | Semibold (600) | 1.5 | 0.1em |

### 3.6 Typography Examples

```html
<!-- Heading 1 -->
<h1 class="text-5xl font-bold leading-tight tracking-tight text-gray-900">
  Your Private Space, Anytime
</h1>

<!-- Heading 2 -->
<h2 class="text-4xl font-bold leading-tight text-gray-900">
  Explore Our Pods
</h2>

<!-- Body Text -->
<p class="text-base text-gray-600 leading-relaxed">
  Experience Naploo™, the modern way to rest — affordable, 
  private, and luxurious capsule hotels.
</p>

<!-- Caption -->
<span class="text-xs text-gray-500">
  Starting at ₹150/hour
</span>
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
/* Base unit: 4px */
--space-0:    0;
--space-px:   1px;
--space-0.5:  0.125rem;  /* 2px */
--space-1:    0.25rem;   /* 4px */
--space-1.5:  0.375rem;  /* 6px */
--space-2:    0.5rem;    /* 8px */
--space-2.5:  0.625rem;  /* 10px */
--space-3:    0.75rem;   /* 12px */
--space-3.5:  0.875rem;  /* 14px */
--space-4:    1rem;      /* 16px */
--space-5:    1.25rem;   /* 20px */
--space-6:    1.5rem;    /* 24px */
--space-7:    1.75rem;   /* 28px */
--space-8:    2rem;      /* 32px */
--space-9:    2.25rem;   /* 36px */
--space-10:   2.5rem;    /* 40px */
--space-11:   2.75rem;   /* 44px */
--space-12:   3rem;      /* 48px */
--space-14:   3.5rem;    /* 56px */
--space-16:   4rem;      /* 64px */
--space-20:   5rem;      /* 80px */
--space-24:   6rem;      /* 96px */
--space-28:   7rem;      /* 112px */
--space-32:   8rem;      /* 128px */
```

### 4.2 Layout Grid

```css
/* Container Widths */
--container-sm:  640px;
--container-md:  768px;
--container-lg:  1024px;
--container-xl:  1280px;
--container-2xl: 1536px;

/* Content Width */
--content-width: 1280px;

/* Grid Columns */
--grid-cols: 12;
--grid-gap: 24px;
```

### 4.3 Common Layout Patterns

```html
<!-- Page Container -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>

<!-- Section Spacing -->
<section class="py-16 sm:py-20 lg:py-24">
  <!-- Section Content -->
</section>

<!-- Card Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- Two Column Layout -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
  <!-- Left Column -->
  <!-- Right Column -->
</div>
```

### 4.4 Border Radius

```css
--radius-none: 0;
--radius-sm:   0.125rem;  /* 2px */
--radius-md:   0.375rem;  /* 6px */
--radius-lg:   0.5rem;    /* 8px */
--radius-xl:   0.75rem;   /* 12px */
--radius-2xl:  1rem;      /* 16px */
--radius-3xl:  1.5rem;    /* 24px */
--radius-full: 9999px;
```

### 4.5 Shadows

```css
--shadow-xs:  0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

---

## 5. Components

### 5.1 Buttons

#### Primary Button
```html
<button class="
  inline-flex items-center justify-center
  px-6 py-3
  bg-primary-500 hover:bg-primary-600 active:bg-primary-700
  text-white font-medium
  rounded-lg
  transition-colors duration-200
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Book Now
</button>
```

#### Button Sizes
| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| Small | px-3 py-1.5 | 14px | 32px |
| Medium | px-4 py-2 | 14px | 40px |
| Large | px-6 py-3 | 16px | 48px |
| XL | px-8 py-4 | 18px | 56px |

#### Button Variants
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Primary  │  │Secondary │  │ Outline  │  │  Ghost   │    │
│  │ ████████ │  │ ████████ │  │ ──────── │  │          │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│                                                              │
│  bg-primary    bg-gray-100   border         bg-transparent  │
│  text-white    text-gray-900 text-gray-700  text-gray-600   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Input Fields

```html
<!-- Text Input -->
<div class="space-y-1.5">
  <label class="block text-sm font-medium text-gray-700">
    Full Name
  </label>
  <input
    type="text"
    class="
      w-full px-4 py-2.5
      border border-gray-300 rounded-lg
      text-gray-900 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      transition-shadow duration-200
    "
    placeholder="Enter your name"
  />
  <p class="text-sm text-gray-500">As per government ID</p>
</div>

<!-- Error State -->
<input class="
  ...
  border-error-500
  focus:ring-error-500
"/>
<p class="text-sm text-error-500">Please enter a valid name</p>
```

### 5.3 Cards

```html
<!-- Basic Card -->
<div class="
  bg-white
  rounded-xl
  border border-gray-200
  shadow-sm
  overflow-hidden
">
  <img src="..." class="w-full h-48 object-cover" />
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900">Pod Name</h3>
    <p class="mt-2 text-gray-600">Description text</p>
  </div>
</div>

<!-- Interactive Card -->
<div class="
  ...
  hover:shadow-md
  hover:border-primary-200
  transition-all duration-200
  cursor-pointer
">
```

### 5.4 Navigation

```html
<!-- Header -->
<header class="
  sticky top-0 z-50
  bg-white/80 backdrop-blur-lg
  border-b border-gray-100
">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <a href="/" class="flex items-center">
        <img src="/logo.svg" class="h-8 w-auto" alt="Naploo" />
      </a>
      
      <!-- Nav Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="/locations" class="
          text-gray-600 hover:text-gray-900
          font-medium text-sm
          transition-colors
        ">Locations</a>
        <a href="/pods" class="...">Pods</a>
        <a href="/about" class="...">About</a>
      </div>
      
      <!-- CTA -->
      <div class="flex items-center space-x-4">
        <a href="/login" class="text-gray-600 hover:text-gray-900">Login</a>
        <a href="/book" class="btn-primary">Book Now</a>
      </div>
    </div>
  </nav>
</header>
```

### 5.5 Modals

```html
<!-- Modal Backdrop -->
<div class="
  fixed inset-0 z-50
  bg-black/50 backdrop-blur-sm
  flex items-center justify-center
  p-4
">
  <!-- Modal Content -->
  <div class="
    bg-white
    rounded-2xl
    shadow-2xl
    w-full max-w-md
    max-h-[90vh] overflow-auto
    animate-scale-in
  ">
    <!-- Header -->
    <div class="flex items-center justify-between p-6 border-b">
      <h2 class="text-xl font-semibold">Modal Title</h2>
      <button class="p-2 hover:bg-gray-100 rounded-lg">
        <XIcon class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Body -->
    <div class="p-6">
      <!-- Content -->
    </div>
    
    <!-- Footer -->
    <div class="flex justify-end gap-3 p-6 border-t">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### 5.6 Toast Notifications

```html
<!-- Success Toast -->
<div class="
  fixed bottom-4 right-4
  flex items-center gap-3
  px-4 py-3
  bg-white
  border border-gray-200
  rounded-lg
  shadow-lg
  animate-slide-up
">
  <div class="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
    <CheckIcon class="w-5 h-5 text-success-600" />
  </div>
  <div>
    <p class="font-medium text-gray-900">Booking Confirmed!</p>
    <p class="text-sm text-gray-500">Check your email for details</p>
  </div>
  <button class="p-1 hover:bg-gray-100 rounded">
    <XIcon class="w-4 h-4 text-gray-400" />
  </button>
</div>
```

---

## 6. Icons & Illustrations

### 6.1 Icon Library

Use **Lucide React** for consistent iconography.

```bash
npm install lucide-react
```

### 6.2 Icon Sizes

| Size | Class | Use Case |
|------|-------|----------|
| XS | w-3 h-3 | Inline with small text |
| SM | w-4 h-4 | Buttons, inputs |
| MD | w-5 h-5 | Default, navigation |
| LG | w-6 h-6 | Feature icons |
| XL | w-8 h-8 | Empty states |
| 2XL | w-12 h-12 | Hero sections |

### 6.3 Common Icons

| Icon | Usage |
|------|-------|
| `<Search />` | Search input |
| `<MapPin />` | Location |
| `<Calendar />` | Date picker |
| `<Clock />` | Time, duration |
| `<User />` | Profile, account |
| `<CreditCard />` | Payment |
| `<QrCode />` | Check-in pass |
| `<Bed />` | Pod/room |
| `<Wifi />` | Amenity |
| `<Tv />` | Amenity |
| `<Thermometer />` | Climate control |

### 6.4 Illustration Style

- **Style:** Flat, minimal, geometric
- **Colors:** Use brand color palette
- **Stroke:** 1.5-2px consistent stroke
- **Corners:** Rounded, friendly feel

---

## 7. Motion & Animation

### 7.1 Timing Functions

```css
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
```

### 7.2 Durations

```css
--duration-75:  75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
--duration-1000: 1000ms;
```

### 7.3 Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### 7.4 Interaction States

```css
/* Hover transitions */
.interactive {
  transition: all 200ms ease-out;
}

/* Focus ring */
.focusable:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: var(--color-primary-500);
  ring-offset: 2px;
}

/* Active press */
.pressable:active {
  transform: scale(0.98);
}
```

---

## 8. Responsive Design

### 8.1 Breakpoints

```css
/* Mobile First Breakpoints */
--screen-sm:  640px;   /* Small devices */
--screen-md:  768px;   /* Tablets */
--screen-lg:  1024px;  /* Laptops */
--screen-xl:  1280px;  /* Desktops */
--screen-2xl: 1536px;  /* Large screens */
```

### 8.2 Responsive Patterns

```html
<!-- Mobile: Stack, Desktop: Side by side -->
<div class="flex flex-col lg:flex-row gap-6">
  <div class="w-full lg:w-1/2">Left</div>
  <div class="w-full lg:w-1/2">Right</div>
</div>

<!-- Mobile: 1 col, Tablet: 2 col, Desktop: 3 col -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Items -->
</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden md:block">Desktop only</div>

<!-- Show on mobile, hide on desktop -->
<div class="block md:hidden">Mobile only</div>
```

### 8.3 Touch Targets

- **Minimum size:** 44x44px
- **Spacing between targets:** 8px minimum
- **Thumb-friendly zones:** Primary actions in bottom half on mobile

---

## 9. Accessibility

### 9.1 Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

### 9.2 Focus Management

```css
/* Visible focus ring */
.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  left: -9999px;
}
.skip-link:focus {
  left: 0;
  z-index: 9999;
}
```

### 9.3 ARIA Guidelines

```html
<!-- Buttons with icons -->
<button aria-label="Close dialog">
  <XIcon aria-hidden="true" />
</button>

<!-- Loading states -->
<button aria-busy="true" aria-disabled="true">
  <Spinner aria-hidden="true" />
  Loading...
</button>

<!-- Form errors -->
<input aria-invalid="true" aria-describedby="email-error" />
<p id="email-error" role="alert">Please enter a valid email</p>

<!-- Live regions -->
<div aria-live="polite" aria-atomic="true">
  Booking confirmed!
</div>
```

### 9.4 Keyboard Navigation

- Tab: Move between focusable elements
- Enter/Space: Activate buttons/links
- Escape: Close modals/dropdowns
- Arrow keys: Navigate within components

---

## 10. Design Tokens

### 10.1 Tailwind Config

```javascript
// tailwind.config.js (Actual - from apps/web/tailwind.config.js)
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        naploo: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          dark: { DEFAULT: '#0f0f23', 50: '#1a1a2e', 100: '#16213e', 200: '#1f2937', 300: '#374151' },
          light: { DEFAULT: '#f8fafc', 50: '#ffffff', 100: '#f1f5f9', 200: '#e2e8f0' },
          gradient: { start: '#6366f1', middle: '#8b5cf6', end: '#06b6d4' },
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'url("/patterns/hero-bg.svg")',
        'grid-pattern': 'url("/patterns/grid.svg")',
        'noise': 'url("/patterns/noise.png")',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.4)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'neon': '0 0 5px theme(colors.primary.400), 0 0 20px theme(colors.primary.600)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
};
```

### 10.2 CSS Variables Export

```css
:root {
  /* Colors */
  --color-primary: 59 130 246;
  --color-secondary: 168 85 247;
  --color-success: 34 197 94;
  --color-warning: 245 158 11;
  --color-error: 239 68 68;
  
  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Plus Jakarta Sans', var(--font-sans);
  
  /* Spacing */
  --space-unit: 0.25rem;
  
  /* Borders */
  --border-radius: 0.5rem;
  --border-width: 1px;
  
  /* Shadows */
  --shadow-color: 0 0 0;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 300ms;
}
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────┐
│                    NAPLOO DESIGN SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  COLORS                                                          │
│  Primary:   #6366f1 (Indigo)   Secondary: #8b5cf6 (Violet)     │
│  Accent:    #06b6d4 (Cyan)                                      │
│  Success:   #10b981    Warning: #f59e0b    Error: #ef4444      │
│  Dark BG:   #0f0f23                                              │
│                                                                  │
│  TYPOGRAPHY                                                      │
│  Font: Inter / Plus Jakarta Sans                                │
│  H1: 48px/Bold    H2: 36px/Bold    H3: 30px/Semi                │
│  Body: 16px/400   Small: 14px/400  Caption: 12px/400           │
│                                                                  │
│  SPACING                                                         │
│  Base: 4px                                                       │
│  Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96           │
│                                                                  │
│  RADIUS                                                          │
│  SM: 6px   MD: 8px   LG: 12px   XL: 16px   4XL: 32px          │
│                                                                  │
│  BREAKPOINTS                                                     │
│  SM: 640px   MD: 768px   LG: 1024px   XL: 1280px   2XL: 1536px │
│                                                                  │
│  CUSTOM EFFECTS                                                  │
│  Glow Shadow: rgba(99, 102, 241, 0.3)                           │
│  Glass Shadow: rgba(0, 0, 0, 0.1)                               │
│  Neon: primary-400 + primary-600                                │
│                                                                  │
│  ANIMATIONS                                                      │
│  float, gradient, shimmer, glow, slide-up, slide-down,          │
│  fade-in, scale-in, spin-slow, bounce-slow, pulse-slow          │
│                                                                  │
│  ICONS: Lucide React                                             │
│  STATE: Zustand                                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

*Design System Version 2.1.0 | Last Updated: February 23, 2026*
