import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { fontSplit } from 'cn-font-split'

const require = createRequire(import.meta.url)

/** Source font kept in the repository; never modified or regenerated. */
export const FONT_SOURCE = 'app/assets/fonts/LXGWWenKai-Regular.ttf'

/** Cache lives under node_modules so generated binaries are never committed. */
const CACHE_ROOT = 'node_modules/.cache/rozemyne-fonts'

/**
 * Full-glyph split settings. These deliberately avoid scanning the site corpus
 * so the exported stylesheet also covers glyphs Giscus comments can use.
 */
const splitOptions = {
  css: {
    fontFamily: 'LXGW WenKai',
    fontWeight: '400',
    fontStyle: 'normal',
    fontDisplay: 'swap',
  },
  languageAreas: true,
  autoSubset: true,
  fontFeature: true,
  reduceMins: true,
  subsetRemainChars: true,
  silent: true,
} as const

const READY_MARKER = '.ready'

export interface PreparedFont {
  /** Cache key derived from source contents, splitter version, and options. */
  key: string
  /** Absolute directory holding result.css and the woff2 subsets. */
  directory: string
  /** Absolute paths to the generated woff2 subsets, sorted. */
  subsets: string[]
  /** Total size of the generated woff2 subsets, in bytes. */
  bytes: number
  /** True when the assets were reused from cache instead of regenerated. */
  cached: boolean
}

function collect(directory: string, key: string, cached: boolean): PreparedFont {
  const subsets = fs
    .readdirSync(directory)
    .filter((name) => name.endsWith('.woff2'))
    .sort()
    .map((name) => path.join(directory, name))
  const bytes = subsets.reduce((total, file) => total + fs.statSync(file).size, 0)
  return { key, directory, subsets, bytes, cached }
}

/**
 * Prepares the split LXGW WenKai webfonts, reusing the cached output whenever
 * the source contents, splitter version, native engine version, and options are
 * unchanged.
 */
export async function prepareFont(root: string): Promise<PreparedFont> {
  const sourcePath = path.resolve(root, FONT_SOURCE)
  const source = await fs.promises.readFile(sourcePath)
  const splitterPackagePath = require.resolve('cn-font-split/package.json')
  const splitterVersion = (require('cn-font-split/package.json') as { version: string }).version
  // The native binary (dist/version, e.g. "x86_64-unknown-linux-gnu@7.6.8") does
  // the actual subsetting, so it belongs in the cache identity. The installed
  // package always writes it, so read it directly and fail fast if it's absent.
  const engineVersion = fs
    .readFileSync(path.join(path.dirname(splitterPackagePath), 'dist', 'version'), 'utf8')
    .trim()

  const key = createHash('sha256')
    .update(`cn-font-split@${splitterVersion} (${engineVersion})`)
    .update(JSON.stringify(splitOptions))
    .update(source)
    .digest('hex')
    .slice(0, 24)

  const directory = path.resolve(root, CACHE_ROOT, key)
  const ready = path.join(directory, READY_MARKER)

  if (fs.existsSync(ready) && fs.existsSync(path.join(directory, 'result.css'))) {
    return collect(directory, key, true)
  }

  await fs.promises.rm(directory, { recursive: true, force: true })
  await fs.promises.mkdir(directory, { recursive: true })
  await fontSplit({ ...splitOptions, input: sourcePath, outDir: directory })
  await fs.promises.writeFile(ready, key)

  return collect(directory, key, false)
}
