import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('landing page has styled CTA and planner route works', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /plan my event/i }).click();
  await expect(page).toHaveURL(/\/planner/);

  await page.locator('#title').fill('Garden Birthday');
  await page.locator('#city').fill('Pune');
  await page.locator('#theme').fill('Warm sunset');

  const primaryButton = page.getByRole('button', { name: /generate my event plan/i });
  await expect(primaryButton).toBeVisible();

  const bg = await primaryButton.evaluate((button) => getComputedStyle(button).backgroundColor);
  const paddingY = await primaryButton.evaluate((button) => getComputedStyle(button).paddingTop);
  const paddingX = await primaryButton.evaluate((button) => getComputedStyle(button).paddingLeft);

  expect(bg).not.toBe('rgba(0, 0, 0, 0)');
  expect(bg).not.toBe('transparent');
  expect(paddingY).not.toBe('0px');
  expect(paddingX).not.toBe('0px');

  await primaryButton.click();
  await expect(page.getByRole('heading', { name: 'Garden Birthday' })).toBeVisible();
});

test('planner shows task progress and guest summary updates', async ({ page }) => {
  await page.goto('/planner');

  await expect(page.getByRole('button', { name: /generate my event plan/i })).toBeVisible();
  await page.locator('#title').fill('Garden Birthday');
  await page.locator('#city').fill('Pune');
  await page.locator('#theme').fill('Warm sunset');
  await page.getByRole('button', { name: /generate my event plan/i }).click();

  await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
  await expect(page.getByText('RSVP yes')).toBeVisible();
});

test('dietary options toggle independently and none is exclusive', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/planner');

  for (const name of ['vegetarian', 'vegan', 'jain', 'halal', 'gluten free', 'none']) {
    const option = page.getByRole('button', { name, exact: true });
    await expect(option).toBeVisible();
    await option.click();
  }

  await expect(page.getByRole('button', { name: 'none', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (const name of ['vegetarian', 'vegan', 'jain', 'halal', 'gluten free']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'false');
  }

  await page.getByRole('button', { name: 'jain', exact: true }).click();
  await expect(page.getByRole('button', { name: 'jain', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'none', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'vegetarian', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('celebrate-ai-form') ?? '{}').dietaryNeeds)).toEqual(['jain']);
});

test('demo generation sends current details and renders the result', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/api/plan', async (route) => {
    submitted = route.request().postDataJSON();
    await route.continue();
  });
  await page.goto('/planner');
  await page.locator('#title').fill('Accessibility friendly birthday');
  await page.locator('#eventTime').fill('17:30');
  await page.locator('#venueType').selectOption('restaurant');
  await page.locator('#accessibilityNeeds').fill('Step free access and quiet room');
  await page.locator('#description').fill('A relaxed outdoor celebration');
  await page.getByRole('button', { name: 'vegan', exact: true }).click();
  await page.getByRole('button', { name: 'Generate my event plan' }).click();

  await expect(page.getByRole('heading', { name: 'Accessibility friendly birthday' })).toBeVisible();
  await expect.poll(() => submitted).toMatchObject({
    title: 'Accessibility friendly birthday',
    eventTime: '17:30',
    venueType: 'restaurant',
    accessibilityNeeds: 'Step free access and quiet room',
    description: 'A relaxed outdoor celebration',
    dietaryNeeds: ['vegetarian', 'vegan']
  });
  await expect(page.getByText('Demo plan generated')).toBeVisible();
});

test('generation failures show an error and do not show a success result', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  let requestSeen = false;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/plan')) requestSeen = true;
  });
  await page.route('**/api/plan', (route) => route.abort('failed'));
  await page.goto('/planner');
  await page.locator('#title').fill('Failure test celebration');
  await page.getByRole('button', { name: 'Generate my event plan' }).click();

  await expect.poll(() => requestSeen).toBe(true);
  await expect(page.locator('form [role="alert"]')).toContainText('Please try again');
  await expect(page.getByText('No event plan yet')).toBeVisible();
  await expect(page.getByText('Plan generated')).toHaveCount(0);
});

test('theme toggle persists across reloads and can be toggled repeatedly', async ({ page }) => {
  await page.goto('/planner');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('celebrate-ai-theme'))).toBe('dark');
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('event templates prefill the form', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/planner');
  await page.getByRole('button', { name: 'Diwali gathering' }).click();
  await expect(page.locator('#eventType')).toHaveValue('festival_party');
  await expect(page.locator('#title')).toHaveValue('Diwali family get-together');
});

test('landing page images load without horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /plan joyful moments/i })).toBeVisible();
  await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  const widths = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
});

test('guest CSV export neutralizes formulas and import restores the guest name', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/planner');
  await page.locator('#title').fill('CSV safety celebration');
  await page.getByRole('button', { name: 'Generate my event plan' }).click();
  await page.getByRole('tab', { name: /guests/i }).click();
  await page.getByPlaceholder('Guest name').fill('=1+1');
  await page.getByRole('button', { name: /add guest/i }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const csv = await readFile(downloadPath!, 'utf8');
  expect(csv).toContain('"\'=1+1",');

  await page.locator('input[type="file"][accept*=".csv"]').setInputFiles(downloadPath!);
  await expect(page.getByRole('cell', { name: '=1+1' }).first()).toBeVisible();
});

test('section refresh identifies the demo fallback when Gemini is unconfigured', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/planner');
  await page.locator('#title').fill('Section refresh celebration');
  await page.getByRole('button', { name: 'Generate my event plan' }).click();
  await page.getByRole('tab', { name: /timeline/i }).click();
  await page.getByRole('button', { name: /generate timeline with gemini/i }).click();

  await expect(page.getByText('Gemini is not configured. Use Sample ideas for bundled suggestions.')).toBeVisible();
  await expect(page.getByRole('button', { name: /load sample timeline suggestions/i })).toBeVisible();
});
