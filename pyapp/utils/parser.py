import traceback
import trafilatura
import requests
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError

def extract_main_content(url: str) -> str:
    """
    Extracts main content from the given URL using Playwright for JS-rendered sites,
    falling back to requests + trafilatura for simpler pages.
    """
    try:
        print(f"[INFO] Trying Playwright for: {url}")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=20000)  # wait up to 20s
            page.wait_for_selector("body", timeout=10000)
            html = page.content()
            browser.close()

            text = trafilatura.extract(html, include_comments=False, include_tables=False)
            if text:
                return text

    except PlaywrightTimeoutError:
        print(f"[WARN] Playwright timed out for {url}, falling back to requests.")
    except Exception as e:
        print(f"[WARN] Playwright failed for {url}: {e}")

    # Fallback to requests + trafilatura
    try:
        print(f"[INFO] Trying requests fallback for: {url}")
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/114.0.0.0 Safari/537.36"
            )
        }
        response = requests.get(url, headers=headers, timeout=25)
        response.raise_for_status()
        html = response.text
        text = trafilatura.extract(html, include_comments=False, include_tables=False)
        return text if text else ""

    except Exception as e:
        traceback.print_exc()
        print(f"[ERROR] Both Playwright and requests failed for {url}: {e}")
        return ""
