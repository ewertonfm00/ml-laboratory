#!/usr/bin/env python3
"""
Appsmith Import Automation via Playwright (Python)
Imports appsmith-import.json into Appsmith workspace
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

APPSMITH_URL = 'https://appsmith-production-f331.up.railway.app'
EMAIL = 'ewertonfm00@gmail.com'
PASSWORD = 'Mll031119'
JSON_FILE = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\portal\appsmith-import.json'
SCREENSHOTS_DIR = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\scripts\screenshots'


def ss(page, name):
    Path(SCREENSHOTS_DIR).mkdir(parents=True, exist_ok=True)
    path = str(Path(SCREENSHOTS_DIR) / f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  [screenshot] {name}.png")


def dump_page(page, label=""):
    """Print current URL and visible button texts"""
    print(f"  URL ({label}): {page.url}")
    try:
        texts = page.evaluate("""() => {
            const els = document.querySelectorAll('button, a, [role="menuitem"], [role="button"], li');
            return Array.from(els)
                .map(el => el.textContent?.trim())
                .filter(t => t && t.length > 0 && t.length < 60)
                .slice(0, 40);
        }""")
        print(f"  Elements: {texts}")
    except Exception as e:
        print(f"  (could not dump elements: {e})")


def main():
    print("=" * 60)
    print("Appsmith Import Automation")
    print("=" * 60)
    print(f"URL: {APPSMITH_URL}")
    print(f"File: {JSON_FILE}")
    print(f"File exists: {Path(JSON_FILE).exists()}")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            slow_mo=200,
        )
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        try:
            # ── STEP 1: Go to login page ──
            print("\n[1] Navigating to login page...")
            page.goto(f"{APPSMITH_URL}/user/login", wait_until='domcontentloaded', timeout=30000)
            time.sleep(3)
            ss(page, '01-login')
            dump_page(page, 'login')

            # ── STEP 2: Fill login form ──
            print("\n[2] Filling login form...")

            # Wait for email input
            page.wait_for_selector('input[name="username"]', timeout=10000)
            page.fill('input[name="username"]', EMAIL)
            page.fill('input[name="password"]', PASSWORD)
            ss(page, '02-form-filled')

            # Click Sign In button
            page.click('button[type="submit"]')
            print("  Clicked Sign In")

            # Wait for redirect after login
            try:
                page.wait_for_url(lambda url: '/user/login' not in url, timeout=20000)
            except PlaywrightTimeout:
                pass
            time.sleep(3)
            ss(page, '03-after-login')
            dump_page(page, 'after-login')

            # ── STEP 3: Navigate to workspace home ──
            print("\n[3] At workspace...")
            # Check if we're on the applications page
            current_url = page.url
            print(f"  Current URL: {current_url}")

            # Wait for workspace to load
            time.sleep(2)
            ss(page, '04-workspace')
            dump_page(page, 'workspace')

            # ── STEP 4: Find Import option ──
            # In Appsmith, import is typically under a dropdown from the workspace
            # or from "Create New" -> "Import"
            print("\n[4] Looking for Import option...")

            # First try: look for a direct "Import" button
            import_visible = page.locator('button:has-text("Import"), span:has-text("Import")').first
            try:
                if import_visible.is_visible(timeout=3000):
                    print("  Found direct Import button!")
                    import_visible.click()
                    time.sleep(2)
                    ss(page, '05-import-clicked')
                else:
                    raise Exception("not visible")
            except:
                print("  Direct Import not visible, trying Create New dropdown...")
                # Try "Create New" button
                try:
                    page.click('button:has-text("Create New")', timeout=5000)
                    time.sleep(1)
                    ss(page, '05-create-new-menu')
                    dump_page(page, 'create-new-menu')
                except:
                    print("  Create New button not found either")
                    ss(page, '05-fallback')
                    dump_page(page, 'fallback')

            # ── STEP 5: Look for "Import from file" in dropdown/dialog ──
            print("\n[5] Looking for 'Import from file'...")
            time.sleep(1)

            # Try clicking "Import" in a dropdown menu
            try:
                page.click('text=Import', timeout=5000)
                time.sleep(1)
                ss(page, '06-import-option')
                dump_page(page, 'import-option')
            except:
                print("  Could not click 'Import' text")

            # ── STEP 6: Handle file upload ──
            print("\n[6] Looking for file input...")
            time.sleep(2)
            ss(page, '07-before-file')

            # Try "Import from file" link
            try:
                page.click('text=/import from file/i', timeout=4000)
                time.sleep(1)
                ss(page, '07b-after-import-from-file')
            except:
                pass

            # Look for file input (hidden or visible)
            file_input = page.locator('input[type="file"]').first
            try:
                file_input.wait_for(timeout=5000)
                print(f"  Found file input! Setting file: {JSON_FILE}")
                file_input.set_input_files(JSON_FILE)
                time.sleep(3)
                ss(page, '08-file-set')
                print("  File selected!")
            except Exception as e:
                print(f"  File input not found: {e}")
                ss(page, '08-no-file-input')
                dump_page(page, 'no-file-input')

            # ── STEP 7: Wait for import progress ──
            print("\n[7] Waiting for import to process...")
            time.sleep(5)
            ss(page, '09-processing')
            dump_page(page, 'processing')

            # ── STEP 8: Handle datasource reconnection ──
            print("\n[8] Checking for datasource dialog...")
            time.sleep(2)

            # Appsmith shows a "Reconnect Datasource" modal after import
            reconnect_visible = page.locator('text=/reconnect/i, text=/datasource/i').count()
            print(f"  Datasource/reconnect elements: {reconnect_visible}")
            ss(page, '10-datasource-check')

            if reconnect_visible > 0:
                print("  Found datasource reconnection dialog!")
                dump_page(page, 'datasource-dialog')

                # Try to find ML Portal DB
                try:
                    ml_db = page.locator('text="ML Portal DB"').first
                    if ml_db.is_visible(timeout=3000):
                        print("  ML Portal DB found!")
                        ml_db.click()
                        time.sleep(1)
                except:
                    pass

                # Look for action buttons
                for btn_text in ['Skip to App', 'Skip', 'Done', 'Finish', 'Continue']:
                    try:
                        btn = page.locator(f'button:has-text("{btn_text}")').first
                        if btn.is_visible(timeout=2000):
                            print(f"  Clicking '{btn_text}' button")
                            btn.click()
                            time.sleep(2)
                            break
                    except:
                        pass

                ss(page, '11-after-datasource')

            # ── STEP 9: Check final state ──
            print("\n[9] Final state...")
            time.sleep(4)
            ss(page, '12-final')
            dump_page(page, 'final')

            final_url = page.url
            print(f"\n  Final URL: {final_url}")

            # Check for expected pages
            for page_name in ['Projetos', 'Skills', 'Perfil', 'Fila', 'Numbers']:
                count = page.locator(f'text="{page_name}"').count()
                if count > 0:
                    print(f"  FOUND: '{page_name}' ({count}x)")

            print("\n" + "=" * 60)
            print("AUTOMATION COMPLETE - Check screenshots folder")
            print("=" * 60)

            print("\nKeeping browser open 20s for inspection...")
            time.sleep(20)

        except Exception as e:
            print(f"\nFATAL ERROR: {e}")
            ss(page, 'fatal-error')
            import traceback
            traceback.print_exc()
        finally:
            browser.close()


if __name__ == '__main__':
    main()
