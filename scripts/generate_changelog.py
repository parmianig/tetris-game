#!/usr/bin/env python3

import subprocess
from pathlib import Path
from typing import List, Tuple

CHANGELOG_FILE = Path("CHANGELOG.md")

def get_tags() -> List[str]:
    result = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True, check=True)
    return result.stdout.strip().splitlines()[::-1]  # newest first

def get_commits_between(prev: str, curr: str) -> List[str]:
    commit_range = f"{prev}..{curr}" if prev else curr
    result = subprocess.run(
        ["git", "log", commit_range, "--pretty=format:%H|%s (%an)"],
        capture_output=True, text=True, check=True
    )
    lines = result.stdout.strip().splitlines()
    return lines

def generate_changelog() -> str:
    tags = get_tags()
    seen_hashes = set()
    changelog_sections = []

    for i, curr_tag in enumerate(tags):
        prev_tag = tags[i + 1] if i + 1 < len(tags) else None
        raw_commits = get_commits_between(prev_tag, curr_tag)
        filtered_commits = []

        for line in raw_commits:
            commit_hash, message = line.split("|", 1)
            if commit_hash not in seen_hashes:
                filtered_commits.append(f"* {message.strip()}")
                seen_hashes.add(commit_hash)

        if filtered_commits:
            section = f"## {curr_tag}\n" + "\n".join(filtered_commits)
            changelog_sections.append(section)

    return "# Changelog\n\n" + "\n\n".join(changelog_sections)

def main():
    output = generate_changelog()
    CHANGELOG_FILE.write_text(output + "\n")
    print("✅ CHANGELOG.md updated (deduplicated, ordered, isolated by tag).")

if __name__ == "__main__":
    main()
