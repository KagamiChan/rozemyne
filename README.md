# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
npm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Webfonts

LXGW WenKai and Maple Mono are served as plain static assets so they can also be
loaded from a cross-origin iframe, such as Giscus comments:

- `/fonts.css` — standalone stylesheet that `@import`s the split LXGW WenKai CSS
  and declares the Maple Mono face.
- `/fonts/lxgw-wenkai/result.css` — `unicode-range` `@font-face` rules.
- `/fonts/lxgw-wenkai/*.woff2` — full-glyph subsets of the source TTF.
- `/fonts/maple-mono-latin-400-normal.woff2` — Maple Mono (400 normal, latin).

All of these are served with `Access-Control-Allow-Origin: *` (`public/_headers`
in production, a scoped dev middleware locally). Fonts are split with
`cn-font-split` from the unchanged `app/assets/fonts/LXGWWenKai-Regular.ttf`;
generated files live in `node_modules/.cache/rozemyne-fonts/<key>` (keyed on the
source contents, splitter version, and options) and are copied into the client
build with `vite-plugin-static-copy`. Nothing generated is committed.

`public/giscus.css` is the custom Giscus theme. It `@import`s `/fonts.css` and
uses the same families (`LXGW WenKai` for body, `Maple Mono` for code) at the
site's 20px base, and restyles the widget to match the article rather than
GitHub: the same column and transparent background, flat borderless comments
with modest separators, a compact single-row header (comment count left,
reactions right), plain input/preview tabs with an active underline, a simple
outlined textarea, and compact outlined login/submit buttons. Colors are the
Rozemyne palette — blue accents (`#233b6c` / `#9eccf2`) over Tailwind gray
neutrals — with the official semantic and syntax colors kept; the variables are
inlined per Giscus's
[custom theme guide](https://github.com/giscus/giscus/blob/main/CONTRIBUTING.md).
See the [Comments](#comments) section for the widget itself.

Giscus loads the theme inside its iframe with `crossorigin="anonymous"`, so
both `/giscus.css` and the fonts must be CORS-enabled, as above. The iframe is
a separate document: it does not inherit the host page's styles, so the theme
must reference the fonts itself. Browser font caching across origins is not
guaranteed.

## Comments

Published posts render [Giscus](https://giscus.app) below the article prose.
It never appears on the home page, the about page, or draft posts.

The widget is configured in `app/components/giscus.tsx` for the public
`KagamiChan/rozemyne` repository and its `Announcements` category, with
`mapping: pathname` so `localhost`, `www.kagami.moe`, and `kagami.moe` all share
the same discussion. The theme URL is resolved from the current origin
(`/giscus.css`), and comments are lazy-loaded with reactions on, metadata
emission off, and the input box on top. Comments require the
[Giscus app](https://github.com/apps/giscus) to have access to the repository's
Discussions.

---

Built with ❤️ using React Router.
