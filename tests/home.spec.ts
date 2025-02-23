import { test, expect } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await expect(
    page.getByRole('heading', { name: '少年读书隙中窥月' }).locator('path'),
  ).toBeVisible()
  const githubPage = page.waitForEvent('popup')
  await page.getByRole('link', { name: 'GitHub' }).click()
  const page1 = await githubPage
  await page1.waitForURL('https://github.com/kagamichan')
})
