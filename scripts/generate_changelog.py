#!/usr/bin/env python3

import subprocess
from pathlib import Path
from typing import List, Tuple, Set

def get_tags() -> List[str]:
    result = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True, check=True)
    return result.stdout.strip().splitlines()

def get_commits_between(prev_tag: str, tag: str) -> List[Tuple[str, str]]:
    range_expr = f"{prev_tag}..{tag}" if prev_tag else tag
    result = subprocess.run(
        ["git", "log", range_expr, "--pretty=format:%H|%s (%an)"],
        capture_output=True, text=True, check=True
    )
    lines = result.stdout.strip().splitlines()
    return [(line.split("|")[0], line.split("|", 1)[1]) for line in lines if "|" in line]

def read_existing_hashes(changelog_path: Path) -> Set[str]:
    if not changelog_path.exists():
        return set()
    hashes = set()
    for line in changelog_path.read_text().splitlines():
        if line.startswith("* ") and line.count("(") >= 1:
            commit_msg = line.strip()
            # You could encode message+author if hashes not available
            hashes.add(commit_msg)
    return hashes

def build_changelog() -> str:
    tags = get_tags()
    if not tags:
        return "# Changelog\n\n_No tags found._"

    changelog_sections = []
    seen_commits = set()

    for i, tag in enumerate(tags):
        prev_tag = tags[i + 1] if i + 1 < len(tags) else ""
        commits = get_commits_between(prev_tag, tag)

        unique_commits = []
        for commit_hash, message in commits:
            if commit_hash not in seen_commits:
                unique_commits.append(f"* {message}")
                seen_commits.add(commit_hash)

        if unique_commits:
            section = f"## {tag}\n" + "\n".join(unique_commits)
            changelog_sections.append(section)

    return "# Changelog\n\n" + "\n\n".join(changelog_sections)

def write_changelog():
    new_changelog = build_changelog()
    Path("CHANGELOG.md").write_text(new_changelog + "\n")
    print("✅ CHANGELOG.md regenerated with FILO order and deduplicated commits.")

if __name__ == "__main__":
    write_changelog()
