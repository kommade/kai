import { test, expect } from '@playwright/test';
import { config } from 'dotenv';
config({ path: '.env.local' });

test('product page', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Our Products' }).click();
    await page.waitForURL('./products');
    await page.getByRole('button', { name: 'Filters' }).click();
    await expect(page.getByText('By Type')).toBeVisible();
    await expect(page.getByText('By Collection')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Kai Shi (开始)' }).click();
    await page.waitForURL('./products?collection=Kai+Shi+%28%E5%BC%80%E5%A7%8B%29');
    await page.getByAltText('ks-sunflower').click();
    await page.waitForURL('./products/ks-sunflower');
    await page.getByRole('button', { name: '+' }).click();
    await expect(page.locator('section')).toContainText('2');   
});

test('purchase process', async ({ page, browserName }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Our Products' }).click();
    await page.getByAltText('ks-sunflower').click();
    await page.waitForURL('./products/ks-sunflower');
    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.waitForTimeout(5000);
    await page.getByLabel('Main').getByRole('link').nth(2).click();
    await expect(page.locator('tbody')).toContainText('Kai Shi (开始) Sunflower');
    await page.getByRole('row', { name: 'Kai Shi (开始) Sunflower Kai' }).getByRole('button').nth(1).click()
    await expect(page.locator('tbody')).toContainText('2');
    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.waitForURL('./checkout');
    test.skip(browserName === 'webkit', 'Stripe does not work with webkit')
    await page.frameLocator('iframe[name="embedded-checkout"]').getByRole('button', { name: 'Enter address manually' }).click();
    await page.frameLocator('iframe[name="embedded-checkout"]').getByLabel('Email').fill('playwright@test.com');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('Full name').fill('Playwright Test');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('Address line 1', { exact: true }).fill('11 Sixth Avenue');
    await page.frameLocator('iframe[name="embedded-checkout"]').locator('.App-Overview').click();
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('Postal code').fill('276472');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('1234 1234 1234').fill('4242424242424242');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('MM / YY').fill('11 / 24');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByPlaceholder('CVC').fill('000');
    await page.frameLocator('iframe[name="embedded-checkout"]').getByTestId('hosted-payment-submit-button').click();
    await page.waitForURL('**/return?session_id=cs_test_**', { timeout: 0 });
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await page.waitForURL('http://localhost:3000/');
});

test('login admin', async ({ page }) => {
    await page.goto('./');
    await page.getByLabel('Main').getByRole('link').nth(3).click();
    await page.getByPlaceholder('Email').fill(process.env.WEBSITE_ADMIN_EMAIL!);
    await page.getByPlaceholder('Password').fill(process.env.WEBSITE_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('./dashboard');
    await expect(page.getByText('OrdersView')).toBeVisible();
    await expect(page.getByText('DisputesView')).toBeVisible();
    await expect(page.getByText('BalanceView')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Edit products' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New product' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'User accounts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New discount' })).toBeVisible();
});
