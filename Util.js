import { expect } from '@playwright/test';

export async function ready(locator, timeout = 15000) {
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

export async function safeClick(page, target, { timeout = 15000, retries = 3 } = {}) {
  const locator = typeof target === 'string' ? page.locator(target) : target;
  for (let i = 1; i <= retries; i++) {
    try {
      await ready(locator, timeout);
      await expect(locator).toBeEnabled({ timeout });
      await locator.click({ timeout });
      return;
    } catch (err) {
      if (i === retries) throw err;
      await page.waitForTimeout(500);
    }
  }
}

export async function safeType(target, text) {
  const locator = await ready(target);
  await locator.type(text);
}

export async function safeFill(target, text) {
  const locator = await ready(target);
  await locator.fill(text);
}

export async function safeSelect(target, option) {
  const locator = await ready(target);
  await locator.selectOption(option);
}

export async function waitClosed(locator, timeout = 15000) {
  await locator.waitFor({ state: 'detached', timeout }).catch(() => {});
}
