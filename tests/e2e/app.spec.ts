import { test, expect } from '@playwright/test'

test('should display the app title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/SUSHIGETA/)

  const heading = page.getByRole('heading', { name: 'SUSHIGETA' })
  await expect(heading).toBeVisible()

  const subtitle = page.getByText('プレゼント交換アプリ')
  await expect(subtitle).toBeVisible()
})
