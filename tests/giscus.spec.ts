import { expect, test, type Page } from '@playwright/test'

const GISCUS_STUB = '<!doctype html><meta charset="utf-8"><title>giscus stub</title>'
const FIRST_POST = '/post/2007-02-15-indivicible-youth'
const SECOND_POST = '/post/2007-02-18-spring-festival-evening'

// Keep giscus.app off the network; we only exercise the widget wiring.
async function mockGiscus(page: Page) {
  await page.route('https://giscus.app/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: GISCUS_STUB }),
  )
}

async function iframeParams(page: Page) {
  const src = await page.locator('giscus-widget iframe').first().getAttribute('src')
  return new URL(src!).searchParams
}

test('renders a single configured Giscus widget on a published post', async ({ page }) => {
  await mockGiscus(page)
  await page.goto(FIRST_POST)

  const widget = page.locator('giscus-widget')
  await expect(widget).toHaveCount(1)
  await expect(widget).toHaveAttribute('repo', 'KagamiChan/rozemyne')
  await expect(widget).toHaveAttribute('repoid', 'R_kgDON53mZA')
  await expect(widget).toHaveAttribute('category', 'Announcements')
  await expect(widget).toHaveAttribute('categoryid', 'DIC_kwDON53mZM4CnPuI')
  await expect(widget).toHaveAttribute('mapping', 'pathname')
  await expect(widget).toHaveAttribute('strict', '1')
  await expect(widget).toHaveAttribute('reactionsenabled', '1')
  await expect(widget).toHaveAttribute('emitmetadata', '0')
  await expect(widget).toHaveAttribute('inputposition', 'top')
  await expect(widget).toHaveAttribute('loading', 'lazy')
  await expect(widget).toHaveAttribute('lang', 'zh-CN')
  await expect(widget).toHaveAttribute('theme', /\/giscus\.css$/)

  const params = await iframeParams(page)
  expect(params.get('term')).toBe(new URL(page.url()).pathname.slice(1))
  expect(params.get('theme')).toBe(new URL('/giscus.css', page.url()).href)
  expect(params.get('backLink')).toBe(`https://kagami.moe${FIRST_POST}`)
})

test('remounts Giscus across SPA navigation between posts', async ({ page }) => {
  await mockGiscus(page)
  await page.goto('/')

  await page.locator(`a[href="${FIRST_POST}"]`).first().click()
  await expect(page.locator('giscus-widget')).toHaveCount(1)
  const firstTerm = (await iframeParams(page)).get('term')
  expect(firstTerm).toBe(FIRST_POST.slice(1))

  await page.getByRole('link', { name: '回首页' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('giscus-widget')).toHaveCount(0)

  await page.locator(`a[href="${SECOND_POST}"]`).first().click()
  await expect(page.locator('giscus-widget')).toHaveCount(1)
  const secondTerm = (await iframeParams(page)).get('term')
  expect(secondTerm).toBe(SECOND_POST.slice(1))
  expect(secondTerm).not.toBe(firstTerm)

  // History is / -> first -> / -> second, so going back two entries lands on
  // the first post through the same route instance. Without a pathname key the
  // widget would keep the second post's iframe.
  await page.evaluate(() => window.history.go(-2))
  await expect(page).toHaveURL(FIRST_POST)
  await expect(page.locator('giscus-widget')).toHaveCount(1)
  await expect(page.locator('giscus-widget iframe')).toHaveCount(1)
  await expect.poll(async () => (await iframeParams(page)).get('term')).toBe(FIRST_POST.slice(1))
  const replayParams = await iframeParams(page)
  expect(replayParams.get('term')).toBe(FIRST_POST.slice(1))
  expect(replayParams.get('backLink')).toBe(`https://kagami.moe${FIRST_POST}`)
})

test('shows no widget on the home and about pages', async ({ page }) => {
  await mockGiscus(page)
  await page.goto('/')
  await expect(page.locator('giscus-widget')).toHaveCount(0)

  await page.goto('/about')
  await expect(page.locator('giscus-widget')).toHaveCount(0)
})

test('shows no widget on a draft post in dev', async ({ page }) => {
  await mockGiscus(page)
  await page.goto('/post/code-highlighting')

  await expect(page.locator('article h1')).toBeVisible()
  await expect(page.locator('giscus-widget')).toHaveCount(0)
})
