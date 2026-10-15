import { createRequire } from 'node:module'
import path from 'node:path'

import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import Shiki from '@shikijs/markdown-it'
import tailwindcss from '@tailwindcss/vite'
import { execa } from 'execa'
import MarkdownIt from 'markdown-it'
import type { Plugin } from 'vite'
import { plugin as markdown, Mode } from 'vite-plugin-markdown'
import { viteStaticCopy, type Target } from 'vite-plugin-static-copy'
import svgr from 'vite-plugin-svgr'
import { defineConfig, lazyPlugins } from 'vite-plus'

const require = createRequire(import.meta.url)

const md = MarkdownIt()

md.use(
  await Shiki({
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
  }),
)

const commitHash = await execa('git', ['rev-parse', 'HEAD'])
const now = new Date().toISOString()

// CORS is scoped to the webfont endpoints and the Giscus theme only;
// production uses public/_headers.
function fontsCors(): Plugin {
  return {
    name: 'rozemyne:fonts-cors',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? '').split('?')[0]
        if (
          pathname === '/giscus.css' ||
          pathname === '/fonts.css' ||
          pathname.startsWith('/fonts/')
        ) {
          res.setHeader('Access-Control-Allow-Origin', '*')
        }
        next()
      })
    },
  }
}

// Linux filesystems cap file names at 255 bytes; post slugs can be long
// non-ASCII strings, so truncate the readable part and rely on the hash.
const maxChunkNameBytes = 48

function shortChunkName(name: string | undefined | null) {
  if (!name) return 'chunk'
  let truncated = ''
  let bytes = 0
  for (const char of name) {
    const size = (char.codePointAt(0) ?? 0) > 0x7f ? 3 : 1
    if (bytes + size > maxChunkNameBytes) break
    bytes += size
    truncated += char
  }
  return truncated || 'chunk'
}

export default defineConfig({
  // Prebundle @giscus/react upfront: discovering it late re-optimizes and
  // rewrites the shared React runtime exports while earlier module responses
  // are still cached, breaking the dev client.
  optimizeDeps: {
    include: ['@giscus/react'],
  },
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) => `assets/${shortChunkName(chunk.name)}-[hash].js`,
      },
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    reactRouter(),
    tailwindcss(),
    markdown({
      mode: [Mode.TOC, Mode.HTML],
      markdownIt: md,
    }),
    svgr(),
    // Full-glyph LXGW WenKai split and the static-copy targets are prepared only
    // for dev/build. `lazyPlugins` skips this factory while Vite+ resolves the
    // config just to read the lint/fmt blocks, and the dynamic imports keep
    // cn-font-split's native FFI out of `vp lint`/`vp fmt` entirely.
    lazyPlugins(async () => {
      const { prepareFont } = await import('./scripts/fonts')
      const fonts = await prepareFont(process.cwd())
      const fontCacheDir = path.relative(process.cwd(), fonts.directory).replace(/\\/g, '/')
      const mapleMonoWoff2 = path
        .relative(
          process.cwd(),
          require.resolve('@fontsource/maple-mono/files/maple-mono-latin-400-normal.woff2'),
        )
        .replace(/\\/g, '/')

      console.log(
        `rozemyne fonts | ${fonts.cached ? 'cached' : 'generated'} ${fonts.key} | ` +
          `${fonts.subsets.length} woff2 | ${(fonts.bytes / 1024 / 1024).toFixed(2)} MiB`,
      )

      const fontCopyTargets: Target[] = [
        { src: `${fontCacheDir}/*.woff2`, dest: 'fonts/lxgw-wenkai', rename: { stripBase: true } },
        {
          src: `${fontCacheDir}/result.css`,
          dest: 'fonts/lxgw-wenkai',
          rename: { stripBase: true },
        },
        { src: mapleMonoWoff2, dest: 'fonts', rename: { stripBase: true } },
      ]

      return [...viteStaticCopy({ targets: fontCopyTargets }), fontsCors()]
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  lint: {
    ignorePatterns: ['build/**', '.react-router/**', 'playwright-report/**', 'test-results/**'],
  },
  fmt: {
    ignorePatterns: ['app/contents/**'],
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    endOfLine: 'lf',
    sortImports: {},
    sortTailwindcss: {
      stylesheet: './app/app.css',
      functions: ['cn', 'clsx'],
    },
  },
  define: {
    __BUILD_HASH__: JSON.stringify(commitHash.stdout),
    __BUILD_TIME__: JSON.stringify(now),
  },
})
