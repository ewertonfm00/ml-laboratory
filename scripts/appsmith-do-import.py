#!/usr/bin/env python3
"""
Appsmith Import - Navigate workspace and import JSON
Strategy: Go to workspace -> Create new -> Import from file
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

APPSMITH_URL = 'https://appsmith-production-f331.up.railway.app'
EMAIL = 'ewertonfm00@gmail.com'
PASSWORD = 'Mll031119'
JSON_FILE = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\portal\appsmith-import.json'
SCREENSHOTS_DIR = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\scripts\screenshots\import2'


def ss(page, name):
    Path(SCREENSHOTS_DIR).mkdir(parents=True, exist_ok=True)
    path = str(Path(SCREENSHOTS_DIR) / f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  [ss] {name}.png")


def wait_for_visible(page, selector, timeout=5000):
    """Try to find a visible element, return True if found"""
    try:
        el = page.locator(selector).first
        el.wait_for(state='visible', timeout=timeout)
        return True
    except:
        return False


def dump(page, label=""):
    print(f"  [{label}] URL: {page.url}")
    try:
        texts = page.evaluate("""() => {
            const els = document.querySelectorAll('button, a[role], [role="menuitem"], li[role="option"]');
            return Array.from(els)
                .map(el => el.textContent?.trim())
                .filter(t => t && t.length > 0 && t.length < 60);
        }""")
        print(f"  Buttons: {texts[:20]}")
    except:
        pass


def main():
    print("=" * 60)
    print("Appsmith Import from Workspace")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=100)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        try:
            # ── LOGIN ──
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
            time.sleep(4)
            print(f"  URL: {page.url}")
            ss(page, '01-logged-in')

            # ── WORKSPACE ──
            print("\n[2] Navigating to workspace...")
            page.goto(f"{APPSMITH_URL}/applications", wait_until='domcontentloaded', timeout=30000)
            time.sleep(4)
            ss(page, '02-workspace')
            dump(page, 'workspace')

            # ── FIND CREATE NEW BUTTON ──
            print("\n[3] Looking for 'Create new' button...")

            # The button text we saw was "Create new"
            create_btn = page.locator('button:has-text("Create new"), button:has-text("Create New")').first
            if wait_for_visible(page, 'button:has-text("Create new")', timeout=5000):
                print("  Found 'Create new' button!")
                create_btn.click()
                time.sleep(2)
                ss(page, '03-create-new-dropdown')
                dump(page, 'create-new-dropdown')
            else:
                print("  'Create new' button not found, checking page...")
                ss(page, '03-no-create-btn')
                dump(page, 'no-create-btn')

            # ── LOOK FOR IMPORT OPTIONS ──
            print("\n[4] Looking for Import option in dropdown...")

            # After clicking Create new, look for Import options
            import_selectors = [
                'text=Import',
                'text=Import from file',
                '[data-testid*="import"]',
                'li:has-text("Import")',
                'a:has-text("Import")',
            ]

            import_clicked = False
            for sel in import_selectors:
                if wait_for_visible(page, sel, timeout=3000):
                    print(f"  Found: {sel}")
                    page.locator(sel).first.click()
                    time.sleep(2)
                    ss(page, '04-import-option-clicked')
                    import_clicked = True
                    break

            if not import_clicked:
                print("  Import option not found in dropdown")
                # Try scrolling to see if it's hidden
                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(1)
                ss(page, '04-scrolled')
                dump(page, 'scrolled')

                # Try ESC and different approach
                page.keyboard.press('Escape')
                time.sleep(1)

                # Look for a direct Import button on workspace
                if wait_for_visible(page, 'button:has-text("Import")', timeout=3000):
                    print("  Found direct Import button!")
                    page.click('button:has-text("Import")')
                    time.sleep(2)
                    ss(page, '04-direct-import')
                    import_clicked = True

            # ── HANDLE IMPORT DIALOG ──
            print("\n[5] Handling import dialog...")
            time.sleep(2)
            ss(page, '05-import-dialog')
            dump(page, 'import-dialog')

            # Look for "Import from file" within a modal
            if wait_for_visible(page, 'text=Import from file', timeout=5000):
                print("  Found 'Import from file' in dialog!")
                page.click('text=Import from file')
                time.sleep(2)
                ss(page, '05b-import-from-file-dialog')

            # ── FILE UPLOAD ──
            print("\n[6] Looking for file input...")
            time.sleep(2)

            # Try to find file input (hidden or visible)
            file_input_found = False
            for attempt in range(3):
                file_inputs = page.locator('input[type="file"]').all()
                print(f"  Attempt {attempt+1}: Found {len(file_inputs)} file inputs")

                if file_inputs:
                    print(f"  Setting file: {JSON_FILE}")
                    try:
                        file_inputs[0].set_input_files(JSON_FILE)
                        file_input_found = True
                        print("  File set successfully!")
                        time.sleep(3)
                        ss(page, '06-file-selected')
                        break
                    except Exception as e:
                        print(f"  Error setting file: {e}")

                # If not found, look for clickable upload area
                upload_area = page.locator('[class*="upload" i][class*="container" i], [class*="dropzone" i], [class*="drop-zone" i]').first
                if upload_area.is_visible(timeout=2000) if hasattr(upload_area, 'is_visible') else False:
                    print("  Found upload area, clicking...")
                    upload_area.click()
                    time.sleep(1)
                    ss(page, f'06-upload-area-{attempt}')

                time.sleep(1)

            if not file_input_found:
                print("  File input never found. Taking screenshot of current state.")
                ss(page, '06-no-file-input')
                dump(page, 'no-file-input')

                # Try a different approach: look for what's visible
                all_visible = page.evaluate("""() => {
                    return Array.from(document.querySelectorAll('*'))
                        .filter(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden';
                        })
                        .filter(el => el.tagName === 'INPUT')
                        .map(el => ({ type: el.type, name: el.name, id: el.id, class: el.className.substring(0,50) }))
                        .slice(0, 20);
                }""")
                print(f"  Visible inputs: {all_visible}")

            # ── WAIT AND CHECK ──
            print("\n[7] Waiting for import processing...")
            time.sleep(5)
            ss(page, '07-processing')
            print(f"  URL: {page.url}")

            # ── DATASOURCE RECONNECT ──
            print("\n[8] Checking for datasource reconnect dialog...")
            time.sleep(2)

            ds_modal_visible = False
            for text in ['Reconnect', 'reconnect', 'Datasource', 'ML Portal DB']:
                if wait_for_visible(page, f'text={text}', timeout=3000):
                    ds_modal_visible = True
                    print(f"  Found datasource dialog (text: '{text}')")
                    break

            if ds_modal_visible:
                ss(page, '08-datasource-dialog')
                dump(page, 'datasource-dialog')

                # Try to select ML Portal DB
                if wait_for_visible(page, 'text="ML Portal DB"', timeout=3000):
                    page.click('text="ML Portal DB"')
                    time.sleep(1)
                    print("  Selected ML Portal DB!")

                # Click Skip/Done
                for btn in ['Skip to App', 'Skip', 'Done', 'Continue', 'Finish']:
                    if wait_for_visible(page, f'button:has-text("{btn}")', timeout=2000):
                        page.click(f'button:has-text("{btn}")')
                        print(f"  Clicked '{btn}'")
                        time.sleep(2)
                        break

                ss(page, '08b-after-datasource')

            # ── FINAL STATE ──
            print("\n[9] Final state...")
            time.sleep(4)
            ss(page, '09-final')
            print(f"  Final URL: {page.url}")

            # Check what pages/app we ended up on
            page_tabs = page.locator('.t--tabId, [role="tab"]').all()
            print(f"  Page tabs: {[t.text_content() for t in page_tabs[:10]]}")

            # Check app title
            app_title = page.locator('h1, h2, [class*="appname" i], [class*="app-name" i]').first
            try:
                title_text = app_title.text_content(timeout=2000)
                print(f"  App title: {title_text}")
            except:
                pass

            print("\n" + "=" * 60)
            print("DONE")
            print("=" * 60)

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
