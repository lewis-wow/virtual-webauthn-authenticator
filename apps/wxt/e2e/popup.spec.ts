import { test, expect } from './fixtures';

test('popup should have title', async ({ page, extensionId }) => {
  // 2. Use the extensionId provided by the fixture
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.locator('h1')).toHaveText('Keyless');
});
