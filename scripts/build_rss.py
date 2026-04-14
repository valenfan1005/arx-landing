#!/usr/bin/env python3
"""
Generate RSS feed (feed.xml) from all blog posts.

Scans blog/*/index.html, extracts title + description + publish date,
and writes a valid RSS 2.0 feed sorted by date (newest first).

Usage:
    python3 build_rss.py              # regenerate feed.xml
    python3 build_rss.py --dry-run    # print to stdout instead

Called automatically by announce_new_posts.py after detecting new posts.
"""

import os
import re
import sys
from datetime import datetime
from email.utils import format_datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
BLOG_DIR = os.path.join(REPO_ROOT, "blog")
INSIGHTS_DIR = os.path.join(REPO_ROOT, "insights")
FEED_PATH = os.path.join(REPO_ROOT, "feed.xml")
BASE_URL = "https://arx.trade"


def extract_post_meta(slug, content_dir=None, url_prefix="blog"):
    """Extract title, description, and publish date from a blog post or insight."""
    if content_dir is None:
        content_dir = BLOG_DIR
    html_path = os.path.join(content_dir, slug, "index.html")
    if not os.path.isfile(html_path):
        return None

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read(8000)

    title_match = re.search(r"<title>(.+?)</title>", html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()
    # Clean HTML entities before stripping suffix
    title = title.replace("&mdash;", "—").replace("&ndash;", "–").replace("&amp;", "&")
    title = re.sub(r"\s*[—–-]\s*ARX\s*$", "", title)

    desc_match = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\'](.+?)["\']',
        html, re.DOTALL | re.IGNORECASE,
    )
    description = desc_match.group(1).strip() if desc_match else ""

    date_match = re.search(
        r'article:published_time["\']?\s+content=["\'](.+?)["\']',
        html, re.IGNORECASE,
    )
    pub_date = None
    if date_match:
        date_str = date_match.group(1).strip()
        try:
            pub_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            pass

    if pub_date is None:
        stat = os.stat(html_path)
        pub_date = datetime.fromtimestamp(stat.st_mtime)

    return {
        "slug": slug,
        "title": title,
        "description": description,
        "pub_date": pub_date,
        "url_prefix": url_prefix,
    }


def escape_xml(text):
    """Escape special XML characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def build_feed():
    """Scan all blog posts and insights, build the RSS XML."""
    posts = []
    # Scan blog posts
    for entry in os.listdir(BLOG_DIR):
        if entry == "index.html" or entry.startswith("."):
            continue
        meta = extract_post_meta(entry, BLOG_DIR, "blog")
        if meta:
            posts.append(meta)
    # Scan insights
    if os.path.isdir(INSIGHTS_DIR):
        for entry in os.listdir(INSIGHTS_DIR):
            if entry == "index.html" or entry.startswith("."):
                continue
            meta = extract_post_meta(entry, INSIGHTS_DIR, "insights")
            if meta:
                posts.append(meta)

    posts.sort(key=lambda p: p["pub_date"], reverse=True)

    now = format_datetime(datetime.utcnow())

    items = []
    for post in posts:
        url = "{}/{}/{}/".format(BASE_URL, post["url_prefix"], post["slug"])
        pub_rfc = format_datetime(post["pub_date"])
        items.append(
            "  <item>\n"
            "    <title>{title}</title>\n"
            "    <link>{url}</link>\n"
            '    <guid isPermaLink="true">{url}</guid>\n'
            "    <description>{desc}</description>\n"
            "    <pubDate>{date}</pubDate>\n"
            "  </item>".format(
                title=escape_xml(post["title"]),
                url=url,
                desc=escape_xml(post["description"]),
                date=pub_rfc,
            )
        )

    feed = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n'
        "<channel>\n"
        "  <title>ARX — Market Insights &amp; Trading Analysis</title>\n"
        "  <link>{base}/blog/</link>\n"
        "  <description>Insights on DeFi copy trading, market regime detection, "
        "wallet intelligence, and Hyperliquid. Stay ahead with ARX.</description>\n"
        "  <language>en</language>\n"
        '  <atom:link href="{base}/feed.xml" rel="self" type="application/rss+xml"/>\n'
        "  <lastBuildDate>{now}</lastBuildDate>\n"
        "  <image>\n"
        "    <url>{base}/logo.png</url>\n"
        "    <title>ARX Blog</title>\n"
        "    <link>{base}/blog/</link>\n"
        "  </image>\n\n"
        "{items}\n\n"
        "</channel>\n"
        "</rss>\n"
    ).format(base=BASE_URL, now=now, items="\n\n".join(items))

    return feed


def main():
    dry_run = "--dry-run" in sys.argv
    feed = build_feed()

    if dry_run:
        print(feed)
    else:
        with open(FEED_PATH, "w", encoding="utf-8") as f:
            f.write(feed)
        print("RSS feed written to {}".format(FEED_PATH))


if __name__ == "__main__":
    main()
