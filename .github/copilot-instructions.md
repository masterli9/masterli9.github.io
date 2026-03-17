# Copilot instructions — Portfolio repo

Purpose: Short guide for GitHub Copilot sessions to find the build/test/lint commands, the app entry points, and repository-specific conventions.

## Quick commands
- Start dev server (HMR):
  - npm run dev
- Build (types first, then Vite production build):
  - npm run build  # runs `tsc -b && vite build`
  - TypeScript-only build / check: `npx tsc -b`
- Lint:
  - npm run lint   # runs `eslint .`
  - Lint a single file: `npx eslint path/to/file.tsx`
- Preview production build:
  - npm run preview  # `vite preview`

**Tests**: No test runner or `test` script detected in package.json.

## High-level architecture
- Frameworks: React (v19) + TypeScript, built with Vite.
- Entry point: `src/main.tsx` mounts `<App />` into `#root` (see `index.html`).
- App: `src/App.tsx` composes top-level pages (e.g., `src/pages/home.tsx`).
- Styling: Tailwind CSS (via `@tailwindcss/vite`) + global styles in `src/index.css`. Tailwind config extends colors/fonts in `tailwind.config.js`.
- Plugins: `vite.config.ts` enables `@vitejs/plugin-react` and `babel-plugin-react-compiler` (React Compiler enabled) and tailwind integration.
- TypeScript build: `tsconfig.json` references `tsconfig.app.json` and `tsconfig.node.json`; `npm run build` runs `tsc -b` for project-reference builds before `vite build`.
- Linting: ESLint configured in `eslint.config.js` (typescript-eslint + react-hooks + react-refresh). By default it is not type-aware; the README includes notes to enable type-checked linting.
- Static assets: `public/` (served by Vite)

## Key conventions and repository-specific patterns
- Dark mode is class-based: `tailwind.config.js` uses `darkMode: 'class'`. Toggle by adding `dark` on a root element.
- Color tokens: theme extends tokens like `background.light`, `background.dark`, `text.light` and matching CSS vars are defined in `src/index.css`.
- Glow utilities: custom classes `.glow-magenta-light`, `.glow-gold-dark`, etc., live in `src/index.css`.
- Fonts: system-first `sans` stack configured in `tailwind.config.js` and index.css.
- Strict TypeScript settings: `strict`, `noUnusedLocals`, `noUnusedParameters` are enabled — prefer removing unused symbols rather than disabling rules.
- ESLint: current config extends `typescript-eslint.configs.recommended`. To enable type-aware rules, switch to `tseslint.configs.recommendedTypeChecked` (see README snippet in `eslint.config.js`).
- React Compiler: `babel-plugin-react-compiler` is active in Vite plugin settings — be aware it may change transform semantics compared to default Babel/SWC.

## Files to inspect for context
- package.json (scripts & deps)
- vite.config.ts (plugins)
- tsconfig.* (project references & compiler options)
- eslint.config.js (linting)
- tailwind.config.js (theme tokens)
- src/main.tsx, src/App.tsx, src/pages/, src/index.css

## AI assistant configs
- No CLAUDE.md, AGENTS.md, .cursorrules, .windsurfrules, AIDER_CONVENTIONS.md, or similar assistant config files found.

---

(If updating this file, keep entries concise and update commands if scripts change.)
