#!/usr/bin/env python3
"""
Test Appsmith queries directly - click on each query and run it
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

APPSMITH_URL = 'https://appsmith-production-f331.up.railway.app'
EMAIL = 'ewertonfm00@gmail.com'
PASSWORD = 'Mll031119'
SCREENSHOTS_DIR = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\scripts\screenshots\queries'
EDIT_URL = f"{APPSMITH_URL}/app/ml-laboratory-portal/projetos-numeros-69df00dfffd46b32fced196b/edit"


def ss(page, name):
    Path(SCREENSHOTS_DIR).mkdir(parents=True, exist_ok=True)
    path = str(Path(SCREENSHOTS_DIR) / f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  [ss] {name}.png")


def wait_visible(page, selector, timeout=5000):
    try:
        page.locator(selector).first.wait_for(state='visible', timeout=timeout)
        return True
    except:
        return False


def main():
    print("=" * 60)
    print("Test Appsmith Queries")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=100)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        try:
            # Login
            print("\n[1] Login...")
            page.goto(f"{APPSMITH_URL}/user/login", wait_until='domcontentloaded', timeout=30000)
            time.sleep(2)
            page.fill('input[name="username"]', EMAIL)
            page.fill('input[name="password"]', PASSWORD)
            page.click('button[type="submit"]')
            try:
                page.wait_for_url(lambda url: '/user/login' not in url, timeout=20000)
            except PlaywrightTimeout:
                pass
            time.sleep(3)
            print(f"  URL: {page.url}")

            # Open editor
            print("\n[2] Opening editor...")
            page.goto(EDIT_URL, wait_until='domcontentloaded', timeout=30000)
            time.sleep(5)
            ss(page, '01-editor')

            # Click Queries tab
            print("\n[3] Opening Queries tab...")
            page.click('text="Queries"', timeout=5000)
            time.sleep(2)
            ss(page, '02-queries-list')

            # Click on getEstatisticas query
            print("\n[4] Testing getEstatisticas query...")
            page.click('text="getEstatisticas"', timeout=5000)
            time.sleep(3)
            ss(page, '03-getEstatisticas-open')

            # Click Run button
            if wait_visible(page, 'button:has-text("Run")', timeout=3000):
                page.click('button:has-text("Run")')
                time.sleep(4)
                ss(page, '04-getEstatisticas-result')

                # Read the response
                response_text = page.evaluate("""() => {
                    const els = document.querySelectorAll('[class*="response"], [class*="Result"], [class*="output"]');
                    return Array.from(els)
                        .map(el => el.textContent?.trim())
                        .filter(t => t && t.length > 0)
                        .slice(0, 5);
                }""")
                print(f"  Response: {response_text[:3]}")
            else:
                print("  Run button not found")

            # Click on getProjetos query
            print("\n[5] Testing getProjetos query...")
            page.click('text="getProjetos"', timeout=5000)
            time.sleep(3)
            ss(page, '05-getProjetos-open')

            # Check the SQL query text
            query_text = page.evaluate("""() => {
                const editors = document.querySelectorAll('[class*="CodeMirror"], [class*="editor"], textarea');
                return Array.from(editors)
                    .map(el => el.textContent || el.value)
                    .filter(t => t && t.length > 0 && t.includes('SELECT'))
                    .slice(0, 3);
            }""")
            print(f"  Query SQL: {query_text[:2]}")

            if wait_visible(page, 'button:has-text("Run")', timeout=3000):
                page.click('button:has-text("Run")')
                time.sleep(4)
                ss(page, '06-getProjetos-result')

            # Check for errors in query results
            print("\n[6] Checking for error messages...")
            error_elements = page.evaluate("""() => {
                const els = document.querySelectorAll('[class*="error" i], [class*="Error" i]');
                return Array.from(els)
                    .map(el => el.textContent?.trim())
                    .filter(t => t && t.length > 5 && t.length < 200)
                    .slice(0, 5);
            }""")
            print(f"  Error elements: {error_elements}")

            # Click Debug button (bottom bar)
            print("\n[7] Opening Debug panel...")
            debug_btn = page.locator('.t--debugger, [data-testid="t--debugger"], span:has-text("Debug")').first
            try:
                debug_btn.click(timeout=3000)
                time.sleep(2)
                ss(page, '07-debug-panel')

                debug_content = page.evaluate("""() => {
                    const els = document.querySelectorAll('[class*="debugger"], [class*="Debugger"], [class*="log-item"]');
                    return Array.from(els)
                        .map(el => el.textContent?.trim())
                        .filter(t => t && t.length > 0 && t.length < 300)
                        .slice(0, 10);
                }""")
                print(f"  Debug content: {debug_content}")
            except Exception as e:
                print(f"  Could not open debug: {e}")

            # Check datasource connection
            print("\n[8] Checking datasource connection...")
            # Navigate to datasource settings
            page.goto(f"{APPSMITH_URL}/app/ml-laboratory-portal/projetos-numeros-69df00dfffd46b32fced196b/edit/datasources",
                     wait_until='domcontentloaded', timeout=30000)
            time.sleep(4)
            ss(page, '08-datasources-page')

            # Look for ML Portal DB
            ml_db = page.locator('text="ML Portal DB"').count()
            print(f"  ML Portal DB found: {ml_db} times")

            # Get datasource list
            ds_items = page.evaluate("""() => {
                const els = document.querySelectorAll('[class*="datasource-name"], [class*="DatasourceName"], h3, h4');
                return Array.from(els)
                    .map(el => el.textContent?.trim())
                    .filter(t => t && t.length > 0 && t.length < 100)
                    .slice(0, 10);
            }""")
            print(f"  Datasource items: {ds_items}")

            ss(page, '09-datasources-list')

            # Try to click Test connection
            test_btn = page.locator('button:has-text("Test"), button:has-text("Save and test")').first
            try:
                if test_btn.is_visible(timeout=3000):
                    test_btn.click()
                    time.sleep(3)
                    ss(page, '10-connection-test')
            except:
                print("  Test button not visible")

            print("\n" + "=" * 60)
            print("QUERY TEST COMPLETE")
            print("=" * 60)
            print(f"Screenshots: {SCREENSHOTS_DIR}")

            print("\nKeeping browser open 30s...")
            time.sleep(30)

        except Exception as e:
            print(f"\nFATAL ERROR: {e}")
            ss(page, 'fatal-error')
            import traceback
            traceback.print_exc()
        finally:
            browser.close()


if __name__ == '__main__':
    main()
