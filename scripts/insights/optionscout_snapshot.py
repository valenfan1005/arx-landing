#!/usr/bin/env python3
"""
OptionScout Data Snapshot — Extracts key TradFi signals for the ARX
Market Insights pipeline.

Calls the OptionScout analysis script for SPY and extracts:
- VIX regime (level, percentile, term structure)
- Put/Call OI ratio + flow momentum
- OI wall (top concentration strikes)
- Fear & Greed index
- Institutional flow (tier breakdown)

Usage:
  python3 optionscout_snapshot.py [TICKER]  # default: SPY

Output: JSON to stdout, logs to stderr.

Requires: OptionScout tracker at ~/Documents/US Options Trading/optionscout-tracker/
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from typing import Any

LOG = lambda msg: print(
    "[%s] %s" % (datetime.now().strftime("%H:%M:%S"), msg),
    file=sys.stderr,
    flush=True,
)

OPTIONSCOUT_DIR = os.path.expanduser(
    "~/Documents/US Options Trading/optionscout-tracker"
)


def run_optionscout(ticker: str) -> dict[str, Any] | None:
    """Run OptionScout analysis and return parsed JSON."""
    LOG("Running OptionScout for %s..." % ticker)

    try:
        result = subprocess.run(
            [sys.executable, "-m", "server.scripts.option_analysis", ticker],
            cwd=OPTIONSCOUT_DIR,
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode != 0:
            LOG("OptionScout error: %s" % result.stderr[:500])
            return None

        return json.loads(result.stdout)

    except subprocess.TimeoutExpired:
        LOG("OptionScout timed out after 120s")
        return None
    except json.JSONDecodeError as e:
        LOG("Failed to parse OptionScout output: %s" % e)
        return None
    except FileNotFoundError:
        LOG("OptionScout not found at %s" % OPTIONSCOUT_DIR)
        return None


def extract_signals(data: dict[str, Any]) -> dict[str, Any]:
    """Extract the key TradFi signals from full OptionScout output."""
    signals: dict[str, Any] = {}

    # VIX Regime
    macro = data.get("macro", {})
    vix = macro.get("vix_regime", {})
    if vix:
        signals["vix"] = {
            "level": vix.get("level"),
            "percentile": vix.get("percentile"),
            "term_structure": vix.get("term_structure"),
            "vix_vix3m_ratio": vix.get("vix_vix3m_ratio"),
            "regime": vix.get("regime"),
        }

    # Market indicators
    indicators = macro.get("indicators", {})
    if indicators:
        signals["market_indicators"] = {}

        # Put/Call ratio
        pc = indicators.get("put_call_ratio", {})
        if pc:
            signals["market_indicators"]["put_call_ratio"] = {
                "value": pc.get("value"),
                "oi_flow_momentum": pc.get("oi_flow_momentum"),
                "signal": pc.get("signal"),
            }

        # Fear & Greed
        fg = indicators.get("fear_greed", {})
        if fg:
            signals["market_indicators"]["fear_greed"] = {
                "value": fg.get("value"),
                "label": fg.get("label"),
                "previous": fg.get("previous"),
            }

        # SKEW
        skew = indicators.get("skew", {})
        if skew:
            signals["market_indicators"]["skew"] = {
                "value": skew.get("value"),
                "signal": skew.get("signal"),
            }

        # Credit spreads
        credit = indicators.get("credit_spreads", {})
        if credit:
            signals["market_indicators"]["credit_spreads"] = {
                "value": credit.get("value"),
                "signal": credit.get("signal"),
            }

    # OI Wall
    oi_wall = data.get("oi_wall", {})
    if oi_wall:
        signals["oi_wall"] = {
            "top_put_strikes": oi_wall.get("top_put_strikes", [])[:5],
            "top_call_strikes": oi_wall.get("top_call_strikes", [])[:5],
            "gamma_wall": oi_wall.get("gamma_wall"),
            "zone_distribution": oi_wall.get("zone_distribution"),
        }

    # Unusual Activity
    unusual = data.get("unusual_activity", {})
    if unusual:
        trades = unusual.get("large_trades", [])
        signals["unusual_activity"] = {
            "count": len(trades),
            "top_trades": trades[:5],
            "smart_money_flow": unusual.get("smart_money_flow"),
            "institutional_tier": unusual.get("institutional_tier"),
        }

    # Capital Flow
    capital = data.get("capital", {})
    if capital:
        signals["capital_flow"] = {
            "main_direction": capital.get("main_direction"),
            "main_strength": capital.get("main_strength"),
            "tiers": {
                "super_large": capital.get("super_large"),
                "large": capital.get("large"),
                "medium": capital.get("medium"),
                "small": capital.get("small"),
            },
            "retail_vs_institutional": capital.get(
                "retail_vs_institutional"
            ),
        }

    # Index snapshot
    index_snap = data.get("index_snapshot", {})
    if index_snap:
        signals["index_snapshot"] = index_snap

    return signals


def main() -> None:
    ticker = sys.argv[1] if len(sys.argv) > 1 else "SPY"
    timestamp = datetime.now(timezone.utc).isoformat()

    # Run OptionScout
    raw_data = run_optionscout(ticker)
    if not raw_data:
        LOG("Failed to get OptionScout data")
        sys.exit(1)

    # Extract key signals
    signals = extract_signals(raw_data)
    LOG("Extracted signals: %s" % ", ".join(signals.keys()))

    # Build snapshot
    snapshot = {
        "timestamp": timestamp,
        "ticker": ticker,
        "signals": signals,
    }

    json.dump(snapshot, sys.stdout, indent=2)
    print()
    LOG("Snapshot complete for %s" % ticker)


if __name__ == "__main__":
    main()
