# Stud — AI PM Pathfinder Design System

## Core Aesthetic: High-Contrast Light Mode SaaS

- **Canvas Background**: `#F4F7F9` (Crisp Off-White / Ice)
- **Primary Accent**: `#0D6E6E` (Deep Teal)
- **Cards**: `#FFFFFF` (Pure White Elevated Cards with `#E2E8F0` Border)
- **Hero Highlights**: `#E6F4F1` (Soft Mint Hero)
- **Typography**: Dark Slate (`#0F172A` headers, `#334155` body, `#64748B` muted)

---

## Breakpoints & Responsiveness

| Device Breakpoint | Width | Navigation Mode | Grid Columns |
| :--- | :--- | :--- | :--- |
| **Mobile** | `< 768px` | Drawer overlay (dismissible via backdrop) | 1 Column Stack |
| **Tablet** | `768px – 1023px` | Persistent sidebar | 2 Column Grid |
| **Desktop** | `>= 1024px` | Persistent sidebar | 3 Column Grid |

---

## Component Specs

### 1. `GlassCard`
- Default background `#FFFFFF`, border `#E2E8F0`, shadow radius 8px, opacity 0.05.
- **Variants**:
  - `standard`: Pure White card.
  - `hero`: Soft Mint `#E6F4F1` background, `#CBE6E0` border.
  - `emerald`: Soft Green `#F0FDF4`, `#A7F3D0` border.
  - `pink`: Soft Rose `#FFF1F2`, `#FDA4AF` border (due_now alerts).

### 2. `GlassButton`
- **Primary**: Solid Deep Teal (`#0D6E6E`) with white text.
- **Secondary**: Emerald Green (`#059669`) with white text.
- **Outline**: Slate outline (`#E2E8F0`) with dark text (`#334155`).

### 3. `GlassInput`
- Light mode text input with `#F8FAFC` fill, `#E2E8F0` border, `#0D6E6E` active focus ring.

### 4. `FloatingFocusTimer`
- Bottom-right floating card (`zIndex: 9999`). Automatically hides when no active timer session is present.
