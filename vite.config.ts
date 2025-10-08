import { reactRouter } from '@react-router/dev/vite'
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { plugin as markdown, Mode } from 'vite-plugin-markdown'
import Shiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'
import svgr from 'vite-plugin-svgr'
import { execa } from 'execa'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import font from 'vite-plugin-font'

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

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: './workers/app.ts',
        }
      : undefined,
  },
  plugins: [
    cloudflareDevProxy({
      getLoadContext({ context }) {
        return { cloudflare: context.cloudflare }
      },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    markdown({
      mode: [Mode.TOC, Mode.HTML],
      markdownIt: md,
    }),
    svgr(),
    font.vite({
      scanFiles: ['app/**/*.{ts,tsx,js,jsx,md}'],
    }),
  ],
  define: {
    __BUILD_HASH__: JSON.stringify(commitHash.stdout),
    __BUILD_TIME__: JSON.stringify(now),
  },
}))
