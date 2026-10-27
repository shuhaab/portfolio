import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function setTheme(page: Page, theme: string) {
  const button = page.getByRole('button', { name: /^Theme:/ });
  for (let attempt = 0; attempt < 3; attempt++) {
    if ((await button.getAttribute('aria-label'))?.startsWith(`Theme: ${theme}.`)) return;
    await button.click();
  }
  await expect(button).toHaveAttribute('aria-label', new RegExp(`^Theme: ${theme}[.]`));
}

test('routes, navigation, focus, and genuine preview 404', async ({ page, browserName }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Info', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Works', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  await page.goForward();
  await expect(page.locator('article')).toHaveCount(4);
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link', { name: /Return to Info/ })).toBeVisible();
});

test('theme follows the OS, persists explicit modes, and restores system mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const background = () => page.locator('html').evaluate(el => getComputedStyle(el).backgroundColor);
  const button = page.getByRole('button', { name: /^Theme:/ });
  await expect(button).toHaveAttribute('aria-label', /^Theme: System\./);
  expect(await background()).toBe('rgb(18, 17, 16)');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await background()).toBe('rgb(241, 239, 238)');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-label', /^Theme: Light\./);
  await expect(page.locator('[data-theme-icon=light]')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-label', /^Theme: Dark\./);
  await expect(page.locator('[data-theme-icon=dark]')).toBeVisible();
  expect(await background()).toBe('rgb(18, 17, 16)');
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(button).toHaveAttribute('aria-label', /^Theme: Dark\./);
  await page.reload();
  await expect(button).toHaveAttribute('aria-label', /^Theme: Dark\./);
  await setTheme(page, 'Light');
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await background()).toBe('rgb(241, 239, 238)');
  await setTheme(page, 'System');
  expect(await background()).toBe('rgb(18, 17, 16)');
  await page.reload();
  await expect(button).toHaveAttribute('aria-label', /^Theme: System\./);
});

for (const storage of ['invalid', 'unavailable']) {
  test(`theme handles ${storage} storage`, async ({ page }) => {
    await page.addInitScript(mode => {
      if (mode === 'invalid') localStorage.setItem('portfolio-theme', 'invalid');
      else Object.defineProperty(window, 'localStorage', { get() { throw new Error('Denied'); } });
    }, storage);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Theme:/ })).toHaveAttribute('aria-label', /^Theme: System\./);
    await setTheme(page, 'Dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
}

for (const clipboard of ['success', 'failure', 'missing']) {
  test(`clipboard ${clipboard} retains fallback and announces the result`, async ({ page }) => {
    await page.addInitScript(mode => {
      Object.defineProperty(navigator, 'clipboard', { value: mode === 'missing' ? undefined : {
        async writeText(text: string) {
          await new Promise(resolve => setTimeout(resolve, 250));
          if (mode === 'failure') throw new Error('Denied');
          if (text !== 'shuhaabbhat@gmail.com') throw new Error('Incorrect email');
        },
      } });
    }, clipboard);
    await page.goto('/');
    const button = page.getByRole('button', { name: 'Copy email' });
    await button.focus();
    await page.keyboard.press('Enter');
    if (clipboard !== 'missing') await expect(page.getByRole('status')).toHaveText('Copying…');
    await expect(page.getByRole('status')).toHaveText(clipboard === 'success' ? 'Email copied.' : 'Could not copy. Select the email address above or open the email link.');
    await expect(button).toBeFocused();
    await expect(button).toBeEnabled();
    await expect(page.getByRole('link', { name: 'shuhaabbhat@gmail.com' })).toHaveAttribute('href', 'mailto:shuhaabbhat@gmail.com');
    await expect(page.getByRole('status')).toBeEmpty({ timeout: 6000 });
  });
}

test('content and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'shuhaabbhat@gmail.com' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy email' })).toHaveCount(0);
  await expect(page.locator('.theme-control')).toBeHidden();
  expect(await page.locator('html').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(18, 17, 16)');
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(page.locator('article')).toHaveCount(4);
  await context.close();
});

test('both pages reflow and pass automated accessibility checks in both themes', async ({ page }) => {
  const errors: string[] = [];
  const unexpectedRequests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4321') unexpectedRequests.push(request.url());
  });
  for (const path of ['/', '/works/']) {
    for (const theme of ['light', 'dark']) {
      await page.goto(path);
      await setTheme(page, theme === 'light' ? 'Light' : 'Dark');
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await expect(page.locator('main h1')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        for (const element of await page.locator('nav a, .theme-control, .email-contact a, .email-contact button').all()) {
          const bounds = await element.boundingBox();
          expect(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width).toBeTruthy();
        }
      }
      const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(audit.violations).toEqual([]);
      await page.setViewportSize({ width: 320, height: 1000 });
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  expect(errors).toEqual([]);
  expect(unexpectedRequests).toEqual([]);
});
