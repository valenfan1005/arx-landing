#!/usr/bin/env python3
"""
Auto-announce new ARX blog posts on Telegram + Discord.

Compares two git refs to find newly added blog/*/index.html files,
extracts title + description from the HTML, and sends announcements
to @ARX_Trade_Official (Telegram) and #announcements (Discord).

Usage:
    # Compare two commits (used by pre-push hook)
    python3 announce_new_posts.py <old_sha> <new_sha>

    # Compare last commit to its parent (manual use)
    python3 announce_new_posts.py

    # Dry run — show what would be sent without posting
    python3 announce_new_posts.py --dry-run

Environment:
    Uses stdlib only. Calls tg_push.py for Telegram delivery.
    Discord uses webhook API directly (no dependencies).
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
import urllib.error

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPT_DIR)
TG_PUSH = os.path.join(
    os.path.expanduser("~"),
    "Documents", "ARX", "Skills",
    "alpha-provider-scout", "scripts", "tg_push.py",
)
DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1486613902224527411/yVd427tfjYxLS75yeqCoyfIlOgRXoaoUCdKLyCPjDErFRJVYCRBDyO17vGsXWa-2cSkC"
BLOG_PATTERN = re.compile(r"^blog/([^/]+)/index\.html$")
BASE_URL = "https://arx.trade"


def git(*args):
    """Run a git command in the repo and return stdout."""
    result = subprocess.run(
        ["git", "-C", REPO_ROOT] + list(args),
        capture_output=True, text=True,
    )
    return result.stdout.strip()


def find_new_blog_posts(old_sha, new_sha):
    """Return list of blog slugs added between two commits."""
    diff_output = git("diff", "--name-only", "--diff-filter=A", old_sha, new_sha)
    if not diff_output:
        return []

    slugs = []
    for line in diff_output.splitlines():
        match = BLOG_PATTERN.match(line.strip())
        if match:
            slugs.append(match.group(1))
    return slugs


def extract_meta(slug):
    """Extract title and meta description from a blog post's HTML."""
    html_path = os.path.join(REPO_ROOT, "blog", slug, "index.html")
    if not os.path.exists(html_path):
        return None, None

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read(8000)  # only need the <head>

    title_match = re.search(r"<title>(.+?)</title>", html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else slug.replace("-", " ").title()

    # Remove " — ARX" suffix from title for cleaner message
    title = re.sub(r"\s*[—–-]\s*ARX\s*$", "", title)

    desc_match = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\'](.+?)["\']',
        html, re.DOTALL | re.IGNORECASE,
    )
    description = desc_match.group(1).strip() if desc_match else ""

    return title, description


def build_message(slug, title, description):
    """Build the Telegram announcement message in HTML format."""
    url = "{}/blog/{}/".format(BASE_URL, slug)
    parts = [
        '\U0001f4dd <b>New on the ARX Blog</b>',
        '',
        '<b>{}</b>'.format(title),
    ]
    if description:
        parts.append('')
        parts.append(description)
    parts.append('')
    parts.append('\U0001f449 <a href="{}">Read now</a>'.format(url))
    return '\n'.join(parts)


def send_telegram(message, dry_run=False):
    """Send message via tg_push.py. Returns True on success."""
    if dry_run:
        print("[DRY RUN] Telegram:\n{}\n".format(message))
        return True

    if not os.path.exists(TG_PUSH):
        print("ERROR: tg_push.py not found at {}".format(TG_PUSH), file=sys.stderr)
        return False

    result = subprocess.run(
        [sys.executable, TG_PUSH, "send", "--html", message],
        capture_output=True, text=True,
    )
    if result.returncode == 0:
        print("Telegram: announced successfully")
        return True
    else:
        print("Telegram: send failed — {}".format(result.stderr.strip()), file=sys.stderr)
        return False


def send_discord(slug, title, description, dry_run=False):
    """Send a rich embed to Discord via webhook. Returns True on success."""
    url = "{}/blog/{}/".format(BASE_URL, slug)
    embed = {
        "title": title,
        "description": description,
        "url": url,
        "color": 0x7C3AED,  # ARX purple
        "footer": {"text": "ARX Blog"},
        "author": {
            "name": "New on the ARX Blog",
            "url": "{}/blog/".format(BASE_URL),
        },
    }
    payload = {
        "username": "ARX Blog",
        "embeds": [embed],
    }

    if dry_run:
        print("[DRY RUN] Discord embed: {} — {}".format(title, url))
        return True

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        DISCORD_WEBHOOK,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "ARX-Blog-Bot/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            if resp.status in (200, 204):
                print("Discord: announced successfully")
                return True
            print("Discord: unexpected status {}".format(resp.status), file=sys.stderr)
            return False
    except urllib.error.HTTPError as e:
        print("Discord: HTTP {} — {}".format(e.code, e.read().decode("utf-8", errors="replace")), file=sys.stderr)
        return False
    except Exception as e:
        print("Discord: failed — {}".format(e), file=sys.stderr)
        return False


def main():
    dry_run = "--dry-run" in sys.argv
    args = [a for a in sys.argv[1:] if not a.startswith("--")]

    if len(args) >= 2:
        old_sha, new_sha = args[0], args[1]
    else:
        # Default: compare HEAD to its parent
        old_sha = "HEAD~1"
        new_sha = "HEAD"

    slugs = find_new_blog_posts(old_sha, new_sha)

    if not slugs:
        print("No new blog posts found.")
        return

    print("Found {} new blog post(s): {}".format(len(slugs), ", ".join(slugs)))

    # Regenerate RSS feed to include new posts
    build_rss = os.path.join(SCRIPT_DIR, "build_rss.py")
    if os.path.exists(build_rss):
        subprocess.run([sys.executable, build_rss], capture_output=True)
        print("RSS feed regenerated")

    for slug in slugs:
        title, description = extract_meta(slug)
        if not title:
            print("Skipping {} — could not extract title".format(slug), file=sys.stderr)
            continue

        message = build_message(slug, title, description)
        send_telegram(message, dry_run=dry_run)
        send_discord(slug, title, description, dry_run=dry_run)


if __name__ == "__main__":
    main()
