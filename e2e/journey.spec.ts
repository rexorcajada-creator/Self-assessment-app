import { expect, test as base, type Page } from '@playwright/test';

/**
 * Browser checks on the production build. Every test fails if the page makes
 * a request to any other origin, logs an error (including CSP violations) or
 * throws.
 */
const test = base.extend<{ networkAndConsoleGuard: undefined }>({
  networkAndConsoleGuard: [
    async ({ page, baseURL }, use) => {
      const origin = new URL(baseURL ?? 'http://localhost:4173').origin;
      const problems: string[] = [];
      page.on('request', (request) => {
        const url = request.url();
        if (!url.startsWith('data:') && new URL(url).origin !== origin) problems.push(`external request: ${url}`);
      });
      page.on('console', (message) => {
        if (message.type() === 'error') problems.push(`console error: ${message.text()}`);
      });
      page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
      await use(undefined);
      expect(problems).toEqual([]);
    },
    { auto: true },
  ],
});

const heading = (page: Page) => page.locator('#page-heading');

test('Start → setup → uploads, then refresh and browser Back keep the place and answers', async ({ page }) => {
  await page.goto('./');
  await expect(heading(page)).toHaveText('Prepare your 2025–26 tax return');
  await expect(page.getByText('All real document processing will run locally on this device.')).toBeVisible();
  await expect(page.getByText('Your local working records will not be encrypted by this app.')).toBeVisible();

  await page.getByRole('button', { name: 'Start my tax return' }).click();
  await expect(heading(page)).toHaveText('Quick setup and screening');
  await expect(heading(page)).toBeFocused();
  await page.getByRole('radio', { name: 'Wales' }).check();

  await page.getByRole('link', { name: /^Next/ }).click();
  await expect(heading(page)).toHaveText('Upload documents');
  await expect(page).toHaveURL(/#\/step\/upload$/);

  await page.reload();
  await expect(heading(page)).toHaveText('Upload documents');

  await page.goBack();
  await expect(heading(page)).toHaveText('Quick setup and screening');
  await expect(page.getByRole('radio', { name: 'Wales' })).toBeChecked();

  await page.goForward();
  await expect(heading(page)).toHaveText('Upload documents');
});

test('Resume after closing and reopening the app returns to the last step', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Start my tax return' }).click();
  await page.goto('./#/step/estimate');
  await expect(heading(page)).toHaveText('Tax estimate');
  await expect(page.getByText('SYNTHETIC DEMO — NOT A TAX CALCULATION')).toBeVisible();

  await page.goto('./');
  await page.getByRole('button', { name: 'Resume return' }).click();
  await expect(heading(page)).toHaveText('Tax estimate');
});

test('the production build carries a strict Content-Security-Policy', async ({ page }) => {
  await page.goto('./');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("connect-src 'self'");
});

test('keyboard only: skip link, Start and Next', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByRole('button', { name: 'Start my tax return' }).focus();
  await page.keyboard.press('Enter');
  await expect(heading(page)).toHaveText('Quick setup and screening');
  await page.getByRole('link', { name: /^Next/ }).focus();
  await page.keyboard.press('Enter');
  await expect(heading(page)).toHaveText('Upload documents');
});

test('layout fits the screen with no sideways scrolling on any step', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Start my tax return' }).click();
  const steps = ['setup', 'upload', 'extracted', 'transactions', 'expenses', 'final-questions', 'estimate', 'filing', 'backup'];
  for (const step of steps) {
    await page.goto(`./#/step/${step}`);
    await expect(heading(page)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow on ${step}`).toBeLessThanOrEqual(0);
  }
});

test('stepper: full list on desktop, collapsible "All steps" menu on phones', async ({ page, isMobile }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Start my tax return' }).click();
  const stepper = page.getByRole('navigation', { name: 'Progress' });
  const estimateLink = stepper.getByRole('link', { name: /Tax estimate/ });
  const toggle = stepper.getByRole('button', { name: 'All steps' });

  if (isMobile) {
    await expect(page.getByText('Step 1 of 9: Quick setup and screening')).toBeVisible();
    await expect(estimateLink).toBeHidden();
    await toggle.click();
    await expect(estimateLink).toBeVisible();
  } else {
    await expect(toggle).toBeHidden();
    await expect(estimateLink).toBeVisible();
  }
  await estimateLink.click();
  await expect(heading(page)).toHaveText('Tax estimate');
});

test('touch targets for main actions are at least 44px tall', async ({ page }) => {
  await page.goto('./');
  for (const name of ['Start my tax return', 'Resume return']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});
