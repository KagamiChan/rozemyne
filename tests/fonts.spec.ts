import { expect, test } from '@playwright/test'

test('dev serves /fonts.css and split subsets with CORS', async ({ request }) => {
  const stylesheet = await request.get('/fonts.css')
  expect(stylesheet.status()).toBe(200)
  expect(stylesheet.headers()['content-type']).toContain('text/css')
  expect(stylesheet.headers()['access-control-allow-origin']).toBe('*')

  const result = await request.get('/fonts/lxgw-wenkai/result.css')
  expect(result.status()).toBe(200)
  expect(result.headers()['content-type']).toContain('text/css')
  expect(result.headers()['access-control-allow-origin']).toBe('*')

  const maple = await request.get('/fonts/maple-mono-latin-400-normal.woff2')
  expect(maple.status()).toBe(200)
  expect(maple.headers()['content-type']).toContain('font/woff2')
  expect(maple.headers()['access-control-allow-origin']).toBe('*')
})

test('dev renders a single /fonts.css link', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('link[rel="stylesheet"][href="/fonts.css"]')).toHaveCount(1)
})
