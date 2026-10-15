import { createServer } from 'node:http'

import { expect, test, type Page } from '@playwright/test'

const APP_ORIGIN = 'http://127.0.0.1:8787'
const MAPLE_WOFF2 = '/fonts/maple-mono-latin-400-normal.woff2'

/**
 * Codepoints that exist in the source LXGW WenKai TTF but never occur in the
 * site text (app/contents). They prove the split ships full font coverage
 * instead of scanning the site corpus, so Giscus comments render too.
 */
const RARE_GLYPHS = [
  { char: '龘', codePoint: 0x9f98 },
  { char: '𠮷', codePoint: 0x20bb7 },
]

function rangeCovers(range: string, codePoint: number) {
  return range.split(',').some((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-')
    const low = Number.parseInt(start, 16)
    const high = end ? Number.parseInt(end, 16) : low
    return Number.isNaN(low) ? false : codePoint >= low && codePoint <= high
  })
}

function subsetUrlFor(css: string, codePoint: number) {
  for (const [, body] of css.matchAll(/@font-face\{([^}]*)\}/g)) {
    const range = body.match(/unicode-range:([^;]+)/)?.[1]
    const file = body.match(/url\("\.\/([^"]+\.woff2)"\)/)?.[1]
    if (range && file && rangeCovers(range, codePoint)) {
      return `/fonts/lxgw-wenkai/${file}`
    }
  }
  throw new Error(`no subset covers U+${codePoint.toString(16)}`)
}

// A real loopback server on its own port is a genuine separate origin; a
// route.fulfill document would be blocked from reaching loopback by Chromium.
async function serveProbe<T>(page: Page, html: string, run: () => Promise<T>) {
  const server = createServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(html)
  })
  const origin = await new Promise<string>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (address === null || typeof address === 'string') {
        reject(new Error('expected a TCP address'))
        return
      }
      resolve(`http://${address.address}:${address.port}`)
    })
  })
  try {
    await page.goto(origin)
    return await run()
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    )
  }
}

test('links the standalone stylesheet in SSR', async ({ request }) => {
  const response = await request.get('/')
  expect(response.status()).toBe(200)

  const html = await response.text()
  expect(html.match(/href="\/fonts\.css"/g) ?? []).toHaveLength(1)
  expect(html).toMatch(/<link[^>]+rel="stylesheet"[^>]+href="\/fonts\.css"/)
})

test('serves the standalone stylesheet with a CSS MIME type and CORS', async ({ request }) => {
  const response = await request.get('/fonts.css')

  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('text/css')
  expect(response.headers()['access-control-allow-origin']).toBe('*')
})

test('serves reachable woff2 subsets covering glyphs absent from the corpus', async ({
  request,
}) => {
  const stylesheet = await request.get('/fonts/lxgw-wenkai/result.css')

  expect(stylesheet.status()).toBe(200)
  expect(stylesheet.headers()['content-type']).toContain('text/css')
  expect(stylesheet.headers()['access-control-allow-origin']).toBe('*')

  const css = await stylesheet.text()
  for (const { char, codePoint } of RARE_GLYPHS) {
    const subset = await request.get(subsetUrlFor(css, codePoint))

    expect(subset.status(), `${char} subset`).toBe(200)
    expect(subset.headers()['content-type']).toContain('font/woff2')
    expect(subset.headers()['access-control-allow-origin']).toBe('*')
    expect((await subset.body()).byteLength, `${char} subset bytes`).toBeGreaterThan(100)
  }

  const maple = await request.get(MAPLE_WOFF2)
  expect(maple.status()).toBe(200)
  expect(maple.headers()['content-type']).toContain('font/woff2')
  expect(maple.headers()['access-control-allow-origin']).toBe('*')
})

test('loads the families over the real cross-origin /fonts.css chain', async ({ page }) => {
  type Seen = { status: number; cors: string | undefined; type: string | undefined }
  const responses = new Map<string, Seen>()
  page.on('response', (response) => {
    const url = response.url()
    if (!url.startsWith(`${APP_ORIGIN}/fonts`)) return
    responses.set(new URL(url).pathname, {
      status: response.status(),
      cors: response.headers()['access-control-allow-origin'],
      type: response.headers()['content-type'],
    })
  })

  const probe = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" crossorigin="anonymous" href="${APP_ORIGIN}/fonts.css">
</head><body>probe</body></html>`

  await serveProbe(page, probe, async () => {
    // `goto` waited for the document load, including the imported stylesheet.
    const loaded = await page.evaluate(async () => {
      const lxgw = await document.fonts.load('400 16px "LXGW WenKai"', '龘𠮷')
      const maple = await document.fonts.load('400 16px "Maple Mono"', 'Latin 123')
      return {
        lxgw: lxgw.map((face) => face.status),
        maple: maple.map((face) => face.status),
        lxgwCovers: document.fonts.check('400 16px "LXGW WenKai"', '龘𠮷'),
        mapleCovers: document.fonts.check('400 16px "Maple Mono"', 'Latin 123'),
      }
    })

    expect(loaded.lxgw.length, 'LXGW faces loaded via @import').toBeGreaterThan(0)
    expect(loaded.lxgw.every((status) => status === 'loaded')).toBe(true)
    expect(loaded.lxgwCovers).toBe(true)
    expect(loaded.maple.length, 'Maple faces loaded').toBeGreaterThan(0)
    expect(loaded.maple.every((status) => status === 'loaded')).toBe(true)
    expect(loaded.mapleCovers).toBe(true)

    // Real font/woff2 responses prove the stylesheet URL + CORS chain resolved.
    const expectAsset = (path: string) => {
      const seen = responses.get(path)
      expect(seen, `response for ${path}`).toBeDefined()
      expect(seen!.status, path).toBe(200)
      expect(seen!.cors, path).toBe('*')
    }

    expectAsset('/fonts.css')
    expectAsset('/fonts/lxgw-wenkai/result.css')

    const subsetPaths = [...responses.keys()].filter((path) => path.endsWith('.woff2'))
    expect(subsetPaths.some((path) => path.startsWith('/fonts/lxgw-wenkai/'))).toBe(true)
    expect(subsetPaths).toContain('/fonts/maple-mono-latin-400-normal.woff2')
    for (const path of subsetPaths) {
      const seen = responses.get(path)!
      expect(seen.status, path).toBe(200)
      expect(seen.cors, path).toBe('*')
      expect(seen.type, path).toContain('font/woff2')
    }
  })
})

test('restyles the Giscus theme over the real cross-origin chain', async ({ page }) => {
  const fetched = new Set<string>()
  page.on('response', (response) => {
    const url = response.url()
    if (url.startsWith(APP_ORIGIN)) fetched.add(new URL(url).pathname)
  })

  // A representative simplified fixture of Giscus's markup and of the parts of
  // its base and `#__next`-scoped utility CSS that this theme overrides (not
  // the live renderer), so the assertions still exercise the real selectors and
  // specificity.
  const probe = `<!doctype html><html><head><meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body { margin: 0; color: var(--color-fg-default); }
  :host, html { --font-family-sans: system-ui; --font-family-monospace: monospace; --font-family-default: var(--font-family-sans); font-family: var(--font-family-default); }
  code, kbd, pre, samp, .gsc-is-fixed-width { font-family: var(--font-family-monospace); }
  .gsc-main { display: flex; flex-direction: column; gap: 2rem; }
  .gsc-reactions { display: flex; flex-direction: column; justify-content: center; }
  .gsc-reactions-count { font-weight: 600; text-align: center; }
  .gsc-comments { display: flex; flex-direction: column; gap: 1.5rem; }
  .gsc-comment { display: flex; font-size: 0.875rem; }
  .gsc-comment > div { background: var(--color-canvas-default); border: 1px solid var(--color-border-default); border-radius: 0.375rem; }
  .gsc-comment-content { padding: 1rem; border-radius: 0.25rem 0.25rem 0 0; }
  .gsc-comment-box { width: 100%; font-size: 0.875rem; }
  .gsc-comment-box:not(.gsc-comment-box-is-reply) { border: 1px solid var(--color-border-default); border-radius: 0.375rem; }
  .gsc-comment-box-tabs { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--color-border-default); background: var(--color-canvas-subtle); }
  .gsc-comment-box-tabs button { border: 1px solid var(--color-border-default); border-bottom: 0; border-radius: 0.25rem 0.25rem 0 0; padding: 0.5rem 1rem; background: var(--color-canvas-default); }
  .form-control { background: var(--color-canvas-default); border: 1px solid var(--color-border-default); }
  .input-contrast { background: var(--color-canvas-inset); }
  .gsc-comment-box-textarea { width: 100%; padding: 0.5rem; border: 1px solid var(--color-border-default); border-radius: 0.25rem; min-height: 100px; border-bottom-style: dashed; }
  .gsc-comment-box-textarea-extras { border: 1px solid var(--color-border-default); border-top: 0; border-radius: 0 0 0.25rem 0.25rem; }
  .gsc-comment-box-bottom { display: flex; align-items: center; margin: 0.5rem; }
  .gsc-comment-box-buttons { display: inline-flex; flex-shrink: 0; margin-left: auto; }
  .btn { padding: 0.25rem 1rem; border: 1px solid var(--color-btn-border); border-radius: 0.375rem; background: var(--color-btn-bg); color: var(--color-btn-text); }
  .gsc-timeline { display: flex; flex-direction: column; gap: 1rem; }
  .gsc-social-reaction-summary-item { border: 1px solid var(--color-border-default); border-radius: 9999px; }
  .gsc-replies { background: var(--color-canvas-inset); border-top: 1px solid var(--color-border-default); border-radius: 0 0 0.375rem 0.375rem; padding-top: 0.5rem; }
  .gsc-reply-box { display: flex; padding: 1rem 1rem 0.5rem; border-top: 1px solid var(--color-border-default); border-radius: 0 0 0.375rem 0.375rem; }
  .gsc-reply { position: relative; padding: 1rem 1rem 0.5rem; }
  #__next .rounded-md { border-radius: 0.375rem; }
  #__next .px-4 { padding-left: 1rem; padding-right: 1rem; }
  #__next .mx-2 { margin-left: 0.5rem; margin-right: 0.5rem; }
  #__next .m-2 { margin: 0.5rem; }
  #__next .mt-2 { margin-top: 0.5rem; }
  #__next .rounded { border-radius: 0.25rem; }
  #__next .border { border: 1px solid var(--color-border-default); }
  #__next .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
  #__next .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
  #__next .ml-1 { margin-left: 0.25rem; }
</style>
<link rel="stylesheet" crossorigin="anonymous" href="${APP_ORIGIN}/giscus.css">
</head><body>
<div id="__next"><main data-theme="custom"><div class="gsc-main">
  <div class="gsc-reactions">
    <h4 class="gsc-reactions-count">0 个表情</h4>
    <div class="flex items-center gap-2"><details class="gsc-reactions-menu"><summary class="link-secondary gsc-reactions-button gsc-social-reaction-summary-item">smile</summary></details></div>
  </div>
  <div class="gsc-comments">
    <div class="gsc-header"><div class="gsc-left-header"><h4 class="gsc-comments-count">1 条评论</h4></div></div>
    <form id="comment-form" class="color-bg-primary color-border-primary gsc-comment-box">
      <div class="color-bg-tertiary color-border-primary gsc-comment-box-tabs">
        <div class="mx-2 mt-2"><button type="button" class="color-text-primary color-bg-canvas px-4 py-2">输入</button><button type="button" class="color-text-secondary ml-1 px-4 py-2">预览</button></div>
        <div class="gsc-comment-box-md-toolbar"><button type="button" class="gsc-toolbar-item">A</button></div>
      </div>
      <div class="gsc-comment-box-main m-2"><div class="gsc-comment-box-write">
        <textarea dir="auto" class="form-control input-contrast gsc-comment-box-textarea"></textarea>
        <div class="form-control input-contrast gsc-comment-box-textarea-extras"><a class="link-secondary gsc-comment-box-markdown-hint" href="#">Markdown</a></div>
      </div></div>
      <div class="gsc-comment-box-bottom"><div class="gsc-comment-box-buttons"><a id="login" class="btn btn-primary inline-flex items-center ml-1 rounded-md border" href="#">使用 GitHub 登录</a></div></div>
    </form>
    <div class="gsc-timeline">
      <div class="gsc-comment"><div class="color-bg-primary color-border-primary">
        <div class="gsc-comment-header"><div class="gsc-comment-author"><span class="link-primary">someone</span><a class="link-secondary" href="#"><time>1 天前</time></a></div></div>
        <div class="markdown gsc-comment-content"><h2>标题</h2><p>你好</p><pre><code>code</code></pre></div>
        <div class="gsc-comment-footer"><div class="gsc-comment-reactions"><button class="gsc-social-reaction-summary-item">up</button></div><div class="gsc-comment-replies-count"><span>2 条回复</span></div></div>
        <div class="gsc-replies"><div class="gsc-reply"><div class="gsc-tl-line"></div><div class="flex"><div class="gsc-reply-author-avatar"></div><div class="w-full ml-2"><div class="gsc-reply-header"><div class="gsc-reply-author"><span class="link-primary">other</span><a class="link-secondary" href="#"><time>1 天前</time></a></div></div><div class="markdown gsc-reply-content"><p>回复</p></div></div></div></div></div>
        <form id="reply-form" class="color-bg-primary color-border-primary gsc-comment-box gsc-comment-box-is-reply">
          <div class="gsc-comment-box-main m-2"><div class="gsc-comment-box-write">
            <textarea dir="auto" class="form-control input-contrast gsc-comment-box-textarea"></textarea>
          </div></div>
          <div class="gsc-comment-box-bottom"><div class="gsc-comment-box-buttons"><button id="reply-cancel" class="btn ml-1 rounded-md border" type="button">取消</button><button id="reply-submit" class="btn btn-primary ml-1 rounded-md border" type="submit">回复</button></div></div>
        </form>
        <div class="color-bg-tertiary gsc-reply-box"><button class="form-control color-text-secondary color-border-primary w-full cursor-text rounded border px-2 py-1 text-left" type="button">写回复</button></div>
      </div></div>
    </div>
  </div>
  <span class="gsc-is-fixed-width" hidden>code</span>
</div>
<form id="authed-form" class="color-bg-primary color-border-primary gsc-comment-box">
  <div class="gsc-comment-box-main m-2"><div class="gsc-comment-box-write">
    <textarea dir="auto" class="form-control input-contrast gsc-comment-box-textarea"></textarea>
  </div></div>
  <div class="gsc-comment-box-bottom">
    <button type="button" class="link-secondary text-sm">退出登录</button>
    <div class="gsc-comment-box-buttons">
      <button id="submit" class="btn btn-primary items-center ml-1 rounded-md border" type="submit">评论</button>
    </div>
  </div>
</form>
</main></div>
</body></html>`

  await serveProbe(page, probe, async () => {
    await page.emulateMedia({ colorScheme: 'light' })

    const snapshot = () =>
      page.evaluate(() => {
        const cs = (selector: string) => getComputedStyle(document.querySelector(selector)!)
        const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect()
        const box = cs('.gsc-comment-box')
        const textarea = cs('textarea.gsc-comment-box-textarea')
        const comment = cs('.gsc-comment > div')
        return {
          fontHtml: getComputedStyle(document.documentElement).fontFamily,
          fontComment: cs('.gsc-comment-content').fontFamily,
          fontCode: cs('.gsc-comment-content code').fontFamily,
          fontFixedWidth: cs('.gsc-is-fixed-width').fontFamily,
          fontTextarea: textarea.fontFamily,
          commentSize: cs('.gsc-comment-content').fontSize,
          commentLineHeight: cs('.gsc-comment-content').lineHeight,
          boxBorder: box.borderTopStyle,
          boxBg: box.backgroundColor,
          tabsBg: cs('.gsc-comment-box-tabs').backgroundColor,
          activeTabShadow: cs('.gsc-comment-box-tabs button.color-text-primary').boxShadow,
          textareaBg: textarea.backgroundColor,
          textareaMinHeight: textarea.minHeight,
          textareaBorderBottom: textarea.borderBottomStyle,
          textareaBorderTop: textarea.borderTopStyle,
          textareaBorderWidth: textarea.borderTopWidth,
          textareaRadius: textarea.borderTopLeftRadius,
          textareaPadding: textarea.paddingTop,
          btnBg: cs('#login').backgroundColor,
          btnColor: cs('#login').color,
          btnBorderColor: cs('#login').borderTopColor,
          btnRadius: cs('#login').borderRadius,
          commentBg: comment.backgroundColor,
          commentRadius: comment.borderRadius,
          canvas: cs('main').getPropertyValue('--color-canvas-default').trim(),
          headerTop: Math.round(rect('.gsc-header').top),
          reactionsTop: Math.round(rect('.gsc-reactions').top),
          headerLeft: Math.round(rect('.gsc-header').left),
          reactionsLeft: Math.round(rect('.gsc-reactions').left),
          composerLeft: Math.round(rect('.gsc-comment-box').left),
          tabsLeft: Math.round(rect('.gsc-comment-box-tabs > div').left),
          textareaLeft: Math.round(rect('textarea.gsc-comment-box-textarea').left),
          btnPaddingLeft: cs('#login').paddingLeft,
          tabWrapMarginLeft: cs('.gsc-comment-box-tabs > div').marginLeft,
          tabPaddingLeft: cs('.gsc-comment-box-tabs button').paddingLeft,
          replyBoxBg: cs('.gsc-reply-box').backgroundColor,
          replyBtnBg: cs('.gsc-reply-box > button').backgroundColor,
          replyBtnBorderTop: cs('.gsc-reply-box > button').borderTopStyle,
          replyBtnRadius: cs('.gsc-reply-box > button').borderRadius,
          commentBodyColor: cs('.gsc-comment-content').color,
          commentHeadingColor: cs('.gsc-comment-content h2').color,
          commentTextareaRight: Math.round(rect('#comment-form textarea').right),
          loginRight: Math.round(rect('#login').right),
          authedTextareaRight: Math.round(rect('#authed-form textarea').right),
          submitRight: Math.round(rect('#submit').right),
          replyTextareaRight: Math.round(rect('#reply-form textarea').right),
          replySubmitRight: Math.round(rect('#reply-submit').right),
          replySubmitLeft: Math.round(rect('#reply-submit').left),
          replySubmitTop: Math.round(rect('#reply-submit').top),
          replyCancelRight: Math.round(rect('#reply-cancel').right),
          replyCancelTop: Math.round(rect('#reply-cancel').top),
        }
      })

    const light = await snapshot()

    // Real cross-origin font chain + base.css behavior.
    expect(light.fontHtml).toContain('LXGW WenKai')
    expect(light.fontComment).toContain('LXGW WenKai')
    expect(light.fontCode).toContain('Maple Mono')
    expect(light.fontFixedWidth).toContain('Maple Mono')
    expect(light.fontTextarea).toContain('LXGW WenKai')
    expect(light.commentSize).toBe('20px')
    expect(light.commentLineHeight).toBe('35px')

    // Transparent surfaces and an unboxed, borderless composer.
    expect(light.canvas).toBe('transparent')
    expect(light.boxBorder).toBe('none')
    expect(light.boxBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.tabsBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.activeTabShadow).toContain('48, 97, 197')
    expect(light.textareaBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.textareaBorderTop).toBe('solid')
    expect(light.textareaBorderWidth).toBe('1px')
    expect(light.textareaRadius).toBe('2px')
    expect(light.textareaPadding).toBe('12px')
    expect(Number.parseFloat(light.textareaMinHeight)).toBeGreaterThanOrEqual(112)
    expect(light.btnBg).toBe('rgb(241, 247, 253)')
    expect(light.btnColor).toBe('rgb(35, 59, 108)')
    expect(light.btnBorderColor).toBe('rgb(35, 59, 108)')
    expect(light.btnRadius).toBe('2px')
    expect(light.commentBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.commentRadius).toBe('0px')

    // Dialog controls align to the article edge (no leftover utility offsets).
    expect(Math.abs(light.tabsLeft - light.composerLeft)).toBeLessThanOrEqual(1)
    expect(Math.abs(light.textareaLeft - light.composerLeft)).toBeLessThanOrEqual(1)
    expect(Math.abs(light.headerLeft - light.composerLeft)).toBeLessThanOrEqual(1)
    // `#__next`-scoped utilities are beaten without `!important`.
    expect(light.tabWrapMarginLeft).toBe('0px')
    expect(light.tabPaddingLeft).toBe('0px')
    expect(light.btnPaddingLeft).toBe('14px')

    // Collapsed reply CTA is an actionable outlined button.
    expect(light.replyBoxBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.replyBtnBg).toBe('rgba(0, 0, 0, 0)')
    expect(light.replyBtnBorderTop).toBe('solid')
    expect(light.replyBtnRadius).toBe('2px')

    // Comment body follows the prose body colour; headings stay distinct.
    expect(light.commentBodyColor).not.toBe(light.commentHeadingColor)

    // Composer controls align to the textarea's outer right edge (login, the
    // authenticated submit, and a nested reply submit).
    expect(Math.abs(light.loginRight - light.commentTextareaRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(light.submitRight - light.authedTextareaRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(light.replySubmitRight - light.replyTextareaRight)).toBeLessThanOrEqual(1)

    // Reply cancel sits immediately left of the primary on the same row, ~.5rem.
    expect(light.replyCancelTop).toBe(light.replySubmitTop)
    expect(light.replySubmitRight).toBeGreaterThan(light.replyCancelRight)
    expect(light.replySubmitLeft - light.replyCancelRight).toBeGreaterThanOrEqual(8)
    expect(light.replySubmitLeft - light.replyCancelRight).toBeLessThanOrEqual(12)

    // Compact header: count and reactions share one row.
    expect(Math.abs(light.headerTop - light.reactionsTop)).toBeLessThanOrEqual(4)
    expect(light.reactionsLeft).toBeGreaterThan(light.headerLeft)

    // Hover follows the site NavLink (blue background, white text).
    await page.hover('#login')
    const lightHover = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('#login')!)
      return { bg: style.backgroundColor, color: style.color }
    })
    expect(lightHover.bg).toBe('rgb(35, 59, 108)')
    expect(lightHover.color).toBe('rgb(255, 255, 255)')

    // The reply CTA keeps a hover affordance.
    await page.hover('.gsc-reply-box > button')
    const replyHover = await page.evaluate(
      () => getComputedStyle(document.querySelector('.gsc-reply-box > button')!).color,
    )
    expect(replyHover).toBe('rgb(35, 59, 108)')

    // Keyboard focus keeps the input edge visible.
    await page.focus('textarea.gsc-comment-box-textarea')
    const focusColor = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('textarea.gsc-comment-box-textarea')!)
          .borderBottomColor,
    )
    expect(focusColor).toBe('rgb(48, 97, 197)')

    // No horizontal overflow at the narrowest supported width.
    await page.setViewportSize({ width: 320, height: 720 })
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }))
    expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1)

    // Narrow width keeps every control right-aligned to its own textarea and
    // the reply cancel/submit pair on one row.
    const narrow = await page.evaluate(() => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect()
      return {
        loginRight: Math.round(rect('#login').right),
        commentTextareaRight: Math.round(rect('#comment-form textarea').right),
        submitRight: Math.round(rect('#submit').right),
        authedTextareaRight: Math.round(rect('#authed-form textarea').right),
        replySubmitRight: Math.round(rect('#reply-submit').right),
        replyTextareaRight: Math.round(rect('#reply-form textarea').right),
        replyCancelTop: Math.round(rect('#reply-cancel').top),
        replySubmitTop: Math.round(rect('#reply-submit').top),
      }
    })
    expect(Math.abs(narrow.loginRight - narrow.commentTextareaRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(narrow.submitRight - narrow.authedTextareaRight)).toBeLessThanOrEqual(1)
    expect(Math.abs(narrow.replySubmitRight - narrow.replyTextareaRight)).toBeLessThanOrEqual(1)
    expect(narrow.replyCancelTop).toBe(narrow.replySubmitTop)

    await page.emulateMedia({ colorScheme: 'dark' })
    const dark = await snapshot()
    expect(dark.canvas).toBe('transparent')
    expect(dark.commentBg).toBe('rgba(0, 0, 0, 0)')
    expect(dark.commentBodyColor).not.toBe(light.commentBodyColor)
    expect(dark.btnBg).toBe('rgb(29, 43, 78)')
    expect(dark.btnBorderColor).toBe('rgb(158, 204, 242)')
    await page.hover('#login')
    const darkHover = await page.evaluate(
      () => getComputedStyle(document.querySelector('#login')!).backgroundColor,
    )
    expect(darkHover).toBe('rgb(158, 204, 242)')
  })

  expect(fetched.has('/giscus.css')).toBe(true)
  expect(fetched.has('/fonts.css')).toBe(true)
})
