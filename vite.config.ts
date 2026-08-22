import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import Shiki from '@shikijs/markdown-it'
import tailwindcss from '@tailwindcss/vite'
import { execa } from 'execa'
import MarkdownIt from 'markdown-it'
import font from 'vite-plugin-font'
import { plugin as markdown, Mode } from 'vite-plugin-markdown'
import svgr from 'vite-plugin-svgr'
import { defineConfig } from 'vite-plus'

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
    font.vite({
      scanFiles: ['app/**/*.{ts,tsx,js,jsx,md}'],
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
