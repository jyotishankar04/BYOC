# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build
pnpm start      # Serve production build
pnpm lint       # Run ESLint
```

No test suite is configured yet.

## Architecture

**BYOC** (Bring Your Own Cloud) is a Next.js 16 App Router project — a file management dashboard where users connect their own S3-compatible cloud storage.

### Route structure

```
app/
  layout.tsx                        # Root layout: fonts + ThemeProvider
  page.tsx                          # Landing page (assembles sections from components/custom/landing/)
  (public-routes)/
    auth/login/page.tsx             # Google OAuth login
    auth/signup/page.tsx            # Sign-up
    onboard/page.tsx                # 3-step provider onboarding (select → details → verify)
```

The `(public-routes)` route group wraps unauthenticated flows — no shared layout file exists yet, so it's purely a logical grouping.

### Component layers

- `components/ui/` — shadcn/ui primitives (generated, generally not hand-edited). Style: **radix-mira**, icon library: **HugeIcons** (`@hugeicons/react`).
- `components/common/` — app-wide shared components (`ThemeProvider`, `Logo`).
- `components/custom/landing/` — landing page sections (`HeroSection`, `FeaturesSection`, `PricingSection`, etc.), each a standalone file imported by `app/page.tsx`.
- `components/icons.tsx` — custom SVG icons (e.g. `GoogleLogo`).

### Styling

- **Tailwind v4** — CSS-first config; all design tokens live in `app/globals.css` (`@theme inline` block). There is no `tailwind.config.js`.
- Colors use **oklch** space with full light/dark variable sets.
- Base radius is `1.4rem` (`--radius`); shadcn variants derive from it (`--radius-sm/md/lg/xl`).
- `cn()` in `lib/utils.ts` combines `clsx` + `tailwind-merge`.

### Key dependencies

| Package | Purpose |
|---------|---------|
| `next-themes` | System-aware dark/light mode via `ThemeProvider` |
| `motion` (Framer Motion v12) | Animations in landing sections |
| `shadcn` + `radix-ui` | UI primitives |
| `@hugeicons/react` | Default icon set (configured in `components.json`) |
| `lucide-react` | Secondary icons used in custom components |
| `sonner` | Toast notifications |
| `recharts` | Charts (for future dashboard analytics) |

### Path aliases

`@/` resolves to the project root (configured in `tsconfig.json`). All imports use `@/components/...`, `@/lib/...`, `@/hooks/...`.

### Adding shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

Components land in `components/ui/`. Do not manually edit generated files there unless fixing a specific bug.
