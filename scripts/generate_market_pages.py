#!/usr/bin/env python3
"""
generate_market_pages.py — Programmatic SEO: /markets/{slug}/ pages

Fetches live data from Hyperliquid API, generates static HTML for each market,
a markets index page, and updates sitemap.xml. Client-side JS overlays live data.

Usage:
    python3 generate_market_pages.py              # generate all pages
    python3 generate_market_pages.py --dry-run     # print stats, don't write
    python3 generate_market_pages.py --markets btc,gold  # generate specific markets only

No external dependencies (urllib only).
"""

import json
import os
import re
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

# ── Paths ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
MARKETS_DIR = os.path.join(REPO_ROOT, "markets")
SITEMAP_PATH = os.path.join(REPO_ROOT, "sitemap.xml")
CACHE_DIR = os.path.join(os.path.expanduser("~"), "Documents", "ARX", "output", "markets")
CACHE_PATH = os.path.join(CACHE_DIR, "hl_cache.json")

BASE_URL = "https://arx.trade"
HL_API = "https://api.hyperliquid.xyz/info"

TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

# ── Market Configuration ───────────────────────────────────────────────────────

MARKET_CONFIG: Dict[str, Dict[str, Any]] = {
    # ── RWA (HIP-3 xyz deployer perps) ──
    "gold": {
        "api_name": "GOLD", "dex": "xyz",
        "display": "Gold", "symbol": "GOLD", "category": "rwa",
        "icon": "https://app.trade.xyz/markets/gold.svg",
        "seo_title": "Trade Gold Perpetuals on Hyperliquid — Zero Overnight Fees | ARX",
        "seo_desc": "Trade gold (XAUUSD) perpetual contracts 24/7 on Hyperliquid. Zero overnight fees, transparent on-chain order book, self-custody. Live price, OI, funding rates.",
        "about": (
            "Gold has been the ultimate safe-haven asset for centuries — and now you can trade it "
            "on-chain as a perpetual contract on Hyperliquid. Unlike traditional CFD brokers that "
            "charge overnight swap fees of 5-10% annually, Hyperliquid gold perps have zero "
            "overnight fees. You pay only taker/maker fees per trade.\n\n"
            "ARX gives you a clean interface to trade GOLD perpetuals with up to 50x leverage, "
            "backed by Hyperliquid's fully on-chain order book. Your funds stay in self-custody — "
            "no counterparty risk, no dealing desk manipulation. Markets are open 24/7, including "
            "weekends when traditional gold futures are closed.\n\n"
            "With gold hitting all-time highs above $5,500 in 2026, driven by geopolitical "
            "uncertainty and central bank buying, on-chain gold perps offer traders a new way to "
            "express macro views without the friction of traditional markets."
        ),
        "faqs": [
            ("What are gold perpetual contracts?",
             "Gold perpetuals (perps) are derivatives that track the price of gold (XAUUSD) without an expiry date. Unlike futures, you never need to roll your position. Funding rates keep the contract price aligned with spot gold."),
            ("How is trading gold on Hyperliquid different from a CFD broker?",
             "Three key differences: (1) zero overnight fees vs 5-10% annual swap costs on eToro/IG, (2) fully on-chain order book with transparent execution, and (3) self-custody — your funds are never held by a broker."),
            ("What leverage is available for gold perps?",
             "Hyperliquid offers up to 50x leverage on gold perpetuals. You can adjust your leverage per position. Higher leverage means higher risk — always use stop losses and manage your margin carefully."),
        ],
        "related_blogs": ["why-trade-gold-on-chain", "rwa-perps-vs-cfd-brokers"],
        "price_divisor": 1,
    },
    "oil": {
        "api_name": "CL", "dex": "xyz",
        "display": "Crude Oil", "symbol": "WTIOIL", "category": "rwa",
        "icon": "https://app.trade.xyz/markets/oil.svg",
        "seo_title": "Trade Oil Perpetuals on Hyperliquid — 24/7 Crude Oil Trading | ARX",
        "seo_desc": "Trade WTI crude oil perpetual contracts on-chain. Zero overnight fees, 24/7 access, self-custody. Live oil price, OI, and funding rates on Hyperliquid.",
        "about": (
            "Crude oil is one of the most traded commodities in the world — and Hyperliquid brings "
            "it on-chain as a perpetual contract. Trade WTI oil 24/7 with zero overnight fees, "
            "unlike traditional CFD brokers where swap costs eat into your returns.\n\n"
            "Oil perps on Hyperliquid surged past $2.4B in daily volume during the 2026 Strait of "
            "Hormuz crisis, proving that on-chain commodity trading is ready for prime time. The "
            "fully transparent order book means no dealing desk — what you see is what you get.\n\n"
            "Whether you're hedging macro risk or trading geopolitical events, ARX provides the "
            "simplest way to access on-chain oil perps with leverage up to 50x and self-custody."
        ),
        "faqs": [
            ("Can I trade oil 24/7 on Hyperliquid?",
             "Yes. Unlike traditional oil futures (NYMEX) which have session gaps, Hyperliquid oil perps trade 24 hours a day, 7 days a week. You can react to OPEC announcements or geopolitical events even on weekends."),
            ("What is the difference between oil perps and oil CFDs?",
             "Oil perps on Hyperliquid have zero overnight fees, transparent on-chain execution, and self-custody. CFDs from brokers like eToro or IG charge overnight swap fees (5-10% annually) and are executed through a dealing desk."),
        ],
        "related_blogs": ["oil-perps-hormuz-crisis-trading-guide", "rwa-perps-vs-cfd-brokers"],
        "price_divisor": 1,
    },
    "silver": {
        "api_name": "SILVER", "dex": "xyz",
        "display": "Silver", "symbol": "SILVER", "category": "rwa",
        "icon": "https://app.trade.xyz/markets/silver.svg",
        "seo_title": "Trade Silver Perpetuals on Hyperliquid — On-Chain Precious Metals | ARX",
        "seo_desc": "Trade silver (XAGUSD) perpetual contracts 24/7 on Hyperliquid. Zero overnight fees, self-custody, transparent order book. Live silver price and funding rates.",
        "about": (
            "Silver perpetual contracts on Hyperliquid let you trade precious metals on-chain "
            "with zero overnight fees. Silver is both an industrial metal and a store of value, "
            "making it a popular diversification tool for traders.\n\n"
            "On Hyperliquid, silver perps trade 24/7 with a fully transparent order book. Unlike "
            "CFD brokers that charge overnight swap fees, you only pay per-trade fees. Your funds "
            "remain in self-custody at all times.\n\n"
            "ARX provides a clean trading interface for silver perps with real-time data, "
            "including open interest, funding rates, and 24h volume — everything you need to "
            "make informed trading decisions."
        ),
        "faqs": [
            ("Why trade silver as a perpetual contract?",
             "Silver perps let you speculate on silver's price without physical delivery or expiry dates. You can go long or short with leverage, and funding rates keep the contract aligned with spot silver."),
            ("What are the fees for silver perps on Hyperliquid?",
             "Hyperliquid charges taker fees of 0.035% and maker fees of 0.01%. There are zero overnight swap fees — a major advantage over CFD brokers that charge 5-10% annually."),
        ],
        "related_blogs": ["rwa-perps-vs-cfd-brokers"],
        "price_divisor": 1,
    },
    "sp500": {
        "api_name": "SP500", "dex": "xyz",
        "display": "S&P 500", "symbol": "SP500", "category": "rwa",
        "icon": "https://app.trade.xyz/markets/sp500.svg",
        "seo_title": "Trade S&P 500 Perpetuals On-Chain — Index Trading 24/7 | ARX",
        "seo_desc": "Trade S&P 500 index perpetuals on Hyperliquid. 24/7 access, zero overnight fees, self-custody. Live SP500 price, OI, and funding rates on-chain.",
        "about": (
            "The S&P 500 is the benchmark index for US equity markets — and Hyperliquid brings it "
            "on-chain as a perpetual contract. Trade the index 24/7, including after-hours and "
            "weekends, with zero overnight fees.\n\n"
            "Traditional index CFDs charge overnight swap fees that compound to 5-10% annually. "
            "On Hyperliquid, you pay only per-trade fees with a transparent on-chain order book. "
            "No dealing desk, no hidden spreads, no counterparty risk.\n\n"
            "Whether you're trading earnings season, Fed announcements, or macro events, "
            "S&P 500 perps on Hyperliquid via ARX give you 24/7 access with self-custody and "
            "leverage up to 50x."
        ),
        "faqs": [
            ("Can I trade the S&P 500 index on-chain?",
             "Yes. Hyperliquid offers SP500 perpetual contracts via HIP-3 (RWA perps). These track the S&P 500 index price and trade 24/7 on a fully on-chain order book."),
            ("What leverage is available for S&P 500 perps?",
             "Hyperliquid offers up to 50x leverage on SP500 perpetuals. You can adjust leverage per position and use stop losses to manage risk."),
        ],
        "related_blogs": ["rwa-perps-vs-cfd-brokers"],
        "price_divisor": 1,
    },
    "tsla": {
        "api_name": "TSLA", "dex": "xyz",
        "display": "Tesla", "symbol": "TSLA", "category": "rwa",
        "icon": "/img/tsla.png",
        "seo_title": "Trade Tesla (TSLA) Perpetuals On-Chain — Stock Perps 24/7 | ARX",
        "seo_desc": "Trade Tesla stock perpetual contracts on Hyperliquid. 24/7 trading, zero overnight fees, self-custody. Live TSLA price, OI, and funding data.",
        "about": (
            "Tesla perpetual contracts on Hyperliquid let you trade TSLA stock exposure 24/7 "
            "on-chain. Unlike traditional stock brokers, there are no overnight fees, no session "
            "gaps, and your funds stay in self-custody.\n\n"
            "TSLA perps are ideal for traders who want to react to earnings, Elon tweets, or "
            "macro events outside of NYSE trading hours. The fully transparent on-chain order "
            "book ensures fair execution without a dealing desk.\n\n"
            "ARX makes it easy to trade Tesla perps with real-time data, including open interest, "
            "funding rates, and 24h volume."
        ),
        "faqs": [
            ("How do Tesla perpetuals work?",
             "Tesla perps track TSLA stock price as a perpetual contract with no expiry. Funding rates keep the contract aligned with spot. You can go long or short with leverage up to 50x."),
            ("Can I trade Tesla stock 24/7?",
             "Yes. Unlike NYSE which has session hours, Tesla perps on Hyperliquid trade 24 hours a day, 7 days a week. React to after-hours earnings or weekend news instantly."),
        ],
        "related_blogs": ["rwa-perps-vs-cfd-brokers"],
        "price_divisor": 1,
    },
    # ── Top Crypto ──
    "btc": {
        "api_name": "BTC", "dex": None,
        "display": "Bitcoin", "symbol": "BTC", "category": "crypto",
        "icon": "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
        "seo_title": "Trade Bitcoin (BTC) Perpetuals on Hyperliquid | ARX",
        "seo_desc": "Trade BTC perpetual contracts on Hyperliquid — the most liquid on-chain perp DEX. Live Bitcoin price, open interest, funding rates, and 24h volume.",
        "about": (
            "Bitcoin is the most traded cryptocurrency in the world, and Hyperliquid offers "
            "the deepest on-chain BTC perpetual liquidity. With over $2B in daily volume and "
            "$2B+ in open interest, Hyperliquid's BTC perps rival centralized exchanges.\n\n"
            "Unlike CEX platforms, Hyperliquid runs a fully on-chain order book — every trade "
            "is verifiable, there's no counterparty risk, and your funds stay in self-custody. "
            "Trade BTC with up to 50x leverage on a DEX that matches CEX performance.\n\n"
            "ARX provides a streamlined interface for Hyperliquid BTC perps, complete with "
            "real-time data, whale tracking, and regime detection signals to help you trade "
            "smarter."
        ),
        "faqs": [
            ("Is Hyperliquid the best DEX for BTC perpetuals?",
             "Hyperliquid is the most liquid on-chain perp DEX, handling $2B+ daily BTC volume. Its fully on-chain order book, sub-second execution, and deep liquidity make it the top choice for serious BTC perp traders."),
            ("What leverage is available for BTC on Hyperliquid?",
             "Hyperliquid offers up to 50x leverage on BTC perpetuals. You can adjust leverage per position and set cross or isolated margin modes."),
            ("How are BTC funding rates calculated?",
             "Funding rates on Hyperliquid are calculated every 8 hours based on the premium between the perp price and the spot index. Positive funding means longs pay shorts; negative means shorts pay longs."),
        ],
        "related_blogs": ["hyperliquid-vaults-explained", "how-to-copy-trade-on-hyperliquid"],
        "price_divisor": 1,
    },
    "eth": {
        "api_name": "ETH", "dex": None,
        "display": "Ethereum", "symbol": "ETH", "category": "crypto",
        "icon": "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
        "seo_title": "Trade Ethereum (ETH) Perpetuals on Hyperliquid | ARX",
        "seo_desc": "Trade ETH perpetual contracts on Hyperliquid's on-chain order book. Live Ethereum price, funding rates, OI, and volume data.",
        "about": (
            "Ethereum perpetuals on Hyperliquid offer the deepest on-chain ETH liquidity, "
            "with $1B+ in daily volume and massive open interest. Trade ETH with up to 50x "
            "leverage on a fully decentralized order book.\n\n"
            "Hyperliquid's ETH perps provide transparent execution without a central "
            "counterparty. Every order, fill, and liquidation is verifiable on-chain. "
            "Your funds remain in self-custody at all times.\n\n"
            "ARX enhances your ETH trading with real-time whale positioning data, funding "
            "rate alerts, and market regime detection — tools that give you an edge."
        ),
        "faqs": [
            ("How much ETH trading volume does Hyperliquid have?",
             "Hyperliquid regularly handles $1B+ in daily ETH perpetual volume, making it the most liquid on-chain ETH perp venue."),
            ("What are ETH funding rates on Hyperliquid?",
             "ETH funding rates are calculated every 8 hours. When rates are positive, longs pay shorts. When negative, shorts pay longs. Extreme funding rates often signal upcoming price reversals."),
        ],
        "related_blogs": ["hyperliquid-vs-gmx", "hyperliquid-vaults-explained"],
        "price_divisor": 1,
    },
}

# Remaining crypto markets — use category template for about/faqs
_CRYPTO_TEMPLATE_ABOUT = (
    "{display} ({symbol}) perpetual contracts are available on Hyperliquid, the most "
    "liquid on-chain perp DEX. Trade {symbol} with up to 50x leverage on a fully "
    "decentralized order book with self-custody.\n\n"
    "Unlike centralized exchanges, every trade on Hyperliquid is verifiable on-chain. "
    "There's no counterparty risk — your funds stay in your wallet. Hyperliquid's "
    "sub-second execution and deep liquidity make it competitive with top CEX platforms.\n\n"
    "ARX provides real-time {symbol} data including price, open interest, funding rates, "
    "and 24h volume to help you make informed trading decisions."
)

_CRYPTO_TEMPLATE_FAQS = [
    ("How do I trade {symbol} perpetuals on Hyperliquid?",
     "Connect your wallet to Hyperliquid, deposit USDC, and open a {symbol} perpetual position. You can go long or short with up to 50x leverage on Hyperliquid's fully on-chain order book."),
    ("What are the fees for {symbol} perps?",
     "Hyperliquid charges taker fees of 0.035% and maker fees of 0.01% for {symbol} perpetuals. There are no overnight holding fees."),
]

_EXTRA_CRYPTO = {
    "sol":  {"api_name": "SOL",  "display": "Solana",    "symbol": "SOL"},
    "hype": {"api_name": "HYPE", "display": "Hyperliquid", "symbol": "HYPE"},
    "xrp":  {"api_name": "XRP",  "display": "XRP",       "symbol": "XRP"},
    "doge": {"api_name": "DOGE", "display": "Dogecoin",  "symbol": "DOGE"},
    "arb":  {"api_name": "ARB",  "display": "Arbitrum",  "symbol": "ARB"},
    "op":   {"api_name": "OP",   "display": "Optimism",  "symbol": "OP"},
    "sui":  {"api_name": "SUI",  "display": "Sui",       "symbol": "SUI"},
    "apt":  {"api_name": "APT",  "display": "Aptos",     "symbol": "APT"},
    "avax": {"api_name": "AVAX", "display": "Avalanche", "symbol": "AVAX"},
    "link": {"api_name": "LINK", "display": "Chainlink", "symbol": "LINK"},
    "uni":  {"api_name": "UNI",  "display": "Uniswap",   "symbol": "UNI"},
    "aave": {"api_name": "AAVE", "display": "Aave",      "symbol": "AAVE"},
    "mkr":  {"api_name": "MKR",  "display": "Maker",     "symbol": "MKR"},
    "pepe": {"api_name": "kPEPE","display": "PEPE",      "symbol": "PEPE", "price_divisor": 1000},
    "wif":  {"api_name": "WIF",  "display": "dogwifhat", "symbol": "WIF"},
    "jup":  {"api_name": "JUP",  "display": "Jupiter",   "symbol": "JUP"},
    "tia":  {"api_name": "TIA",  "display": "Celestia",  "symbol": "TIA"},
    "sei":  {"api_name": "SEI",  "display": "Sei",       "symbol": "SEI"},
}

# Auto-generate entries for remaining crypto
for _slug, _info in _EXTRA_CRYPTO.items():
    if _slug not in MARKET_CONFIG:
        _sym = _info["symbol"]
        _disp = _info["display"]
        MARKET_CONFIG[_slug] = {
            "api_name": _info["api_name"],
            "dex": None,
            "display": _disp,
            "symbol": _sym,
            "category": "crypto",
            "icon": f"https://coin-images.coingecko.com/coins/images/1/small/{_slug}.png",
            "seo_title": f"Trade {_disp} ({_sym}) Perpetuals on Hyperliquid | ARX",
            "seo_desc": f"Trade {_sym} perpetual contracts on Hyperliquid. Live {_disp} price, open interest, funding rates, and 24h volume on the leading on-chain perp DEX.",
            "about": _CRYPTO_TEMPLATE_ABOUT.format(display=_disp, symbol=_sym),
            "faqs": [(q.format(symbol=_sym), a.format(symbol=_sym)) for q, a in _CRYPTO_TEMPLATE_FAQS],
            "related_blogs": ["hyperliquid-vaults-explained"],
            "price_divisor": _info.get("price_divisor", 1),
        }


# ── API Fetching ───────────────────────────────────────────────────────────────

def fetch_hl_data() -> Dict[str, dict]:
    """Fetch market data from Hyperliquid API. Returns {api_name: context_dict}."""
    combined: Dict[str, dict] = {}

    for dex_param in [None, "xyz"]:
        payload: dict[str, str] = {"type": "metaAndAssetCtxs"}
        if dex_param:
            payload["dex"] = dex_param

        try:
            data = json.dumps(payload).encode()
            req = urllib.request.Request(
                HL_API,
                data=data,
                headers={"Content-Type": "application/json"},
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read())

            universe = result[0]["universe"]
            ctxs = result[1]
            for i, asset in enumerate(universe):
                combined[asset["name"]] = ctxs[i]
        except Exception as e:
            print(f"[WARN] HL API fetch (dex={dex_param}) failed: {e}")

    # Cache on success
    if combined:
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(CACHE_PATH, "w") as f:
            json.dump({"fetched_at": TODAY, "data": {k: v for k, v in combined.items()}}, f)

    return combined


def load_cached_data() -> Dict[str, dict]:
    """Load cached API response as fallback."""
    try:
        with open(CACHE_PATH) as f:
            return json.load(f).get("data", {})
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def get_market_data(api_name: str, dex: Optional[str], hl_data: dict) -> dict:
    """Extract formatted market data for a single market."""
    key = f"{dex}:{api_name}" if dex else api_name  # xyz:GOLD, BTC, etc.
    ctx = hl_data.get(key, {})

    price = float(ctx.get("markPx", "0"))
    prev = float(ctx.get("prevDayPx", "0"))
    vol = float(ctx.get("dayNtlVlm", "0"))
    oi = float(ctx.get("openInterest", "0"))
    funding = float(ctx.get("funding", "0"))
    change = ((price - prev) / prev * 100) if prev > 0 else 0.0

    return {
        "price": price,
        "prev_price": prev,
        "volume": vol,
        "oi": oi,
        "oi_usd": oi * price,
        "funding_8h": funding * 100,  # as percentage
        "change_24h": change,
    }


# ── Formatters ─────────────────────────────────────────────────────────────────

def fmt_price(p: float) -> str:
    if p >= 10_000:
        return f"${p:,.2f}"
    if p >= 1:
        return f"${p:.2f}"
    if p >= 0.01:
        return f"${p:.4f}"
    return f"${p:.6f}"


def fmt_vol(v: float) -> str:
    if v >= 1e9:
        return f"${v / 1e9:.2f}B"
    if v >= 1e6:
        return f"${v / 1e6:.1f}M"
    if v >= 1e3:
        return f"${v / 1e3:.0f}K"
    return f"${v:.0f}"


def fmt_change(c: float) -> str:
    sign = "+" if c >= 0 else ""
    return f"{sign}{c:.2f}%"


def fmt_funding(f: float) -> str:
    sign = "+" if f >= 0 else ""
    return f"{sign}{f:.4f}%"


def escape_html(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


# ── HTML Templates ─────────────────────────────────────────────────────────────

def render_market_page(slug: str, cfg: dict, data: dict) -> str:
    """Render a full market page HTML."""
    price = data["price"] / cfg.get("price_divisor", 1)
    change = data["change_24h"]
    change_class = "positive" if change >= 0 else "negative"
    change_str = fmt_change(change)
    category_label = "Real-World Asset" if cfg["category"] == "rwa" else "Crypto"
    category_class = "rwa" if cfg["category"] == "rwa" else "crypto"
    api_name = cfg["api_name"]
    dex_attr = f' data-dex="{cfg["dex"]}"' if cfg["dex"] else ""

    # FAQ HTML + Schema
    faq_html = ""
    faq_schema_items = ""
    for i, (q, a) in enumerate(cfg.get("faqs", [])):
        faq_html += f"""
      <div class="faq-item">
        <h3>{escape_html(q)}</h3>
        <p>{escape_html(a)}</p>
      </div>"""
        comma = "," if i < len(cfg["faqs"]) - 1 else ""
        faq_schema_items += f"""
    {{
      "@type": "Question",
      "name": {json.dumps(q)},
      "acceptedAnswer": {{
        "@type": "Answer",
        "text": {json.dumps(a)}
      }}
    }}{comma}"""

    # Related blog links
    related_html = ""
    for blog_slug in cfg.get("related_blogs", []):
        blog_title = blog_slug.replace("-", " ").title()
        related_html += f"""
      <a class="related-card" href="/blog/{blog_slug}/">
        <span class="related-title">{blog_title}</span>
        <span class="related-arrow">&rarr;</span>
      </a>"""

    # About paragraphs
    about_html = ""
    for para in cfg.get("about", "").split("\n\n"):
        if para.strip():
            about_html += f"        <p>{escape_html(para.strip())}</p>\n"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
<title>{escape_html(cfg["seo_title"])}</title>
<meta name="description" content="{escape_html(cfg["seo_desc"])}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{BASE_URL}/markets/{slug}/">

<!-- Open Graph -->
<meta property="og:title" content="{escape_html(cfg["seo_title"])}">
<meta property="og:description" content="{escape_html(cfg["seo_desc"])}">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE_URL}/markets/{slug}/">
<meta property="og:image" content="{BASE_URL}/og-image.png">
<meta property="og:site_name" content="ARX">
<meta property="article:published_time" content="{TODAY}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ARX_TRADE">
<meta name="twitter:title" content="{escape_html(cfg["seo_title"])}">
<meta name="twitter:description" content="{escape_html(cfg["seo_desc"])}">

<!-- Schema: BreadcrumbList -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{BASE_URL}/" }},
    {{ "@type": "ListItem", "position": 2, "name": "Markets", "item": "{BASE_URL}/markets/" }},
    {{ "@type": "ListItem", "position": 3, "name": "{escape_html(cfg['display'])}", "item": "{BASE_URL}/markets/{slug}/" }}
  ]
}}
</script>

<!-- Schema: FAQPage -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{faq_schema_items}
  ]
}}
</script>

<!-- Schema: FinancialProduct -->
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "FinancialProduct",
  "name": "{escape_html(cfg['display'])} Perpetual Contract",
  "description": "{escape_html(cfg['seo_desc'])}",
  "provider": {{ "@type": "Organization", "name": "ARX", "url": "{BASE_URL}" }},
  "url": "{BASE_URL}/markets/{slug}/"
}}
</script>

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">

<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="alternate" type="application/rss+xml" title="ARX" href="{BASE_URL}/feed.xml">

<style>
:root {{
  --bg-base: #08060F;
  --bg-surface-1: #0F0B1A;
  --bg-surface-2: #1A1425;
  --bg-surface-3: #251E30;
  --primary: #B38DF4;
  --primary-hover: #925BF0;
  --primary-glow: rgba(179,141,244,0.3);
  --cyan: #22D1EE;
  --cyan-dim: rgba(34,209,238,0.15);
  --green: #34D399;
  --green-dim: rgba(52,211,153,0.15);
  --red: #F87171;
  --red-dim: rgba(248,113,113,0.15);
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --border-subtle: rgba(255,255,255,0.06);
  --border-medium: rgba(255,255,255,0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}}
*,*::before,*::after {{ margin:0; padding:0; box-sizing:border-box; }}
html {{ scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }}
body {{ font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; background:var(--bg-base); color:var(--text-primary); line-height:1.6; }}
.mono {{ font-family:'JetBrains Mono',monospace; font-feature-settings:'tnum'; }}
a {{ color:inherit; text-decoration:none; }}
.container {{ max-width:900px; margin:0 auto; padding:0 20px; }}

/* Navbar */
.navbar {{
  position:fixed; top:12px; left:50%; transform:translateX(-50%);
  width:calc(100% - 48px); max-width:1100px; z-index:100;
  padding:8px 24px;
  backdrop-filter:blur(20px) saturate(1.5); -webkit-backdrop-filter:blur(20px) saturate(1.5);
  background:rgba(37,30,48,0.5);
  border:1px solid rgba(255,255,255,0.12);
  border-radius:9999px;
  box-shadow:0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
}}
.navbar .container {{ max-width:100%; display:flex; align-items:center; justify-content:space-between; padding:0; }}
.nav-logo {{ display:flex; align-items:center; }}
.nav-logo svg {{ height:20px; width:auto; display:block; }}
.nav-links {{ display:flex; align-items:center; gap:32px; list-style:none; }}
.nav-links a {{ font-size:14px; font-weight:500; color:var(--text-secondary); transition:color 0.2s; }}
.nav-links a:hover {{ color:var(--text-primary); }}
.nav-links a.active {{ color:var(--text-primary); }}
.nav-links a.nav-cta {{
  display:inline-flex; align-items:center; gap:8px;
  padding:7px 18px; background:var(--primary); color:#FFF;
  border:none; border-radius:var(--radius-full);
  font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s;
}}
.nav-cta:hover {{ background:var(--primary-hover); box-shadow:0 0 24px var(--primary-glow); }}
.nav-toggle {{ display:none; }}

/* Breadcrumb */
.breadcrumb {{ padding:80px 0 16px; font-size:13px; color:var(--text-muted); }}
.breadcrumb a {{ color:var(--text-muted); }}
.breadcrumb a:hover {{ color:var(--text-primary); }}
.breadcrumb .sep {{ margin:0 6px; }}

/* Hero */
.market-hero {{ padding:0 0 32px; border-bottom:1px solid var(--border-subtle); }}
.market-hero-top {{ display:flex; align-items:center; gap:16px; margin-bottom:12px; }}
.market-icon {{ width:48px; height:48px; border-radius:50%; }}
.market-name {{ font-size:32px; font-weight:800; letter-spacing:-0.02em; }}
.category-badge {{
  display:inline-block; padding:3px 10px; border-radius:var(--radius-full);
  font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;
}}
.category-badge.rwa {{ background:var(--cyan-dim); color:var(--cyan); }}
.category-badge.crypto {{ background:rgba(179,141,244,0.15); color:var(--primary); }}
.market-price {{ font-size:48px; font-weight:700; letter-spacing:-0.02em; }}
.market-change {{ font-size:18px; font-weight:600; margin-left:12px; }}
.positive {{ color:var(--green); }}
.negative {{ color:var(--red); }}

/* Stats Grid */
.stats-grid {{ display:grid; grid-template-columns:repeat(4,1fr); gap:12px; padding:32px 0; }}
.stat-card {{
  background:var(--bg-surface-2); border:1px solid var(--border-subtle);
  border-radius:var(--radius-md); padding:16px;
}}
.stat-card .label {{ font-size:12px; color:var(--text-muted); margin-bottom:4px; text-transform:uppercase; letter-spacing:0.05em; }}
.stat-card .value {{ font-size:20px; font-weight:600; }}

/* About */
.about {{ padding:32px 0; }}
.about h2 {{ font-size:22px; font-weight:700; margin-bottom:16px; }}
.about p {{ color:var(--text-secondary); margin-bottom:12px; line-height:1.7; }}

/* FAQ */
.faq {{ padding:32px 0; border-top:1px solid var(--border-subtle); }}
.faq h2 {{ font-size:22px; font-weight:700; margin-bottom:16px; }}
.faq-item {{ margin-bottom:20px; }}
.faq-item h3 {{ font-size:16px; font-weight:600; margin-bottom:6px; color:var(--text-primary); }}
.faq-item p {{ font-size:14px; color:var(--text-secondary); line-height:1.7; }}

/* Related */
.related {{ padding:32px 0; border-top:1px solid var(--border-subtle); }}
.related h2 {{ font-size:22px; font-weight:700; margin-bottom:16px; }}
.related-card {{
  display:flex; justify-content:space-between; align-items:center;
  padding:16px; background:var(--bg-surface-2); border:1px solid var(--border-subtle);
  border-radius:var(--radius-md); margin-bottom:8px; transition:border-color 0.2s;
}}
.related-card:hover {{ border-color:var(--primary); }}
.related-title {{ font-size:14px; font-weight:500; }}
.related-arrow {{ color:var(--primary); font-size:18px; }}

/* CTA */
.cta-banner {{
  margin:32px 0; padding:32px; text-align:center;
  background:linear-gradient(135deg, rgba(179,141,244,0.1), rgba(34,209,238,0.05));
  border:1px solid var(--border-medium); border-radius:var(--radius-lg);
}}
.cta-banner h2 {{ font-size:22px; font-weight:700; margin-bottom:8px; }}
.cta-banner p {{ font-size:14px; color:var(--text-secondary); margin-bottom:16px; }}
.cta-btn {{
  display:inline-block; padding:12px 32px; background:var(--primary); color:#FFF;
  border-radius:var(--radius-full); font-size:15px; font-weight:600; transition:all 0.2s;
}}
.cta-btn:hover {{ background:var(--primary-hover); box-shadow:0 0 24px var(--primary-glow); }}

/* Footer */
.footer {{ padding:40px 0; border-top:1px solid var(--border-subtle); margin-top:40px; }}
.footer p {{ font-size:12px; color:var(--text-muted); text-align:center; }}
.footer a {{ color:var(--text-secondary); }}
.footer a:hover {{ color:var(--text-primary); }}

/* Mobile */
@media (max-width:768px) {{
  .stats-grid {{ grid-template-columns:repeat(2,1fr); }}
  .market-price {{ font-size:36px; }}
  .market-name {{ font-size:24px; }}
}}
</style>
</head>
<body data-api-name="{api_name}"{dex_attr} data-price-divisor="{cfg.get('price_divisor', 1)}">

<!-- NAVBAR -->
<nav class="navbar">
  <div class="container">
    <a href="/" class="nav-logo">
      <svg viewBox="0 0 100 27.4" height="20" role="img" aria-label="ARX logo">
        <path fill="#FFFFFF" fill-rule="evenodd" d="M 5.7 0.2 L 0 27.4 L 5.4 27.4 L 25.5 8.1 L 30.0 27.4 L 35.2 27.4 L 29.3 0 Z M 21.7 4.6 L 7.0 19.4 L 10.1 4.8 Z"/>
        <path fill="#FFFFFF" d="M 45.2 0 L 39.3 27.4 L 44.5 27.4 L 49.4 4.6 L 68.6 4.6 L 68.6 0 Z"/>
        <path fill="#FFFFFF" d="M 72.7 0 L 72.7 4.6 L 82.9 14.3 L 72.7 24.6 L 72.7 27.4 L 76.1 27.4 L 86.5 17.6 L 96.8 27.4 L 100 27.4 L 100 24.5 L 89.9 14.5 L 100 4.8 L 100 0 L 97.5 0 L 86.5 11.1 L 75.2 0 Z"/>
      </svg>
    </a>
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/markets/" class="active">Markets</a></li>
      <li><a href="/insights/">Insights</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/#waitlist" class="nav-cta">Join Waitlist</a></li>
    </ul>
  </div>
</nav>

<div class="container">

  <!-- BREADCRUMB -->
  <div class="breadcrumb">
    <a href="/">Home</a><span class="sep">/</span>
    <a href="/markets/">Markets</a><span class="sep">/</span>
    <span>{escape_html(cfg['display'])}</span>
  </div>

  <!-- HERO -->
  <section class="market-hero">
    <div class="market-hero-top">
      <img src="{cfg['icon']}" alt="{escape_html(cfg['display'])}" class="market-icon" width="48" height="48">
      <h1 class="market-name">{escape_html(cfg['display'])} <span style="color:var(--text-muted);font-size:20px;font-weight:500">/ USDC</span></h1>
      <span class="category-badge {category_class}">{category_label}</span>
    </div>
    <div style="display:flex;align-items:baseline;">
      <span class="market-price mono" data-field="price">{fmt_price(price)}</span>
      <span class="market-change {change_class} mono" data-field="change">{change_str}</span>
    </div>
  </section>

  <!-- STATS -->
  <section class="stats-grid">
    <div class="stat-card">
      <div class="label">24h Volume</div>
      <div class="value mono" data-field="volume">{fmt_vol(data['volume'])}</div>
    </div>
    <div class="stat-card">
      <div class="label">Open Interest</div>
      <div class="value mono" data-field="oi">{fmt_vol(data['oi_usd'])}</div>
    </div>
    <div class="stat-card">
      <div class="label">Funding Rate / 8h</div>
      <div class="value mono" data-field="funding">{fmt_funding(data['funding_8h'])}</div>
    </div>
    <div class="stat-card">
      <div class="label">Category</div>
      <div class="value">{category_label}</div>
    </div>
  </section>

  <!-- ABOUT -->
  <section class="about">
    <h2>About {escape_html(cfg['display'])} Perpetuals on Hyperliquid</h2>
{about_html}
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>Frequently Asked Questions</h2>
{faq_html}
  </section>

  <!-- RELATED -->
  <section class="related">
    <h2>Related Articles</h2>
{related_html}
  </section>

  <!-- CTA -->
  <div class="cta-banner">
    <h2>Start Trading {escape_html(cfg['display'])} on ARX</h2>
    <p>Zero overnight fees. Self-custody. 24/7 access. Powered by Hyperliquid.</p>
    <a href="/#waitlist" class="cta-btn">Join Waitlist</a>
  </div>

</div>

<!-- FOOTER -->
<footer class="footer">
  <div class="container">
    <p>&copy; 2026 ARX. Trade gold, oil, S&amp;P 500, and crypto perps on-chain.
      <a href="https://x.com/ARX_TRADE" target="_blank">X</a> &middot;
      <a href="https://t.me/ARX_Trade_Official" target="_blank">Telegram</a> &middot;
      <a href="https://discord.gg/kNV6raqC" target="_blank">Discord</a>
    </p>
  </div>
</footer>

<script src="/js/market-page.js"></script>
</body>
</html>"""


# ── Markets Index Page ─────────────────────────────────────────────────────────

def render_markets_index(configs: Dict[str, Dict[str, Any]], hl_data: Dict[str, dict]) -> str:
    """Render /markets/index.html with all markets grouped by category."""
    rwa_cards = ""
    crypto_cards = ""
    schema_items = ""
    pos = 0

    for slug, cfg in sorted(configs.items(), key=lambda x: x[1]["display"]):
        data = get_market_data(cfg["api_name"], cfg["dex"], hl_data)
        if data["price"] == 0:
            continue
        price = data["price"] / cfg.get("price_divisor", 1)
        change = data["change_24h"]
        change_class = "positive" if change >= 0 else "negative"
        change_str = fmt_change(change)
        category_class = "rwa" if cfg["category"] == "rwa" else "crypto"

        card = f"""
      <a href="/markets/{slug}/" class="market-card">
        <div class="mc-left">
          <img src="{cfg['icon']}" alt="{escape_html(cfg['display'])}" width="36" height="36" class="mc-icon" loading="lazy">
          <div>
            <span class="mc-name">{escape_html(cfg['display'])}</span>
            <span class="mc-symbol">{cfg['symbol']} / USDC</span>
          </div>
        </div>
        <div class="mc-right">
          <span class="mc-price mono">{fmt_price(price)}</span>
          <span class="mc-change {change_class} mono">{change_str}</span>
        </div>
      </a>"""

        if cfg["category"] == "rwa":
            rwa_cards += card
        else:
            crypto_cards += card

        pos += 1
        comma = ","
        schema_items += f"""
    {{
      "@type": "ListItem",
      "position": {pos},
      "url": "{BASE_URL}/markets/{slug}/",
      "name": "{escape_html(cfg['display'])} Perpetuals"
    }}{comma}"""

    # Remove trailing comma
    schema_items = schema_items.rstrip(",")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0">
<title>All Perpetual Markets on Hyperliquid | ARX</title>
<meta name="description" content="Trade gold, oil, S&P 500, Bitcoin, Ethereum, and 20+ more perpetual contracts on Hyperliquid. Live prices, OI, funding rates. Zero overnight fees.">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{BASE_URL}/markets/">

<meta property="og:title" content="All Perpetual Markets on Hyperliquid | ARX">
<meta property="og:description" content="Trade RWA and crypto perpetuals on-chain. Live prices, open interest, and funding rates.">
<meta property="og:type" content="website">
<meta property="og:url" content="{BASE_URL}/markets/">
<meta property="og:image" content="{BASE_URL}/og-image.png">
<meta property="og:site_name" content="ARX">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ARX_TRADE">
<meta name="twitter:title" content="All Perpetual Markets on Hyperliquid | ARX">

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{ "@type": "ListItem", "position": 1, "name": "Home", "item": "{BASE_URL}/" }},
    {{ "@type": "ListItem", "position": 2, "name": "Markets", "item": "{BASE_URL}/markets/" }}
  ]
}}
</script>

<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Hyperliquid Perpetual Markets",
  "description": "Trade RWA and crypto perpetual contracts on Hyperliquid via ARX",
  "numberOfItems": {pos},
  "itemListElement": [{schema_items}
  ]
}}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="alternate" type="application/rss+xml" title="ARX" href="{BASE_URL}/feed.xml">

<style>
:root {{
  --bg-base: #08060F;
  --bg-surface-1: #0F0B1A;
  --bg-surface-2: #1A1425;
  --bg-surface-3: #251E30;
  --primary: #B38DF4;
  --primary-hover: #925BF0;
  --primary-glow: rgba(179,141,244,0.3);
  --cyan: #22D1EE;
  --cyan-dim: rgba(34,209,238,0.15);
  --green: #34D399;
  --red: #F87171;
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;
  --border-subtle: rgba(255,255,255,0.06);
  --border-medium: rgba(255,255,255,0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
}}
*,*::before,*::after {{ margin:0; padding:0; box-sizing:border-box; }}
html {{ scroll-behavior:smooth; -webkit-font-smoothing:antialiased; }}
body {{ font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif; background:var(--bg-base); color:var(--text-primary); line-height:1.6; }}
.mono {{ font-family:'JetBrains Mono',monospace; font-feature-settings:'tnum'; }}
a {{ color:inherit; text-decoration:none; }}
.container {{ max-width:900px; margin:0 auto; padding:0 20px; }}

.navbar {{
  position:fixed; top:12px; left:50%; transform:translateX(-50%);
  width:calc(100% - 48px); max-width:1100px; z-index:100;
  padding:8px 24px;
  backdrop-filter:blur(20px) saturate(1.5); -webkit-backdrop-filter:blur(20px) saturate(1.5);
  background:rgba(37,30,48,0.5);
  border:1px solid rgba(255,255,255,0.12);
  border-radius:9999px;
  box-shadow:0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
}}
.navbar .container {{ max-width:100%; display:flex; align-items:center; justify-content:space-between; padding:0; }}
.nav-logo {{ display:flex; align-items:center; }}
.nav-logo svg {{ height:20px; width:auto; display:block; }}
.nav-links {{ display:flex; align-items:center; gap:32px; list-style:none; }}
.nav-links a {{ font-size:14px; font-weight:500; color:var(--text-secondary); transition:color 0.2s; }}
.nav-links a:hover {{ color:var(--text-primary); }}
.nav-links a.active {{ color:var(--text-primary); }}
.nav-links a.nav-cta {{
  display:inline-flex; align-items:center; gap:8px;
  padding:7px 18px; background:var(--primary); color:#FFF;
  border:none; border-radius:var(--radius-full);
  font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s;
}}
.nav-cta:hover {{ background:var(--primary-hover); box-shadow:0 0 24px var(--primary-glow); }}
.nav-toggle {{ display:none; }}

.page-header {{
  padding:100px 0 32px;
  border-bottom:1px solid var(--border-subtle);
}}
.page-header h1 {{
  font-size:32px; font-weight:800; letter-spacing:-0.02em; margin-bottom:6px;
}}
.page-header h1 span {{
  background:linear-gradient(135deg, var(--cyan), var(--primary));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}}
.page-header p {{
  font-size:14px; color:var(--text-muted);
}}

.section-label {{
  font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;
  color:var(--cyan); margin:32px 0 16px; padding-bottom:8px;
  border-bottom:1px solid var(--border-subtle);
}}
.section-label.crypto {{ color:var(--primary); }}

.market-card {{
  display:flex; justify-content:space-between; align-items:center;
  padding:16px 20px;
  background:var(--bg-surface-2);
  border:1px solid var(--border-subtle);
  border-radius:var(--radius-md);
  margin-bottom:8px;
  transition:border-color 0.2s, transform 0.15s;
}}
.market-card:hover {{
  border-color:var(--primary);
  transform:translateY(-1px);
}}
.mc-left {{ display:flex; align-items:center; gap:12px; }}
.mc-icon {{ width:36px; height:36px; border-radius:50%; }}
.mc-name {{ font-size:15px; font-weight:600; display:block; }}
.mc-symbol {{ font-size:12px; color:var(--text-muted); }}
.mc-right {{ text-align:right; }}
.mc-price {{ font-size:16px; font-weight:600; display:block; }}
.mc-change {{ font-size:13px; font-weight:500; }}
.positive {{ color:var(--green); }}
.negative {{ color:var(--red); }}

.footer {{ padding:40px 0; border-top:1px solid var(--border-subtle); margin-top:40px; }}
.footer p {{ font-size:12px; color:var(--text-muted); text-align:center; }}
.footer a {{ color:var(--text-secondary); }}
.footer a:hover {{ color:var(--text-primary); }}

@media (max-width:768px) {{
  .page-header h1 {{ font-size:24px; }}
  .nav-links {{ display:none; }}
  .nav-toggle {{ display:flex; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:4px; }}
  .nav-toggle span {{ width:24px; height:2px; background:var(--text-primary); border-radius:2px; }}
  .nav-links.show {{
    display:flex; flex-direction:column;
    position:absolute; top:100%; left:0; right:0;
    background:var(--bg-surface-2); border-radius:var(--radius-md);
    padding:16px; margin-top:8px; gap:12px;
  }}
}}
</style>
</head>
<body>

<nav class="navbar">
  <div class="container">
    <a href="/" class="nav-logo">
      <svg viewBox="0 0 100 27.4" height="20" role="img" aria-label="ARX logo">
        <path fill="#FFFFFF" fill-rule="evenodd" d="M 5.7 0.2 L 0 27.4 L 5.4 27.4 L 25.5 8.1 L 30.0 27.4 L 35.2 27.4 L 29.3 0 Z M 21.7 4.6 L 7.0 19.4 L 10.1 4.8 Z"/>
        <path fill="#FFFFFF" d="M 45.2 0 L 39.3 27.4 L 44.5 27.4 L 49.4 4.6 L 68.6 4.6 L 68.6 0 Z"/>
        <path fill="#FFFFFF" d="M 72.7 0 L 72.7 4.6 L 82.9 14.3 L 72.7 24.6 L 72.7 27.4 L 76.1 27.4 L 86.5 17.6 L 96.8 27.4 L 100 27.4 L 100 24.5 L 89.9 14.5 L 100 4.8 L 100 0 L 97.5 0 L 86.5 11.1 L 75.2 0 Z"/>
      </svg>
    </a>
    <ul class="nav-links">
      <li><a href="/">Home</a></li>
      <li><a href="/markets/" class="active">Markets</a></li>
      <li><a href="/insights/">Insights</a></li>
      <li><a href="/blog/">Blog</a></li>
      <li><a href="/#waitlist" class="nav-cta">Join Waitlist</a></li>
    </ul>
    <button class="nav-toggle" onclick="document.querySelector('.nav-links').classList.toggle('show')" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<div class="container">

  <section class="page-header">
    <h1>All <span>Perpetual Markets</span> on Hyperliquid</h1>
    <p>Trade RWA and crypto perpetual contracts 24/7. Zero overnight fees. Self-custody. Powered by Hyperliquid.</p>
  </section>

  <div class="section-label">Real-World Assets (RWA)</div>
{rwa_cards}

  <div class="section-label crypto">Crypto Perpetuals</div>
{crypto_cards}

</div>

<footer class="footer">
  <div class="container">
    <p>&copy; 2026 ARX. Trade gold, oil, S&amp;P 500, and crypto perps on-chain.
      <a href="https://x.com/ARX_TRADE" target="_blank">X</a> &middot;
      <a href="https://t.me/ARX_Trade_Official" target="_blank">Telegram</a> &middot;
      <a href="https://discord.gg/kNV6raqC" target="_blank">Discord</a>
    </p>
  </div>
</footer>

</body>
</html>"""


# ── Sitemap Updater ────────────────────────────────────────────────────────────

def update_sitemap(slugs: List[str]) -> None:
    """Add /markets/ and /markets/{slug}/ entries to sitemap.xml."""
    with open(SITEMAP_PATH, "r") as f:
        content = f.read()

    # Remove existing market entries
    content = re.sub(r"\s*<url>\s*<loc>https://arx\.trade/markets/[^<]*</loc>.*?</url>", "", content, flags=re.DOTALL)

    # Build new entries
    entries = f"""
  <url>
    <loc>{BASE_URL}/markets/</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>"""

    for slug in sorted(slugs):
        entries += f"""
  <url>
    <loc>{BASE_URL}/markets/{slug}/</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>"""

    # Insert before closing </urlset>
    content = content.replace("</urlset>", f"{entries}\n</urlset>")

    with open(SITEMAP_PATH, "w") as f:
        f.write(content)


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    dry_run = "--dry-run" in sys.argv

    # Parse --markets filter
    market_filter = None
    for arg in sys.argv[1:]:
        if arg.startswith("--markets"):
            if "=" in arg:
                market_filter = arg.split("=")[1].split(",")
            elif sys.argv.index(arg) + 1 < len(sys.argv):
                market_filter = sys.argv[sys.argv.index(arg) + 1].split(",")

    targets = {k: v for k, v in MARKET_CONFIG.items()
               if market_filter is None or k in market_filter}

    print(f"Generating {len(targets)} market pages...")

    # Fetch data
    print("Fetching Hyperliquid API data...")
    hl_data = fetch_hl_data()
    if not hl_data:
        print("[WARN] API failed, using cached data")
        hl_data = load_cached_data()
    if not hl_data:
        print("[ERROR] No data available (API failed and no cache)")
        sys.exit(1)

    print(f"  {len(hl_data)} markets fetched from API")

    # Generate pages
    generated = []
    for slug, cfg in targets.items():
        data = get_market_data(cfg["api_name"], cfg["dex"], hl_data)
        if data["price"] == 0:
            print(f"  [SKIP] {slug}: no price data")
            continue

        html = render_market_page(slug, cfg, data)
        out_dir = os.path.join(MARKETS_DIR, slug)
        out_path = os.path.join(out_dir, "index.html")

        if dry_run:
            print(f"  [DRY] {slug}: {len(html)} bytes")
        else:
            os.makedirs(out_dir, exist_ok=True)
            with open(out_path, "w") as f:
                f.write(html)
            print(f"  [OK] /markets/{slug}/ ({len(html):,} bytes)")

        generated.append(slug)

    # Generate markets/index.html
    if not dry_run and generated:
        index_html = render_markets_index(targets, hl_data)
        index_path = os.path.join(MARKETS_DIR, "index.html")
        os.makedirs(MARKETS_DIR, exist_ok=True)
        with open(index_path, "w") as f:
            f.write(index_html)
        print(f"  [OK] /markets/ index ({len(index_html):,} bytes)")

    # Update sitemap
    if not dry_run and generated:
        update_sitemap(generated)
        print(f"\nSitemap updated with {len(generated) + 1} market URLs")

    print(f"\nDone: {len(generated)} pages generated")


if __name__ == "__main__":
    main()
