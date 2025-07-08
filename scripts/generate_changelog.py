#!/usr/bin/env python3

import subprocess
import re
from pathlib import Path

def get_tags():
    tags = subprocess.run(["git", "tag", "--sort=creatordate"], capture_output=True, text=True)
    return [tag.strip() for tag in tags.stdout.splitlines() if tag.strip()]

def get_commits_between(start, end):
    log = subprocess.run(["git", "log", f"{start}..{end}", "--pretty=format:* %s (%an)"], capture_output=True, text=True)
    return log.stdout.strip()

def generate_changelog():
    tags = get_tags()
    if not tags:
        print("No tags found.")
        return

    changelog = ["# Changelog\n"]

    for i in range(len(tags)):
        current_tag = tags[i]
        previous_tag = tags[i - 1] if i > 0 else ""
        title = f"\n## {current_tag}\n"
        commits = get_commits_between(previous_tag, current_tag) if previous_tag else subprocess.run(
            ["git", "log", f"{current_tag}", "--pretty=format:* %s (%an)"],
            capture_output=True, text=True).stdout.strip()

        changelog.append(title)
        changelog.append(commits if commits else "* No commits")
        changelog.append("")

    return "\n".join(changelog)

if __name__ == "__main__":
    changelog_content = generate_changelog()
    Path("CHANGELOG.md").write_text(changelog_content.strip() + "\n")
    print("✅ CHANGELOG.md generated from Git tag history.")
