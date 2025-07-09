#!/usr/bin/env python3

import subprocess
from pathlib import Path

def get_tags() -> list[str]:
    result = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True, check=True)
    return [tag.strip() for tag in result.stdout.splitlines() if tag.strip()]

def get_commits_between(start: str, end: str) -> list[str]:
    result = subprocess.run(
        ["git", "log", f"{start}..{end}", "--pretty=format:* %s (%an)"],
        capture_output=True, text=True, check=True
    )
    return list(dict.fromkeys(result.stdout.strip().splitlines()))  # dedup preserve order

def get_initial_commits(tag: str) -> list[str]:
    result = subprocess.run(
        ["git", "log", tag, "--pretty=format:* %s (%an)"],
        capture_output=True, text=True, check=True
    )
    return list(dict.fromkeys(result.stdout.strip().splitlines()))

def generate_changelog() -> str:
    tags = get_tags()
    if not tags:
        print("❌ No Git tags found.")
        return ""

    changelog = ["# Changelog\n"]
    seen_commits = set()

    for i in range(len(tags)):
        tag = tags[i]
        prev_tag = tags[i + 1] if i + 1 < len(tags) else None

        changelog.append(f"\n## {tag}")
        if prev_tag:
            commits = get_commits_between(prev_tag, tag)
        else:
            commits = get_initial_commits(tag)

        new_commits = [c for c in commits if c not in seen_commits]
        seen_commits.update(new_commits)

        if new_commits:
            changelog.extend(new_commits)
        else:
            changelog.append("* No unique commits")

    return "\n".join(changelog).strip() + "\n"

if __name__ == "__main__":
    changelog_content = generate_changelog()
    if changelog_content:
        Path("CHANGELOG.md").write_text(changelog_content, encoding="utf-8")
        print("✅ CHANGELOG.md generated (FILO, deduplicated).")
