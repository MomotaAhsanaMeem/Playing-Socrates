---
name: Socratic Inquiry System
colors:
  surface: '#f9f9fc'
  surface-dim: '#dadadc'
  surface-bright: '#f9f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f6'
  surface-container: '#eeeef0'
  surface-container-high: '#e8e8ea'
  surface-container-highest: '#e2e2e5'
  on-surface: '#1a1c1e'
  on-surface-variant: '#42474f'
  inverse-surface: '#2f3133'
  inverse-on-surface: '#f0f0f3'
  outline: '#727780'
  outline-variant: '#c2c7d1'
  surface-tint: '#2d6197'
  primary: '#00355f'
  on-primary: '#ffffff'
  primary-container: '#0f4c81'
  on-primary-container: '#8ebdf9'
  inverse-primary: '#a0c9ff'
  secondary: '#48626e'
  on-secondary: '#ffffff'
  secondary-container: '#cbe7f5'
  on-secondary-container: '#4e6874'
  tertiary: '#28353e'
  on-tertiary: '#ffffff'
  tertiary-container: '#3e4c55'
  on-tertiary-container: '#adbcc6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#a0c9ff'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#07497d'
  secondary-fixed: '#cbe7f5'
  secondary-fixed-dim: '#afcbd8'
  on-secondary-fixed: '#021f29'
  on-secondary-fixed-variant: '#304a55'
  tertiary-fixed: '#d6e5ef'
  tertiary-fixed-dim: '#bac9d3'
  on-tertiary-fixed: '#0f1d25'
  on-tertiary-fixed-variant: '#3b4951'
  background: '#f9f9fc'
  on-background: '#1a1c1e'
  surface-variant: '#e2e2e5'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-md:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-sm:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1140px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  section-gap: 64px
---

## Brand & Style

This design system focuses on **Academic Minimalism**. The goal is to minimize cognitive load for students and researchers by prioritizing clarity, legibility, and a calm, focused environment. The interface acts as a silent scaffolding for the AI-assisted learning experience, avoiding visual noise that could distract from deep inquiry.

The style is characterized by:
- **Utilitarian Precision:** Every element serves a functional purpose in the learning journey.
- **Intentional Whitespace:** Generous breathing room to foster a sense of "intellectual space."
- **Institutional Trust:** A professional aesthetic that reflects the rigor of HCI research and traditional academia.
- **Accessibility-First:** High-contrast ratios and clear semantic hierarchies are foundational, not afterthoughts.

## Colors

The palette is rooted in professional blues and slate grays to evoke stability and focus. 

- **Primary (#0F4C81):** A deep, scholarly "Oxford Blue" used for primary actions, active navigation states, and brand-critical indicators.
- **Secondary (#546E7A):** A muted slate blue used for secondary actions, supporting text, and subtle UI accents.
- **Tertiary (#E3F2FD):** A light wash blue used for background highlights, card containers, and soft separation of content blocks.
- **Neutral (#1A1C1E):** A near-black gray to ensure maximum contrast for body text and headers, avoiding the harshness of true black.
- **Backgrounds:** Use pure white (#FFFFFF) for the main content area to mimic the "blank page" of a notebook, with a very light gray (#F8F9FA) for the application shell.

## Typography

The system employs a dual-font strategy to distinguish between UI "machinery" and scholarly content.

1.  **UI & Navigation:** Uses **Hanken Grotesk** for headlines and **Inter** for labels. These are clean, modern, and highly legible even at small sizes.
2.  **Learning Content:** Uses **Source Serif 4** for all long-form reading, AI-generated prompts, and instructional text. This serif font provides a comfortable, book-like reading experience that signals academic quality.

**Hierarchy Guidance:**
- Use `display-lg` only for major landing moments.
- `body-md` is the default for reading content to ensure high accessibility.
- Use `label-caps` for small metadata like "Step 1 of 5" or "Reading Time."

## Layout & Spacing

The design system utilizes a **fixed-width centered grid** for the main learning content to prevent line lengths from becoming too wide for comfortable reading.

- **Content Constraint:** For readability, the main text column should never exceed 720px in width, even if the container is larger.
- **Rhythm:** An 8px base unit drives all spacing. 
- **Stacking:** Use `section-gap` (64px) between major learning modules to visually indicate a transition in the curriculum.
- **Mobile Adaptivity:** On mobile, margins reduce to 16px and the grid becomes a single-column fluid flow.

## Elevation & Depth

This design system avoids heavy shadows and skeuomorphism in favor of **Tonal Layers** and **Flat Outlines**.

- **Surfaces:** Use subtle background color shifts to indicate depth. The main app background is slightly off-white, while the active workspace (the "paper") is pure white.
- **Borders:** Use 1px solid borders in a light gray (#E0E0E0) for cards and input fields.
- **Active State:** When an element is focused or active (like a selected study card), use a 2px primary color border rather than a shadow.
- **Overlays:** For modals or pop-overs, use a soft, large-radius shadow (0px 8px 24px rgba(0,0,0,0.08)) to distinguish the overlay from the flat page below.

## Shapes

The shape language is **Soft (0.25rem)** to maintain a professional, organized appearance without feeling overly organic or "playful."

- **Standard Elements:** Buttons, input fields, and small chips use `rounded` (4px).
- **Large Containers:** Content cards and modal dialogs use `rounded-lg` (8px).
- **Progress Indicators:** Stepper tracks and progress bars use `rounded-xl` (12px) to provide a softer, more approachable feel for tracking achievement.

## Components

### Buttons
- **Primary:** Solid #0F4C81 with white text. High-contrast, bold, 4px rounded corners.
- **Secondary:** Outlined with #546E7A and a 1px border. No fill.
- **Text Button:** Simple blue text for low-priority actions (e.g., "See more").

### Study Cards
- **Base:** White background, 1px light gray border, 8px corner radius.
- **Interactive:** On hover, the border thickens or changes to the primary color. No lifting shadows.
- **Padding:** Always use a minimum of 24px internal padding for content.

### Progress Indicators (Steppers)
- **Track:** A thin 4px horizontal line.
- **Completed:** Solid primary color circle with a checkmark.
- **Active:** White circle with a thick primary border.
- **Inactive:** Light gray circle with gray text labels.

### Form Inputs
- **Label:** `label-md` in Neutral color.
- **Field:** White background, 1px border. Focused state uses a 2px primary border.
- **Help Text:** Always provide `body-sm` text below inputs for academic clarity and accessibility.

### Socratic Feedback Block
- A specialized container for AI-generated questions.
- Background: Tertiary (#E3F2FD).
- Border-left: 4px solid Primary (#0F4C81).
- Typography: Uses `body-md` (Source Serif 4) for the inquiry text.