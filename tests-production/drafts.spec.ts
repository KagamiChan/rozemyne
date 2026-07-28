import { expect, test } from '@playwright/test'

test('draft posts return 404 in production', async ({ request }) => {
  const response = await request.get('/post/code-highlighting')

  expect(response.status()).toBe(404)
})
