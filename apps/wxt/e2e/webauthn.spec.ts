import {
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';

import { ApiKeyManager } from '@repo/auth';
import { Permission } from '@repo/auth/enums';
import { PrismaClient } from '@repo/prisma';

import { test, expect } from './fixtures';

const prisma = new PrismaClient();
const apiKeyManager = new ApiKeyManager({ prisma });

test('should register a new credential using the Keyless extension', async ({
  page,
  context,
  extensionId, // assuming you export this from your fixtures as discussed previously
}) => {
  const user = await upsertTestingUser({ prisma });

  // 1. Generate the API Key (Server-side context)
  const apiKey = await apiKeyManager.generate({
    userId: user.id,
    permissions: Object.values(Permission),
    name: 'f',
  });

  // 2. Inject API Key into Extension Storage (Browser context)
  // WXT's "local:apiKey" maps to the key "apiKey" in chrome.storage.local

  // Get the background worker to run the storage script
  let [background] = context.serviceWorkers();
  if (!background) background = await context.waitForEvent('serviceworker');

  await background.evaluate(async (keyToStore) => {
    // This runs INSIDE the extension browser context
    // We use the native Chrome API to set the value.
    await chrome.storage.local.set({ apiKey: keyToStore.plaintextKey });

    // Optional: Log to verify inside the browser console
    console.log('Test: Injected apiKey into storage', keyToStore);
  }, apiKey);

  // ---------------------------------------------------------
  // 3. Start the User Flow
  // ---------------------------------------------------------

  const username = `user_${Date.now()}`;

  // Navigate to the site
  await page.goto('https://webauthn.io/');

  // Fill in the username
  await page.getByPlaceholder('example_username').fill(username);

  // Click Register (Updated to use ID)
  // Triggers navigator.credentials.create()
  await page.locator('#register-button').click();

  // -----------------------------------------------------------------------

  // Verify Success
  await expect(page.getByText('Success!')).toBeVisible({ timeout: 15000 });
});
