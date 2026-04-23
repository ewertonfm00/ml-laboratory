// Appsmith Import Automation via Playwright
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const APPSMITH_URL = 'https://appsmith-production-f331.up.railway.app';
const EMAIL = 'ewertonfm00@gmail.com';
const PASSWORD = 'Mll031119';
const JSON_FILE = path.join(__dirname, '../portal/appsmith-import.json');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function screenshot(page, name) {
  const dir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
  console.log(`Screenshot saved: ${name}.png`);
}

async function main() {
  console.log('Starting Appsmith import automation...');
  console.log(`JSON file: ${JSON_FILE}`);
  console.log(`File exists: ${fs.existsSync(JSON_FILE)}`);

  const browser = await chromium.launch({
    headless: false,  // visible for debugging
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // Step 1: Navigate to Appsmith
    console.log('\n--- Step 1: Navigate to Appsmith ---');
    await page.goto(APPSMITH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await screenshot(page, '01-initial-page');
    console.log(`Current URL: ${page.url()}`);

    // Step 2: Login
    console.log('\n--- Step 2: Login ---');

    // Check if we need to login
    if (page.url().includes('/user/login') || page.url().includes('/login')) {
      console.log('On login page, filling credentials...');
    } else {
      // Try to navigate to login
      await page.goto(`${APPSMITH_URL}/user/login`, { waitUntil: 'networkidle', timeout: 30000 });
    }

    await screenshot(page, '02-login-page');

    // Fill email
    const emailInput = await page.locator('input[name="username"], input[type="email"], input[placeholder*="email" i], input[placeholder*="Email" i]').first();
    await emailInput.fill(EMAIL);

    // Fill password
    const passwordInput = await page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(PASSWORD);

    // Click sign in
    const signInBtn = await page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login"), button:has-text("Log in")').first();
    await signInBtn.click();

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
    await sleep(2000);
    await screenshot(page, '03-after-login');
    console.log(`After login URL: ${page.url()}`);

    // Step 3: Find the workspace/apps page
    console.log('\n--- Step 3: Looking for workspace ---');

    // Wait for apps to load
    await sleep(3000);
    await screenshot(page, '04-workspace');

    // Look for the existing app or import option
    console.log('Page title:', await page.title());

    // Check if there's an import option at workspace level
    // First try to find "Import" button or option
    const importAtWorkspace = await page.locator('button:has-text("Import"), a:has-text("Import"), [data-testid="import"]').count();
    console.log(`Import buttons found at workspace: ${importAtWorkspace}`);

    // Look for any application cards
    const appCards = await page.locator('[data-testid="t--application-card"], .t--application-card, [class*="ApplicationCard"]').count();
    console.log(`App cards found: ${appCards}`);

    await screenshot(page, '05-looking-for-app');

    // Step 4: Try to find the import option
    console.log('\n--- Step 4: Finding import option ---');

    // Strategy 1: Look for "Create New" or "+" button that might have import option
    const createNewBtn = await page.locator('button:has-text("Create New"), button:has-text("New"), [data-testid="create-app"]').first();
    if (await createNewBtn.isVisible().catch(() => false)) {
      console.log('Found Create New button, clicking...');
      await createNewBtn.click();
      await sleep(1500);
      await screenshot(page, '06-create-new-menu');
    }

    // Strategy 2: Look for import from file in dropdown
    const importFromFile = await page.locator('text="Import from file", text="Import", [data-testid="import-app"]').first();
    if (await importFromFile.isVisible().catch(() => false)) {
      console.log('Found Import from file option!');
      await importFromFile.click();
      await sleep(1000);
      await screenshot(page, '07-import-dialog');
    } else {
      console.log('Import from file not visible yet, trying other approaches...');

      // Close any open menus
      await page.keyboard.press('Escape');
      await sleep(500);

      // Try clicking on the "..." menu of an existing app
      const moreOptionsBtn = await page.locator('[data-testid="t--application-card-context-menu"], .t--application-card-context-menu, button[aria-label*="more" i]').first();
      if (await moreOptionsBtn.isVisible().catch(() => false)) {
        console.log('Found more options button on app card');
        await moreOptionsBtn.click();
        await sleep(1000);
        await screenshot(page, '07b-app-context-menu');
      }
    }

    // Look for all visible text on page to understand structure
    const bodyText = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, [role="menuitem"]');
      return Array.from(elements).map(el => el.textContent?.trim()).filter(t => t && t.length < 100);
    });
    console.log('Visible interactive elements:', bodyText.slice(0, 30));

    await screenshot(page, '08-current-state');

    // Step 5: Try workspace-level import
    console.log('\n--- Step 5: Attempting workspace import ---');

    // Navigate back to workspace root
    await page.goto(APPSMITH_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    // Look for all buttons and links
    const allBtns = await page.locator('button, [role="button"]').all();
    console.log(`Total buttons found: ${allBtns.length}`);

    for (const btn of allBtns.slice(0, 20)) {
      const text = await btn.textContent().catch(() => '');
      if (text && text.trim()) {
        console.log(`  Button: "${text.trim()}"`);
      }
    }

    await screenshot(page, '09-workspace-final');

    // Try clicking "Import" if found anywhere
    const importBtns = await page.locator('button:has-text("Import"), a:has-text("Import")').all();
    console.log(`\nImport buttons on page: ${importBtns.length}`);

    if (importBtns.length > 0) {
      console.log('Clicking Import button...');
      await importBtns[0].click();
      await sleep(2000);
      await screenshot(page, '10-import-clicked');

      // Look for file input or "Import from file" option
      const fileInput = await page.locator('input[type="file"]').first();
      if (await fileInput.isVisible().catch(() => false)) {
        console.log('Found file input!');
        await fileInput.setInputFiles(JSON_FILE);
        await sleep(2000);
        await screenshot(page, '11-file-selected');
      } else {
        // Look for "Import from file" text
        const importFromFileOpt = await page.locator('text=/import from file/i, text=/from file/i').first();
        if (await importFromFileOpt.isVisible().catch(() => false)) {
          await importFromFileOpt.click();
          await sleep(1500);

          // Now look for file input
          const fileInput2 = await page.locator('input[type="file"]').first();
          if (await fileInput2.isVisible().catch(() => false) || await fileInput2.isAttached().catch(() => false)) {
            await fileInput2.setInputFiles(JSON_FILE);
            await sleep(2000);
            await screenshot(page, '12-file-selected');
          }
        }
      }
    }

    // Step 6: Handle datasource reconnection dialog
    console.log('\n--- Step 6: Handling datasource dialog ---');
    await sleep(3000);
    await screenshot(page, '13-after-import');

    // Look for datasource reconnect dialog
    const datasourceDialog = await page.locator('text=/datasource/i, text=/reconnect/i, text=/ML Portal DB/i').count();
    console.log(`Datasource dialog elements: ${datasourceDialog}`);

    // Look for "Skip" or "Reconnect" buttons
    const skipBtn = await page.locator('button:has-text("Skip"), button:has-text("Later"), button:has-text("Continue")').first();
    const reconnectBtn = await page.locator('button:has-text("Reconnect"), button:has-text("Connect"), button:has-text("Save")').first();

    if (await reconnectBtn.isVisible().catch(() => false)) {
      console.log('Found reconnect button, clicking...');
      await reconnectBtn.click();
      await sleep(2000);
    } else if (await skipBtn.isVisible().catch(() => false)) {
      console.log('Found skip button, clicking...');
      await skipBtn.click();
      await sleep(2000);
    }

    await screenshot(page, '14-final-state');
    console.log(`Final URL: ${page.url()}`);

    console.log('\n=== Automation completed ===');
    console.log('Check screenshots in scripts/screenshots/ for details');

    // Keep browser open for 10 seconds to see final state
    await sleep(10000);

  } catch (error) {
    console.error('Error during automation:', error);
    await screenshot(page, 'error-state');
    throw error;
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
