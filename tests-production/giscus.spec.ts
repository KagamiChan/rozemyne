import { expect, test, type Page } from '@playwright/test'

const GISCUS_STUB = '<!doctype html><meta charset="utf-8"><title>giscus stub</title>'
const PUBLISHED_POST = '/post/2007-02-15-indivicible-youth'
const DRAFT_POST = '/post/code-highlighting'

async function mockGiscus(page: Page) {
  await page.route('https://giscus.app/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: GISCUS_STUB }),
  )
}

test('published post mounts the configured widget with a canonical backlink', async ({ page }) => {
  await mockGiscus(page)
  await page.goto(PUBLISHED_POST)

  const widget = page.locator('giscus-widget')
  await expect(widget).toHaveCount(1)
  await expect(widget).toHaveAttribute('repo', 'KagamiChan/rozemyne')
  await expect(widget).toHaveAttribute('mapping', 'pathname')
  await expect(widget).toHaveAttribute('theme', /\/giscus\.css$/)

  const src = await page.locator('giscus-widget iframe').first().getAttribute('src')
  const params = new URL(src!).searchParams
  expect(params.get('term')).toBe(PUBLISHED_POST.slice(1))
  expect(params.get('backLink')).toBe(`https://kagami.moe${PUBLISHED_POST}`)
})

test('SSR emits the canonical backlink and no widget markup', async ({ request }) => {
  const response = await request.get(PUBLISHED_POST)
  expect(response.status()).toBe(200)

  const html = await response.text()
  expect(html).toContain('name="giscus:backlink"')
  expect(html).toContain(`https://kagami.moe${PUBLISHED_POST}`)
  expect(html).not.toContain('giscus-widget')
})

test('draft posts have no comments in production', async ({ request }) => {
  const response = await request.get(DRAFT_POST)

  expect(response.status()).toBe(404)
  expect(await response.text()).not.toContain('giscus-widget')
})
