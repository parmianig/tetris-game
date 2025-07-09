#!/usr/bin/env python3

import subprocess
from pathlib import Path

def get_tags() -> list[str]:
    result = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True, check=True)
    return [tag.strip() for tag in result.stdout.splitlines() if tag.strip()]

def get_tag_parent(tag: str) -> str:
    result = subprocess.run(["git", "rev-list", "--parents", "-n", "1", tag], capture_output=True, text=True, check=True)
    parts = result.stdout.strip().split()
    return parts[1] if len(parts) > 1 else ""

def get_commits_between(start: str, end: str) -> list[str]:
    result = subprocess.run(
        ["git", "log", f"{start}..{end}", "--pretty=format:* %s (%an)"],
        capture_output=True, text=True, check=True
    )
    return result.stdout.strip().splitlines()

def generate_changelog() -> str:
    tags = get_tags()
    if not tags:
        return "# Changelog\n\n_No tags found._\n"

    changelog = ["# Changelog\n"]
    seen_commits = set()

    for tag in tags:
        parent = get_tag_parent(tag)
        if parent:
            commits = get_commits_between(parent, tag)
        else:
            # Fallback: only this commit
            commits = [subprocess.run(
                ["git", "log", "-n", "1", tag, "--pretty=format:* %s (%an)"],
                capture_output=True, text=True).stdout.strip()]

        unique_commits = [c for c in commits if c and c not in seen_commits]
        if not unique_commits:
            continue

        changelog.append(f"\n## {tag}")
        changelog.extend(unique_commits)
        seen_commits.update(unique_commits)

    return "\n".join(changelog).strip() + "\n"

if __name__ == "__main__":
    content = generate_changelog()
    Path("CHANGELOG.md").write_text(content, encoding="utf-8")
    print("✅ CHANGELOG.md regenerated (dedup + FILO).")
