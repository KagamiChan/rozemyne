# AGENTS.md

## Project overview

Rozemyne is a personal blog built with React 19, React Router 7, Vite, and
Tailwind CSS 4. It renders on the server and deploys to Cloudflare Workers.
Blog posts and the about page are authored as Markdown and compiled by Vite.

## Repository layout

- `app/root.tsx`: document shell, shared navigation, footer, metadata, and the
  root error boundary.
- `app/routes.ts`: filesystem route configuration.
- `app/routes/`: React Router route modules.
- `app/components/`: shared React components.
- `app/contents/`: Markdown pages and posts.
- `app/assets/`: fonts and SVG assets. SVG files can be imported as React
  components with the `?react` suffix.
- `app/app.css`: Tailwind entry point, theme tokens, and global styles.
- `workers/app.ts`: Cloudflare Worker request handler and load-context wiring.
- `tests/`: Playwright end-to-end tests.
- `tests-production/`: Playwright checks that require a production Worker build.
- `public/`: static assets copied directly to the built client.

Do not edit generated or transient directories such as `.react-router/`,
`build/`, `.wrangler/`, `node_modules/`, `playwright-report/`, or
`test-results/`.

## Toolchain and setup

- Use Node.js 24, as specified by `.node-version`.
- Use the pnpm version declared in `package.json`.
- Prefer Corepack so local commands match CI.

```sh
corepack enable
corepack pnpm install
```

Use pnpm rather than npm or Yarn, and commit `pnpm-lock.yaml` when dependency
changes update it.

## Common commands

```sh
corepack pnpm dev
corepack pnpm lint
corepack pnpm fmt
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test:e2e
corepack pnpm test:e2e:production
corepack pnpm start
```

- The development server runs at `http://localhost:5173`.
- `start` serves the built application through Wrangler for Cloudflare
  Worker-runtime checks.
- `typecheck` generates React Router types before running the TypeScript
  project build.
- Playwright starts or reuses the development server automatically.
- The production Playwright suite builds the application and starts Wrangler.
- For a focused browser test, pass Playwright arguments through the script,
  for example:

```sh
corepack pnpm test:e2e -- tests/home.spec.ts --project=chromium
```

Before considering a code change complete, run the narrowest relevant checks.
For application changes, the expected baseline is lint, typecheck, and build.
Run the relevant Playwright tests for user-visible behavior.

## TypeScript and React conventions

- Use ESM imports and `import type` for type-only imports.
- Prefer the `~/*` alias for imports from `app/`.
- Follow the existing import grouping and ordering; `vp lint` (Oxlint)
  rejects unused imports, and Oxfmt enforces import ordering.
- Use generated route types from each route's `./+types/...` module for loader,
  metadata, component, and error-boundary signatures.
- Keep data loading in route `loader` functions and return serializable data.
- Preserve server rendering. Do not introduce browser-only APIs into server
  execution paths without an explicit client-side guard.
- Reuse `cn` from `app/utils.ts` when combining conditional or conflicting
  Tailwind classes.
- Reuse existing shared components such as `Block` and `NavLink` where their
  behavior fits instead of duplicating their styling.

## Formatting and styling

Formatting and linting run through the Vite+ toolchain (`vp lint`, `vp fmt`),
configured in the `lint` and `fmt` blocks of `vite.config.ts`. Oxfmt is
configured for:

- no semicolons
- single quotes
- trailing commas
- LF line endings
- import sorting
- Tailwind class sorting, including classes passed to `cn` and `clsx`

Markdown posts in `app/contents/` are excluded from formatting; do not
reformat historical post content.

Use Tailwind utility classes for component styling. Keep global rules and
design tokens in `app/app.css`. Reuse the existing `rozemyne` color scale and
responsive layout patterns before adding new tokens or one-off CSS.

The site supports light and dark color schemes and uses Chinese-language
metadata and UI copy. Preserve the established language and visual behavior
unless a change explicitly calls for something different.

## Routes and metadata

Routes are discovered from `app/routes/` through
`@react-router/fs-routes`. Follow the existing filename conventions:

- `_index.tsx` for an index route
- `about.tsx` for a static route
- `post.$name.tsx` for a dynamic `name` parameter

Add meaningful `meta` output for new public pages. Keep the site title,
description, and keywords consistent with existing routes unless the feature
requires route-specific values.

## Markdown content

Posts live in `app/contents/posts/` and are imported eagerly by the index
route. A post filename becomes its URL slug, so renaming a file changes its
public URL.

Post filenames must use `YYYY-MM-DD-<slug>.md`, based on the original
publication date. Keep the slug descriptive and free of personal identifiers.

Post frontmatter must provide values compatible with `MarkdownDocument`:

```yaml
---
title: Post title
date: 2026-01-01T00:00:00.000Z
revised: 2026-02-01T00:00:00.000Z
draft: false
---
```

- `date` is the original publication time and must not be replaced when a post
  is migrated, redacted, rewritten, or republished.
- Add optional `revised` when the post changes after publication. Use the
  latest edit time, not a replacement publication time.
- Use ISO 8601 timestamps that JavaScript can parse reliably.
- Draft posts remain viewable in development for authoring. In production they
  must be omitted from the index and return 404 when requested directly.
- Markdown is rendered to HTML at build time with syntax highlighting.
- Treat Markdown content as trusted repository content. If user-authored
  content is introduced, sanitize it before passing it to
  `dangerouslySetInnerHTML`.
- The about page currently requires only a `title`, even though it shares the
  Markdown module type at the import boundary.

## Content privacy

- Read and apply `CONTENT_PRIVACY.md` before adding, migrating, or publishing
  content.
- Public publication is binary: **Publish** or **Reject**. Sensitivity bands
  S0-S4 are private review metadata, not public audience levels.
- Apply non-exclusive facet and subject tags. Hard prohibitions, private
  third-party protection, credible AI inference, and marginal corpus risk take
  precedence over residual judgment.
- Content review is default deny. Do not copy a legacy post into this
  repository until its final text, metadata, links, and assets pass the full
  decision pipeline.
- Redaction must be minimal and localized. Preserve the original argument,
  structure, voice, style, chronology, and emphasis. Use `[redacted]` for a
  small removed span when an explicit omission is clearer than deletion.
- Limit redaction to three spans in one section and at most 10% or 200
  characters of the body, whichever is smaller. Do not remove prose
  paragraphs.
- Never replace a post with newly authored prose. Reject it when privacy
  requires paragraph-level rewriting, changes across multiple sections, or
  edits that change what the author said or how the author sounded.
- Treat historical and obsolete personal details as sensitive, and evaluate
  combinations of otherwise ordinary facts for social-engineering risk.
- Anonymize non-public third parties. Retain deliberately public facts only
  when they are necessary and minimally specific.
- Preserve original voice and accept stylometric linkage as a documented
  residual risk; never rewrite style for anonymity.
- Keep the review ledger private and outside the repository. Never record
  sensitive excerpts in it.
- `draft: true` and application-level 404 behavior are not privacy boundaries;
  repository contents and Git history may still be public.

## Cloudflare and build behavior

- `workers/app.ts` is the SSR entry point for Cloudflare Workers. In dev and
  build it runs through `@cloudflare/vite-plugin`; `wrangler.toml` points
  `main` at this source file.
- Loader/action context is provided through the React Router context API
  (`cloudflareContext` in `app/cloudflare-context.ts`, set in
  `workers/app.ts`).
- Keep Cloudflare bindings typed through `CloudflareEnvironment`.
- The Vite+ toolchain aliases `vite` to `@voidzero-dev/vite-plus-core` via
  the `overrides` in `pnpm-workspace.yaml`; keep that alias when upgrading.
- `vite.config.ts` embeds the current Git commit hash and build timestamp.
  Build commands therefore require the repository to have a resolvable
  `HEAD`.
- Update `wrangler.toml` and generated Worker types together when adding or
  changing bindings.
- Do not deploy or modify production routes unless explicitly requested.

## Testing guidelines

- Add or update Playwright coverage for changes to navigation, rendering, or
  other user-visible behavior.
- Prefer role-based and accessible-name locators over CSS selectors.
- Test across only the browsers needed while iterating; the configured CI suite
  covers Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari.
- Use the production suite for behavior that differs under
  `import.meta.env.PROD`, such as draft-post access.

## Change discipline

- Preserve non-ASCII filenames and text; they are intentional.
- Never commit credentials, Wrangler secrets, generated reports, or local
  environment artifacts.
