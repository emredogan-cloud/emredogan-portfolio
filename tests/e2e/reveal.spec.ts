import { expect, test } from '@playwright/test';

const BELOW_FOLD = 'Revealed at 0.07s.';

test.describe('scroll reveal', () => {
  test('below-fold content starts hidden and reveals when scrolled to', async ({ page }) => {
    await page.goto('/dev/tokens');

    const target = page.getByText(BELOW_FOLD);
    const wrapper = target.locator('xpath=ancestor::*[contains(@class,"reveal")][1]');

    await expect(wrapper).toHaveClass(/reveal-hidden/);
    await expect(wrapper).toHaveCSS('opacity', '0');

    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).not.toHaveClass(/reveal-hidden/);
    await expect(wrapper).toHaveCSS('opacity', '1');
    await expect(target).toBeVisible();
  });

  test('does not replay when scrolled back past', async ({ page }) => {
    await page.goto('/dev/tokens');
    const wrapper = page
      .getByText(BELOW_FOLD)
      .locator('xpath=ancestor::*[contains(@class,"reveal")][1]');

    await wrapper.scrollIntoViewIfNeeded();
    await expect(wrapper).not.toHaveClass(/reveal-hidden/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
    await expect(wrapper).not.toHaveClass(/reveal-hidden/);
  });

  test('content is readable with JavaScript disabled', async ({ browser }) => {
    // The hidden class is applied by script. Without script, nothing hides.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/dev/tokens');

    const target = page.getByText(BELOW_FOLD);
    await expect(target).toBeVisible();
    await expect(target.locator('xpath=ancestor::*[contains(@class,"reveal")][1]')).not.toHaveClass(
      /reveal-hidden/,
    );

    await context.close();
  });
});
