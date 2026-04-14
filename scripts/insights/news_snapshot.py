"""
news_snapshot.py — Fetch and score market-moving news from free RSS feeds.

Sources (no API key required):
  Crypto:     CoinTelegraph, CoinDesk
  Macro:      CNBC, Reuters, MarketWatch, Yahoo Finance
  Commodities: Investing.com Commodities

Output: JSON to ../../output/insights/news_latest.json
        Top-5 scored articles, sorted by relevance score descending.
"""

import json
import os
import re
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import requests

OUTPUT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "../../../../output/insights/news_latest.json",
)

SEEN_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "../../../../output/insights/news_seen.json",
)

# ── RSS feeds ──────────────────────────────────────────────────────────────────

FEEDS = [
    ("CoinTelegraph",             "https://cointelegraph.com/rss"),
    ("CoinDesk",                  "https://www.coindesk.com/arc/outboundfeeds/rss/"),
    ("CNBC",                      "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114"),
    ("CNBC Markets",              "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258"),
    ("Reuters Markets",           "https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best"),
    ("MarketWatch",               "https://feeds.marketwatch.com/marketwatch/topstories/"),
    ("MarketWatch Stocks",        "https://feeds.marketwatch.com/marketwatch/marketpulse/"),
    ("Investing.com",             "https://www.investing.com/rss/news.rss"),
    ("Investing.com Commodities", "https://www.investing.com/rss/news_14.rss"),
    ("Yahoo Finance",             "https://finance.yahoo.com/news/rssindex"),
]

# ── Keyword lists ──────────────────────────────────────────────────────────────

KEYWORDS_HIGH = [
    # Security / exploits
    "hack", "exploit", "breach", "vulnerability", "rug pull", "rugpull", "scam",
    # Regulation / legal
    "sec ", "cftc", "etf", "ban", "regulation", "regulatory", "compliance",
    "approval", "reject", "subpoena", "lawsuit", "arrest", "fraud", "indictment",
    "enforcement", "investigation", "settlement", "fine", "penalty",
    # Macro / Fed
    "fed ", "fomc", "rate cut", "rate hike", "inflation", "cpi", "ppi",
    "gdp", "unemployment", "recession", "stagflation", "quantitative",
    "tariff", "trade war", "sanctions", "treasury", "debt ceiling",
    # Geopolitics
    "war", "strike", "conflict", "missile", "invasion", "ceasefire",
    "iran", "russia", "china", "trump", "powell", "yellen",
    # Market moves
    "crash", "surge", "rally", "plunge", "dump", "pump", "squeeze",
    "liquidat", "whale", "halving", "all-time high", "ath", "capitulat",
    "outflow", "inflow", "record",
    # Institutional / adoption
    "blackrock", "microstrategy", "saylor", "grayscale", "fidelity",
    "jpmorgan", "goldman", "morgan stanley", "citadel",
    "strategic reserve", "executive order", "sovereign", "nation state",
    "institutional", "adoption", "custody",
    # Protocol / tech
    "fork", "upgrade", "merge", "airdrop", "token burn", "supply shock",
    "rwa", "tokeniz", "restaking",
    # Default / contagion
    "default", "bankrupt", "insolvent", "contagion", "depeg",
    # Commodities
    "gold", "silver", "xauusd", "xagusd", "precious metal", "commodity",
    "oil", "crude", "wti", "brent", "opec",
    # Major equities
    "nvidia", "nvda", "apple", "aapl", "microsoft", "msft",
    "s&p 500", "s&p500", "sp500", "nasdaq", "dow jones",
    "earnings", "revenue miss", "revenue beat", "guidance",
    # Macro indicators
    "dxy", "dollar index", "vix", "volatility index",
    "10-year", "treasury yield", "bond",
    # RWA / tokenization
    "real world asset", "tokenized", "ondo", "maple", "centrifuge",
]

KEYWORDS_CRYPTO = [
    "bitcoin", "btc", "ethereum", "eth", "crypto", "defi", "stablecoin",
    "binance", "coinbase", "tether", "usdt", "solana", "xrp", "sol",
    "hyperliquid", "dex", "cex", "nft", "memecoin", "blockchain", "web3",
    "digital asset", "token", "altcoin", "usdc", "polygon", "matic",
    "arbitrum", "optimism", "base", "sui", "aptos", "dogecoin", "doge",
    "chainlink", "link", "uniswap", "aave", "maker", "kraken", "okx", "bybit",
    "grayscale", "gbtc", "spot etf",
]

KEYWORDS_MACRO = [
    "gold", "silver", "xau", "xag", "precious metal",
    "oil", "crude", "wti", "brent", "opec", "natural gas",
    "tesla", "tsla", "nvidia", "nvda", "apple", "aapl",
    "microsoft", "msft", "google", "googl", "alphabet",
    "amazon", "amzn", "meta", "netflix", "nflx",
    "s&p 500", "s&p500", "sp500", "nasdaq", "dow jones", "djia",
    "stock market", "equities", "wall street", "earnings",
    "fed ", "fomc", "interest rate", "inflation", "gdp",
    "rate cut", "rate hike", "cpi", "ppi", "unemployment",
    "dxy", "dollar", "treasury", "bond", "yield",
    "tariff", "trade war", "geopolit", "recession",
]

# ── Helpers ────────────────────────────────────────────────────────────────────

def _load_seen() -> set:
    try:
        with open(SEEN_FILE) as f:
            return set(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return set()


def _save_seen(seen: set) -> None:
    os.makedirs(os.path.dirname(SEEN_FILE), exist_ok=True)
    with open(SEEN_FILE, "w") as f:
        json.dump(list(seen)[-500:], f)


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text)


# ── Core logic ─────────────────────────────────────────────────────────────────

def fetch_news(limit_per_feed: int = 20) -> list[dict]:
    articles = []
    for source, url in FEEDS:
        try:
            r = requests.get(url, timeout=10, headers={"User-Agent": "ARXBot/1.0"})
            if r.status_code != 200:
                print(f"[WARN] {source}: HTTP {r.status_code}")
                continue
            root = ET.fromstring(r.content)
            for item in root.findall(".//item")[:limit_per_feed]:
                articles.append({
                    "title":     (_strip_html(item.findtext("title") or "")).strip(),
                    "link":      (item.findtext("link") or "").strip(),
                    "source":    source,
                    "published": (item.findtext("pubDate") or "").strip(),
                    "summary":   _strip_html(item.findtext("description") or "")[:800].strip(),
                })
        except Exception as e:
            print(f"[WARN] {source} failed: {e}")
    return articles


def score_articles(articles: list[dict], top_n: int = 5) -> list[dict]:
    seen = _load_seen()
    scored = []

    for art in articles:
        if art["link"] in seen:
            continue
        text = (art["title"] + " " + art["summary"]).lower()

        has_crypto = any(kw in text for kw in KEYWORDS_CRYPTO)
        has_macro  = any(kw in text for kw in KEYWORDS_MACRO)
        if not has_crypto and not has_macro:
            continue

        score = 0
        matched = []
        for kw in KEYWORDS_HIGH:
            if kw in text:
                score += 10
                matched.append(kw)

        if has_crypto:
            score += 5
        if any(w in art["title"].lower() for w in ["breaking", "just in", "alert", "urgent"]):
            score += 20

        if score >= 10:
            art["score"] = score
            art["matched_keywords"] = matched
            scored.append(art)

    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_n]


def main() -> None:
    print("Fetching RSS feeds...")
    articles = fetch_news()
    print(f"  {len(articles)} raw articles fetched")

    top = score_articles(articles)
    print(f"  {len(top)} market-moving articles found")

    output = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "total_fetched": len(articles),
        "top_articles": top,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    # Print summary
    for i, art in enumerate(top, 1):
        print(f"\n[{i}] score={art['score']} | {art['source']}")
        print(f"    {art['title']}")
        print(f"    keywords: {', '.join(art['matched_keywords'][:5])}")

    print(f"\nSaved to {OUTPUT_PATH}")

    # Mark as seen
    seen = _load_seen()
    for art in top:
        seen.add(art["link"])
    _save_seen(seen)


if __name__ == "__main__":
    main()
