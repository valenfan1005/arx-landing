#!/usr/bin/env python3
"""
Hyperliquid Market Data Snapshot — Collects OI, funding rates, prices,
and whale positioning for the ARX Market Insights pipeline.

Usage:
  python3 hl_data_snapshot.py

Output: JSON to stdout (redirect to file), logs to stderr.
"""

import json
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any

API_URL = "https://api.hyperliquid.xyz/info"

LOG = lambda msg: print(
    "[%s] %s" % (datetime.now().strftime("%H:%M:%S"), msg),
    file=sys.stderr,
    flush=True,
)

# RWA + major crypto markets to track
TRACKED_MARKETS = [
    "BTC", "ETH", "SOL", "HYPE",
    "GOLD", "SILVER", "WTIOIL", "kSP500", "kTSLA",
]


def api_post(payload: dict[str, Any]) -> Any:
    """POST to Hyperliquid info API."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        API_URL,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        LOG("HTTP error %d" % e.code)
        return None
    except Exception as e:
        LOG("API error: %s" % e)
        return None


def fetch_market_data() -> dict[str, dict]:
    """Fetch OI, funding, price for all perp markets."""
    LOG("Fetching metaAndAssetCtxs...")
    result = api_post({"type": "metaAndAssetCtxs"})
    if not result or len(result) < 2:
        LOG("Failed to fetch market data")
        return {}

    meta = result[0]  # universe metadata
    ctxs = result[1]  # asset contexts

    universe = meta.get("universe", [])
    markets: dict[str, dict] = {}

    for i, asset in enumerate(universe):
        name = asset.get("name", "")
        if i >= len(ctxs):
            break
        ctx = ctxs[i]

        # Hyperliquid's `funding` field is the HOURLY funding rate (HL pays
        # funding every hour, unlike Binance/Bybit which pay every 8h). We
        # store the raw hourly value and derive the 8h figure on output so
        # that industry-standard comparisons (most traders think in 8h
        # terms) display correctly.
        markets[name] = {
            "mark_price": float(ctx.get("markPx", 0)),
            "open_interest": float(ctx.get("openInterest", 0)),
            "funding_rate_hourly": float(ctx.get("funding", 0)),
            "volume_24h": float(ctx.get("dayNtlVlm", 0)),
            "prev_day_price": float(ctx.get("prevDayPx", 0)),
        }

        # Calculate price change %
        prev = markets[name]["prev_day_price"]
        mark = markets[name]["mark_price"]
        if prev > 0:
            markets[name]["price_change_24h_pct"] = round(
                ((mark - prev) / prev) * 100, 2
            )
        else:
            markets[name]["price_change_24h_pct"] = 0.0

    LOG("Got %d markets" % len(markets))
    return markets


def filter_tracked_markets(
    all_markets: dict[str, dict],
) -> dict[str, dict]:
    """Filter to our tracked markets only."""
    tracked: dict[str, dict] = {}
    for name in TRACKED_MARKETS:
        if name in all_markets:
            tracked[name] = all_markets[name]
        else:
            LOG("Market %s not found in response" % name)
    return tracked


def find_notable_moves(all_markets: dict[str, dict]) -> list[dict]:
    """Find markets with extreme OI, funding, or price moves."""
    notable: list[dict] = []

    for name, data in all_markets.items():
        hourly = data.get("funding_rate_hourly", 0)
        oi = data.get("open_interest", 0)
        vol = data.get("volume_24h", 0)
        change = data.get("price_change_24h_pct", 0)

        # Extreme funding: threshold is 0.05% per 8h (industry convention).
        # Hourly equivalent = 0.05% / 8 = 0.00625% = 6.25e-5 raw.
        if abs(hourly) > 6.25e-5:
            notable.append({
                "type": "extreme_funding",
                "market": name,
                "funding_8h": round(hourly * 8 * 100, 4),
                "annualized": round(hourly * 24 * 365 * 100, 1),
            })

        # Large price move (>5%)
        if abs(change) > 5:
            notable.append({
                "type": "large_price_move",
                "market": name,
                "change_pct": change,
                "volume_24h": round(vol, 0),
            })

        # High OI concentration (>$500M)
        mark = data.get("mark_price", 0)
        oi_usd = oi * mark
        if oi_usd > 500_000_000:
            notable.append({
                "type": "high_oi",
                "market": name,
                "oi_usd": round(oi_usd, 0),
                "volume_24h": round(vol, 0),
            })

    return notable


def main() -> None:
    LOG("Starting Hyperliquid data snapshot...")
    timestamp = datetime.now(timezone.utc).isoformat()

    # Fetch all market data
    all_markets = fetch_market_data()
    if not all_markets:
        LOG("No market data available")
        sys.exit(1)

    # Filter to tracked markets
    tracked = filter_tracked_markets(all_markets)

    # Find notable moves across ALL markets
    notable = find_notable_moves(all_markets)
    LOG("Found %d notable moves" % len(notable))

    # Build snapshot
    snapshot = {
        "timestamp": timestamp,
        "markets": {},
        "notable_moves": notable,
        "summary": {
            "total_markets": len(all_markets),
            "tracked_markets": len(tracked),
            "notable_count": len(notable),
        },
    }

    # Format tracked markets with readable values
    for name, data in tracked.items():
        mark = data.get("mark_price", 0)
        oi = data.get("open_interest", 0)
        snapshot["markets"][name] = {
            "price": round(mark, 2),
            "price_change_24h_pct": data.get("price_change_24h_pct", 0),
            "oi_contracts": round(oi, 2),
            "oi_usd": round(oi * mark, 0),
            "funding_8h_pct": round(
                data.get("funding_rate_hourly", 0) * 8 * 100, 4
            ),
            "funding_annualized_pct": round(
                data.get("funding_rate_hourly", 0) * 24 * 365 * 100, 2
            ),
            "volume_24h_usd": round(data.get("volume_24h", 0), 0),
        }

    # Output JSON
    json.dump(snapshot, sys.stdout, indent=2)
    print()  # trailing newline
    LOG("Snapshot complete")


if __name__ == "__main__":
    main()
