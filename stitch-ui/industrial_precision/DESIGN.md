---
name: Industrial Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-metrics:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for high-stakes industrial environments where clarity, reliability, and precision are paramount. The brand personality is authoritative and high-tech, leaning into a **Modern Corporate** aesthetic with a **Tactile** edge. 

The visual language prioritizes data density without sacrificing legibility. It utilizes a deep, multi-layered dark mode to reduce eye strain for operators during long shifts. UI elements feature subtle depth through tonal layering and micro-interactions that provide immediate haptic-like visual feedback, ensuring the user feels in total control of the water treatment infrastructure.

Target Audience: Plant operators, environmental engineers, and facility managers requiring real-time situational awareness.

## Colors

The palette is anchored in **Deep Navy and Slate** to establish a professional, industrial atmosphere. 

- **Primary**: A high-visibility blue used for active states, primary actions, and key interactive focal points.
- **Surface Tones**: The background uses a near-black navy (`#020617`), while interactive surfaces and cards use a lighter slate (`#1E293B`) to create clear containment.
- **Semantic Palette**: Strict adherence to status colors is mandatory. 
    - **Green**: Operational stability.
    - **Yellow**: Preventative maintenance/threshold warnings.
    - **Red**: Immediate intervention required.
    - **Blue**: System telemetry and general information.
- **Charts**: Use a sequence of saturated cool tones (Cyan, Indigo, Violet) for multi-series data to maintain harmony with the dark UI while ensuring contrast.

## Typography

This design system utilizes **Inter** for all functional UI text due to its exceptional legibility in data-heavy contexts. For sensor readings, timestamps, and technical IDs, **JetBrains Mono** is introduced to provide a distinctive "instrumentation" feel and ensure character alignment in live-updating tables.

- **Metrics**: Use `display-metrics` for primary sensor values (e.g., pH levels, Flow Rate).
- **Hierarchy**: Use `label-sm` with a secondary color for category descriptors to keep the focus on the primary data points.
- **Line Heights**: Tight line heights are used for display values to keep cards compact, while body text maintains generous spacing for report reading.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high-density spacing. The primary dashboard structure utilizes a 12-column system on desktop.

- **Sidebar**: Fixed at 260px for navigation and system-wide status toggles.
- **Margins**: A consistent 24px margin around the viewport edges ensures the UI doesn't feel cramped despite the data density.
- **Reflow**: 
    - **Desktop (1280px+)**: 12 columns, 16px gutters.
    - **Tablet (768px - 1279px)**: 6 columns, sensor cards reflow to 2-up.
    - **Mobile (<767px)**: Single column, 12px horizontal margins, navigation collapses to a bottom bar or hamburger menu.
- **Rhythm**: All spacing is a multiple of 4px. Use `stack-sm` for internal card padding and `stack-md` for spacing between discrete UI modules.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and precise **Inner Shadows**. 

1. **Base Layer**: The background (`#020617`) acts as the "floor."
2. **Surface Layer**: Cards and panels (`#1E293B`) sit 1dp above the base. They feature a 1px border (`#334155`) and a very subtle drop shadow (15% opacity black, 4px blur).
3. **Interactive Layer**: Buttons and active inputs use the primary blue with a soft outer glow (0 0 12px) to simulate "lit" controls.
4. **Recessed Elements**: Search bars and data table headers use a slightly darker shade than the card surface with an inner shadow to appear "etched" into the interface.

## Shapes

The design system adopts a **Soft** geometry. This provides a professional, modern feel that avoids the clinical harshness of sharp corners while maintaining a structured, industrial appearance.

- **Standard Elements**: Buttons, input fields, and small cards use a 0.25rem radius.
- **Main Containers**: Large dashboard widgets and panels use 0.5rem (`rounded-lg`).
- **Status Indicators**: Status dots and "Pill" badges for alerts use a fully rounded (9999px) radius to distinguish them from structural layout elements.

## Components

### Sensor Cards
The foundational component of the dashboard.
- **Structure**: Title (Label-sm), Main Value (Display-metrics), Trend Sparkline (mini-chart), and Status Badge.
- **Visuals**: Use a vertical accent border on the left side of the card, color-coded to the current status (Green, Yellow, Red).

### Real-Time Charts
- **Lines**: Use a 2px stroke width with a slight gradient fill (10% opacity) below the line.
- **Grid**: Use dashed lines (`#334155`) for the Y-axis to provide context without visual noise.
- **Tooltips**: High-contrast dark backgrounds with white text, showing precise values from the `label-mono` scale.

### Sidebar Navigation
- **State**: Active items use a primary blue left-accent bar and a subtle background tint (`#3B82F6` at 10% opacity).
- **Icons**: Use 20px stroke-based icons (2px weight) for maximum clarity.

### Alert Panels
- **Critical Alerts**: Pulse animation on the border of the alert panel.
- **Typography**: Bold headlines with mono-spaced timestamps to emphasize urgency and precision.

### Buttons & Controls
- **Primary**: Solid blue background, white text.
- **Secondary**: Ghost style with a slate border, turning solid on hover.
- **Toggle Switches**: Distinctly "mechanical" look with high-contrast active states.