import { test as base, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
}>({
  context: async ({}, use) => {
    // 1. Point to your extension build folder
    const pathToExtension = path.resolve('.output/chrome-mv3');

    // 2. Launch a persistent context (Required for extensions!)
    const context = await chromium.launchPersistentContext('', {
      headless: false, // Extensions usually require headful mode
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });

    await use(context);

    // Cleanup
    await context.close();
  },

  extensionId: async ({ context }, use) => {
    // 3. Robust way to get the Extension ID
    // We handle the race condition by checking if the worker is already there,
    // or waiting for it to appear.
    let [background] = context.serviceWorkers();

    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }

    const extensionId = background.url().split('/')[2];
    await use(extensionId);
  },
});

export const expect = test.expect;
