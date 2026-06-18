import json
from core.llm import generate_ollama

BROWSER_PROMPT = """Analyze this browser request and return ONLY JSON:
{
  "action": "open_url | search_google | search_internships | search_youtube",
  "query": "search term or URL",
  "url": "full URL if action is open_url"
}
No extra text, just JSON."""

class BrowserAgent:
    async def execute(self, message: str, history: list = [], params: dict = {}) -> str:
        raw = await generate_ollama(
            prompt=f"Browser request: {message}",
            system_prompt=BROWSER_PROMPT,
            max_tokens=120
        )
        try:
            start = raw.find("{")
            end = raw.rfind("}") + 1
            action_data = json.loads(raw[start:end])
        except Exception:
            action_data = {"action": "search_google", "query": message, "url": ""}

        action = action_data.get("action", "search_google")
        query = action_data.get("query", message)

        try:
            from playwright.async_api import async_playwright

            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=False)
                page = await browser.new_page()

                if action == "open_url":
                    url = action_data.get("url", f"https://{query}")
                    await page.goto(url)
                    title = await page.title()
                    await browser.close()
                    return f"✅ Opened **{title}** at {url}"

                elif action == "search_internships":
                    search_url = f"https://www.linkedin.com/jobs/search/?keywords={query.replace(' ', '+')}"
                    await page.goto(search_url)
                    await page.wait_for_load_state("networkidle")
                    jobs = await page.query_selector_all(".job-search-card")
                    results = []
                    for job in jobs[:10]:
                        title_el = await job.query_selector(".job-search-card__title")
                        company_el = await job.query_selector(".job-search-card__subtitle")
                        if title_el and company_el:
                            t = await title_el.inner_text()
                            c = await company_el.inner_text()
                            results.append(f"- **{t.strip()}** at {c.strip()}")
                    await browser.close()
                    if results:
                        return f"Found {len(results)} internships:\n" + "\n".join(results)
                    return "No internships found. Try a different search term."

                elif action == "search_youtube":
                    search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
                    await page.goto(search_url)
                    await page.wait_for_load_state("networkidle")
                    await browser.close()
                    return f"✅ Searched YouTube for **{query}**"

                else:
                    search_url = f"https://www.google.com/search?q={query.replace(' ', '+')}"
                    await page.goto(search_url)
                    await page.wait_for_load_state("networkidle")
                    snippets = await page.query_selector_all(".VwiC3b")
                    results = []
                    for s in snippets[:5]:
                        text = await s.inner_text()
                        results.append(f"- {text.strip()}")
                    await browser.close()
                    if results:
                        return f"**Google results for '{query}':**\n" + "\n".join(results)
                    return f"✅ Searched Google for '{query}'"

        except ImportError:
            return f"Playwright not installed. Run: `playwright install chromium`. Would have searched for: **{query}**"
        except Exception as e:
            return f"Browser action failed: {str(e)}"