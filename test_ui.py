from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        viewport={"width": 390, "height": 844},
        device_scale_factor=2
    )

    print("Navigating to app...")
    page.goto('http://localhost:5173')

    time.sleep(3)

    print("Simulating onboarding...")
    try:
        page.fill('input', 'Alex')
        page.click('button:has-text("Continue")')
        time.sleep(2)

        # Second step: Date picker. Let's try to just select a date or click begin if it defaults.
        page.click('text="Select a date..."')
        time.sleep(1)
        # Tab through the dialog to find a date
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        page.keyboard.press("Enter") # Selects the focused date

        time.sleep(1)

        page.click('button:has-text("Begin")')
        time.sleep(2)
    except Exception as e:
        print("Navigation failed:", e)

    # Wait to reach Home screen
    try:
        page.wait_for_selector('text="Days Together"', timeout=10000)
        time.sleep(2)
        print("Taking screenshot of Home page...")
        page.screenshot(path="screenshot.png")
    except Exception as e:
        print("Failed to reach Home page:", e)
        page.screenshot(path="screenshot_debug7.png")

    browser.close()
    print("Verification complete.")
