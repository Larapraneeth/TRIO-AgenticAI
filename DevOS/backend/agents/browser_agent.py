import json
import urllib.parse
from core.llm import generate_ollama

BROWSER_PROMPT = """Analyze this browser request and return ONLY JSON:
{
  "action": "open_url | search_web | search_internships | search_youtube",
  "query": "search term or URL",
  "url": "full URL if action is open_url"
}
No extra text, just JSON."""

NAV_TIMEOUT = 20000  # ms — fail fast instead of hanging for minutes


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
            action_data = {"action": "search_web", "query": message, "url": ""}

        action = action_data.get("action", "search_web")
        query = action_data.get("query", message)

        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return "Playwright not installed. Run: `python -m playwright install chromium`"

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=False)
                context = await browser.new_page()
                context.set_default_timeout(NAV_TIMEOUT)

                try:
                    if action == "open_url":
                        url = action_data.get("url") or f"https://{query}"
                        await context.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
                        title = await context.title()
                        return f"✅ Opened **[{title}]({url})**"

                    elif action == "search_youtube":
                        url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
                        await context.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)
                        return f"✅ Opened **[YouTube search for '{query}']({url})**"

                    else:
                        # search_web AND search_internships both go through
                        # DuckDuckGo's no-JS HTML endpoint: no login, no bot wall,
                        # stable selectors, settles instantly.
                        term = query
                        if action == "search_internships":
                            term = f"{query} internship jobs"

                        url = f"https://html.duckduckgo.com/html/?q={term.replace(' ', '+')}"
                        await context.goto(url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT)

                        try:
                            await context.wait_for_selector(".result__title", timeout=8000)
                        except Exception:
                            return f"No results loaded for '{term}' (the search page may have blocked the request)."

                        titles = await context.query_selector_all(".result__title")
                        snippets = await context.query_selector_all(".result__snippet")

                        results = []
                        for i, t_el in enumerate(titles[:12]):
                            title = (await t_el.inner_text()).strip()
                            link_el = await t_el.query_selector("a")
                            raw_href = await link_el.get_attribute("href") if link_el else ""

                            if self._is_ad(raw_href, title):
                                continue  # drop sponsored / ad-tracking results

                            href = self._clean_ddg_url(raw_href)
                            snippet = ""
                            if i < len(snippets):
                                snippet = (await snippets[i].inner_text()).strip()

                            if title and href:
                                line = f"**[{title}]({href})**"
                                if snippet:
                                    line += f"\n{snippet[:160]}"
                                results.append(line)

                            if len(results) >= 8:
                                break

                        if results:
                            label = "internship results" if action == "search_internships" else "results"
                            return f"**Found {len(results)} {label} for '{query}':**\n\n" + "\n\n".join(results)
                        return f"No results found for '{query}'."

                finally:
                    await browser.close()

        except Exception as e:
            msg = str(e) or repr(e) or e.__class__.__name__
            return f"Browser action failed ({e.__class__.__name__}): {msg}"

    @staticmethod
    def _clean_ddg_url(href: str) -> str:
        # DuckDuckGo wraps real links in /l/?uddg=<encoded-real-url>. Unwrap it.
        if not href:
            return ""
        if "uddg=" in href:
            try:
                qs = urllib.parse.urlparse(href).query
                params = urllib.parse.parse_qs(qs)
                if "uddg" in params:
                    return urllib.parse.unquote(params["uddg"][0])
            except Exception:
                pass
        if href.startswith("//"):
            return "https:" + href
        return href

    @staticmethod
    def _is_ad(href: str, title: str) -> bool:
        # Skip sponsored/ad redirects (the "Highest Paid Jobs" style spam).
        blob = ((href or "") + " " + (title or "")).lower()
        return "y.js" in blob or "ad_provider" in blob or "ad_domain" in blob