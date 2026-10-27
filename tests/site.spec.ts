import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function setTheme(page: Page, theme: string) {
  const button = page.getByRole('button', { name: /^Theme:/ });
  for (let attempt = 0; attempt < 2; attempt++) {
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

test('theme resolves once, alternates with keyboard and pointer, and persists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const background = () => page.locator('html').evaluate(el => getComputedStyle(el).backgroundColor);
  const button = page.getByRole('button', { name: /^Theme:/ });
  await expect(button).toHaveAccessibleName('Theme: Dark. Switch to Light mode.');
  await expect(page.locator('[data-theme-icon=dark]')).toBeVisible();
  await expect(page.locator('[data-theme-icon=system]')).toHaveCount(0);
  expect(await background()).toBe('rgb(18, 17, 16)');
  await page.emulateMedia({ colorScheme: 'light' });
  expect(await background()).toBe('rgb(18, 17, 16)');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAccessibleName('Theme: Light. Switch to Dark mode.');
  await expect(page.locator('[data-theme-icon=light]')).toBeVisible();
  expect(await background()).toBe('rgb(241, 239, 238)');
  await page.keyboard.press('Space');
  await expect(button).toHaveAccessibleName('Theme: Dark. Switch to Light mode.');
  await expect(page.locator('[data-theme-icon=dark]')).toBeVisible();
  await page.getByRole('link', { name: 'Works', exact: true }).click();
  await expect(button).toHaveAccessibleName('Theme: Dark. Switch to Light mode.');
  await page.reload();
  await expect(button).toHaveAccessibleName('Theme: Dark. Switch to Light mode.');
  await button.click();
  await expect(button).toHaveAccessibleName('Theme: Light. Switch to Dark mode.');
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await background()).toBe('rgb(241, 239, 238)');
  await page.reload();
  await expect(button).toHaveAccessibleName('Theme: Light. Switch to Dark mode.');
  for (const mode of ['Dark', 'Light', 'Dark', 'Light']) {
    await button.click();
    await expect(button).toHaveAttribute('aria-label', new RegExp(`^Theme: ${mode}[.]`));
  }
  expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe('light');
});

for (const storage of ['missing', 'invalid', 'system', 'unavailable']) {
  for (const appearance of ['light', 'dark'] as const) {
    test(`theme handles ${storage} storage with a ${appearance} OS`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: appearance });
      await page.addInitScript(mode => {
        if (mode === 'unavailable') Object.defineProperty(window, 'localStorage', { get() { throw new Error('Denied'); } });
        else if (mode !== 'missing') localStorage.setItem('portfolio-theme', mode);
      }, storage);
      await page.goto('/');
      const next = appearance === 'light' ? 'dark' : 'light';
      const title = (mode: string) => mode[0].toUpperCase() + mode.slice(1);
      const button = page.getByRole('button', { name: /^Theme:/ });
      await expect(page.locator('html')).toHaveAttribute('data-theme', appearance);
      await expect(button).toHaveAccessibleName(`Theme: ${title(appearance)}. Switch to ${title(next)} mode.`);
      await page.emulateMedia({ colorScheme: next });
      await expect(page.locator('html')).toHaveAttribute('data-theme', appearance);
      await button.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', next);
      await expect(page.locator(`[data-theme-icon=${next}]`)).toBeVisible();
      if (storage !== 'unavailable') expect(await page.evaluate(() => localStorage.getItem('portfolio-theme'))).toBe(next);
    });
  }
}

test('theme falls back to light if matchMedia and storage are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('Denied'); } });
    Object.defineProperty(window, 'matchMedia', { value: undefined });
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Theme:/ })).toHaveAccessibleName('Theme: Light. Switch to Dark mode.');
  await page.getByRole('button', { name: /^Theme:/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('contact links preserve their destinations and use compact decorative curved arrows', async ({ page }) => {
  await page.goto('/');
  for (const [name, href] of [['GitHub', 'https://github.com/shuhaab'], ['LinkedIn', 'https://www.linkedin.com/in/shuhaabbhat/']]) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(link.locator('svg')).toHaveAttribute('width', '16');
    expect(await link.locator('path').evaluateAll(paths => paths.map(path => path.getAttribute('d')))).toEqual(['m10 9 5-5 5 5', 'M4 20h7a4 4 0 0 0 4-4V4']);
  }
  const link = page.getByRole('link', { name: 'Email Shuhaab Bhat' });
  await expect(link).toHaveText('Email');
  await expect(link).toHaveAttribute('href', 'mailto:shuhaabbhat@gmail.com');
  await expect(link.locator('button')).toHaveCount(0);
  await expect(page.locator('.email-contact')).not.toContainText('shuhaabbhat@gmail.com');
  await expect(page.getByRole('button', { name: 'Copy email' })).toHaveText('');
  await link.evaluate(element => element.addEventListener('click', event => {
    event.preventDefault();
    element.setAttribute('data-opened-href', (element as HTMLAnchorElement).href);
  }));
  await link.click();
  await expect(link).toHaveAttribute('data-opened-href', 'mailto:shuhaabbhat@gmail.com');
  await expect(page.getByRole('status')).toBeEmpty();
});

for (const clipboard of ['success', 'failure', 'missing']) {
  test(`clipboard ${clipboard} preserves semantics, feedback, focus, and reset`, async ({ page }, testInfo) => {
    await page.clock.install();
    await page.addInitScript(mode => {
      let calls = 0;
      Object.defineProperty(navigator, 'clipboard', { value: mode === 'missing' ? undefined : {
        async writeText(text: string) {
          document.documentElement.dataset.copyCalls = String(++calls);
          await new Promise(resolve => setTimeout(resolve, 250));
          if (mode === 'failure') throw new Error('Denied');
          if (text !== 'shuhaabbhat@gmail.com') throw new Error('Incorrect email');
        },
      } });
    }, clipboard);
    await page.goto('/');
    await setTheme(page, 'Dark');
    const button = page.getByRole('button', { name: 'Copy email' });
    const link = page.getByRole('link', { name: 'Email Shuhaab Bhat' });
    const status = page.getByRole('status');
    if (clipboard === 'success') {
      await page.locator('.contact-section').screenshot({ path: `artifacts/contacts-${testInfo.project.name}-dark-normal.png` });
      await setTheme(page, 'Light');
      await page.locator('.contact-section').screenshot({ path: `artifacts/contacts-${testInfo.project.name}-light-normal.png` });
    }
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(link).toHaveText('Email');
    if (clipboard !== 'missing') {
      await expect(status).toHaveText('Copying…');
      await page.keyboard.press('Space');
      await expect(page.locator('html')).toHaveAttribute('data-copy-calls', '1');
      await page.clock.runFor(250);
    }
    await expect(status).toHaveText(clipboard === 'success' ? 'Email copied.' : 'Could not copy. Email shuhaabbhat@gmail.com or select this address to copy it manually.');
    await expect(button).toBeFocused();
    await expect(button).toBeEnabled();
    await expect(link).toHaveAttribute('href', 'mailto:shuhaabbhat@gmail.com');
    await expect(page).toHaveURL('http://127.0.0.1:4322/');
    if (clipboard === 'success') {
      await expect(link).toHaveText('Done!');
      await expect(button.locator('.clipboard-check')).toBeVisible();
      await expect(button.locator('.clipboard-copy')).toBeHidden();
      await expect(status).toHaveClass(/sr-only/);
      await page.locator('.contact-section').screenshot({ path: `artifacts/contacts-${testInfo.project.name}-light-success.png` });
      await setTheme(page, 'Dark');
      await page.locator('.contact-section').screenshot({ path: `artifacts/contacts-${testInfo.project.name}-dark-success.png` });
      await page.clock.runFor(3000);
      await button.click();
      await page.clock.runFor(250);
      await expect(page.locator('html')).toHaveAttribute('data-copy-calls', '2');
      await page.clock.runFor(2500);
      await expect(link).toHaveText('Done!');
      await page.clock.runFor(2500);
      await expect(link).toHaveText('Email');
      await expect(button.locator('.clipboard-copy')).toBeVisible();
      await expect(button.locator('.clipboard-check')).toBeHidden();
      await expect(status).toBeEmpty();
    } else {
      await expect(link).toHaveText('Email');
      await expect(button.locator('.clipboard-copy')).toBeVisible();
      await expect(button.locator('.clipboard-check')).toBeHidden();
      await expect(status).not.toHaveClass(/sr-only/);
      expect(await status.evaluate(element => getComputedStyle(element).userSelect)).not.toBe('none');
    }
  });
}

test('content and navigation work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'dark' });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.getByRole('heading', { name: 'About me' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email Shuhaab Bhat' })).toBeVisible();
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
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4322') unexpectedRequests.push(request.url());
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
