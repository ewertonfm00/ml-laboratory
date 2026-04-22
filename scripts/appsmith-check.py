#!/usr/bin/env python3
"""
Check Appsmith app state - verify queries, debug errors, and page content
"""

import time
from pathlib import Path
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout

APPSMITH_URL = 'https://appsmith-production-f331.up.railway.app'
EMAIL = 'ewertonfm00@gmail.com'
PASSWORD = 'Mll031119'
SCREENSHOTS_DIR = r'Z:\My Folders\Projetos - Claude Code\AIOX - Machine Learning\scripts\screenshots'


def ss(page, name):
    Path(SCREENSHOTS_DIR).mkdir(parents=True, exist_ok=True)
    path = str(Path(SCREENSHOTS_DIR) / f"{name}.png")
    page.screenshot(path=path, full_page=True)
    print(f"  [ss] {name}.png")


def main():
    print("=" * 60)
    print("Appsmith State Check + Debug")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=150)
        context = browser.new_context(viewport={'width': 1440, 'height': 900})
        page = context.new_page()

        # Capture console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: console_errors.append(f"PAGE_ERROR: {err}"))

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

            # Open EDIT mode
            print("\n[2] Opening editor...")
            page.goto(
                f"{APPSMITH_URL}/app/ml-laboratory-portal/projetos-numeros-69df00dfffd46b32fced196b/edit",
                wait_until='domcontentloaded', timeout=30000
            )
            time.sleep(6)
            ss(page, 'A-editor-loaded')

            # Click Queries tab to see what queries exist
            print("\n[3] Checking Queries tab...")
            try:
                page.click('text="Queries"', timeout=5000)
                time.sleep(2)
                ss(page, 'B-queries-tab')
                # Get query list
                query_texts = page.evaluate("""() => {
                    const els = document.querySelectorAll('[class*="Entity"], [class*="query"], .t--entity-name');
                    return Array.from(els)
                        .map(el => el.textContent?.trim())
                        .filter(t => t && t.length > 0 && t.length < 100)
                        .slice(0, 30);
                }""")
                print(f"  Queries found: {query_texts}")
            except Exception as e:
                print(f"  Could not click Queries tab: {e}")

            # Check Debug panel
            print("\n[4] Opening Debug panel...")
            try:
                page.click('text="Debug"', timeout=5000)
                time.sleep(2)
                ss(page, 'C-debug-panel')
                debug_texts = page.evaluate("""() => {
                    const els = document.querySelectorAll('[class*="debug"], [class*="log"], [class*="error"], [class*="message"]');
                    return Array.from(els)
                        .map(el => el.textContent?.trim())
                        .filter(t => t && t.length > 0 && t.length < 200)
                        .slice(0, 20);
                }""")
                print(f"  Debug messages: {debug_texts}")
            except Exception as e:
                print(f"  Could not open Debug panel: {e}")

            # Check datasources
            print("\n[5] Checking Datasources...")
            try:
                # Navigate to datasources via the DB icon in the sidebar
                page.click('[data-testid="t--ide-sidebar-datasources"], [aria-label*="datasource" i], .t--datasource-icon', timeout=3000)
                time.sleep(2)
                ss(page, 'D-datasources')
                ds_texts = page.evaluate("""() => {
                    const els = document.querySelectorAll('[class*="datasource"], [class*="Datasource"]');
                    return Array.from(els)
                        .map(el => el.textContent?.trim())
                        .filter(t => t && t.length > 0 && t.length < 100)
                        .slice(0, 20);
                }""")
                print(f"  Datasource elements: {ds_texts}")
            except Exception as e:
                print(f"  Could not open datasources: {e}")

            # Try to view app (not edit)
            print("\n[6] Checking view mode pages...")
            view_base = f"{APPSMITH_URL}/app/ml-laboratory-portal"

            # Projetos & Numeros
            page.goto(f"{view_base}/projetos-numeros-69df00dfffd46b32fced196b", wait_until='domcontentloaded', timeout=30000)
            time.sleep(5)
            ss(page, 'E-view-projetos')

            # Get any error text on the page
            body_text = page.evaluate("""() => document.body.innerText""")
            has_error = 'error' in body_text.lower() or 'failed' in body_text.lower()
            print(f"  Projetos page has error text: {has_error}")

            # Count table rows with actual data
            row_count = page.evaluate("""() => {
                const rows = document.querySelectorAll('.t--widget-tablewidget tr[class*="row"], .ReactVirtualized__Table__row');
                return rows.length;
            }""")
            print(f"  Table data rows: {row_count}")

            # Look for stat values
            stat_values = page.evaluate("""() => {
                const els = document.querySelectorAll('[class*="stat"], [class*="Stat"], [class*="count"], [class*="number"]');
                return Array.from(els)
                    .map(el => el.textContent?.trim())
                    .filter(t => t && t.length > 0 && t.length < 50)
                    .slice(0, 10);
            }""")
            print(f"  Stat values visible: {stat_values}")

            # Navigate to Skills
            try:
                page.click('text="Skills"', timeout=5000)
                time.sleep(4)
                ss(page, 'F-view-skills')
                print("\n  Skills page loaded")
            except Exception as e:
                print(f"  Skills nav error: {e}")

            # Navigate to Perfil de Agentes
            try:
                page.click('text="Perfil de Agentes"', timeout=5000)
                time.sleep(4)
                ss(page, 'G-view-perfil')
                print("\n  Perfil de Agentes page loaded")
            except Exception as e:
                print(f"  Perfil nav error: {e}")

            # Navigate to Fila de Validacao
            try:
                page.click('text="Fila de Validacao"', timeout=5000)
                time.sleep(4)
                ss(page, 'H-view-fila')
                print("\n  Fila de Validacao page loaded")
            except Exception as e:
                print(f"  Fila nav error: {e}")

            # Go back to workspace to check import option
            print("\n[7] Checking workspace import options...")
            page.goto(f"{APPSMITH_URL}/applications", wait_until='domcontentloaded', timeout=30000)
            time.sleep(4)
            ss(page, 'I-workspace')

            # Look for Create New button and its options
            all_btns = page.evaluate("""() => {
                const els = document.querySelectorAll('button, a, [role="button"], [role="menuitem"]');
                return Array.from(els)
                    .map(el => el.textContent?.trim())
                    .filter(t => t && t.length > 0 && t.length < 80);
            }""")
            print(f"  Workspace buttons: {all_btns[:30]}")

            print("\n[8] Summary of console errors:")
            for err in console_errors[:20]:
                print(f"  {err}")

            print("\n" + "=" * 60)
            print("CHECK COMPLETE")
            print("=" * 60)

            print("\nKeeping browser open 30s...")
            time.sleep(30)

        except Exception as e:
            print(f"\nFATAL ERROR: {e}")
            ss(page, 'fatal-check-error')
            import traceback
            traceback.print_exc()
        finally:
            browser.close()


if __name__ == '__main__':
    main()
