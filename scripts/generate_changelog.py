#!/usr/bin/env python3

import subprocess
from pathlib import Path

def git_log(args):
    return subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        check=True
    ).stdout.strip()

def get_tags() -> list:
    return git_log(["tag", "--sort=-creatordate"]).splitlines()

def get_commits_range(from_ref: str, to_ref: str) -> list:
    range_spec = f"{from_ref}..{to_ref}" if from_ref else to_ref
    lines = git_log(["log", range_spec, "--pretty=format:%H|%s (%an)"]).splitlines()
    return lines

def generate_changelog():
    tags = get_tags()
    changelog = ["# Changelog"]
    seen_hashes = set()

    for i, tag in enumerate(tags):
        prev_tag = tags[i + 1] if i + 1 < len(tags) else None
        raw_commits = get_commits_range(prev_tag, tag)

        entries = []
        for line in raw_commits:
            commit_hash, message = line.split("|", 1)
            if commit_hash not in seen_hashes:
                seen_hashes.add(commit_hash)
                entries.append(f"* {message.strip()}")

        if entries:
            changelog.append(f"\n## {tag}")
            changelog.extend(entries)

    Path("CHANGELOG.md").write_text("\n".join(changelog) + "\n")
    print("✅ CHANGELOG.md regenerated cleanly (FILO, deduplicated)")

if __name__ == "__main__":
    generate_changelog()
