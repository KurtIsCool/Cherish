from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')

    time.sleep(2)
    page.fill('input[placeholder="Their name..."]', 'Partner')
    page.click('button:has-text("Continue")')
    time.sleep(1)
    page.click('button:has-text("Select a date...")')
    time.sleep(1)
    page.get_by_role("gridcell").first.click()
    time.sleep(1)
    page.click('button:has-text("Begin")')
    time.sleep(2)

    page.goto('http://localhost:5173/settings')
    time.sleep(2)

    # Click the avatar
    try:
        page.locator('label.group').first.click()
        print("Clicked Settings avatar label successfully!")
    except Exception as e:
        print("Failed to click Settings avatar label:", e)

    page.goto('http://localhost:5173')
    time.sleep(2)
    page.click('button[aria-label="Log Memory"]')
    time.sleep(1)

    try:
        page.locator('label:has-text("Add a photo")').click()
        print("Clicked QuickLogModal photo label successfully!")
    except Exception as e:
        print("Failed to click QuickLogModal photo label:", e)

    browser.close()
