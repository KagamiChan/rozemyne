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
import { viteStaticCopy } from '@skagami/vite-plugin-static-copy'

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
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ibm/plex-sans-sc/fonts/split/woff2/hinted/*.*',
          dest: 'fonts/ibm/plex-sans-sc',
        },
        {
          src: 'node_modules/@fontsource/ibm-plex-mono/**/*.css',
          dest: 'fonts/ibm/plex-mono',
        },
        {
          src: 'node_modules/@fontsource/ibm-plex-mono/**/*.woff2',
          dest: 'fonts/ibm/plex-mono/files',
        },
        {
          src: 'node_modules/@fontsource/ibm-plex-mono/**/*.woff',
          dest: 'fonts/ibm/plex-mono/files',
        },
      ],
    }),
  ],
  define: {
    __BUILD_HASH__: JSON.stringify(commitHash.stdout),
    __BUILD_TIME__: JSON.stringify(now),
  },
}))
