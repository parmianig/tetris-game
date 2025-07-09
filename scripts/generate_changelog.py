#!/usr/bin/env python3

import subprocess
from pathlib import Path

def run_git(args):
    return subprocess.run(["git"] + args, capture_output=True, text=True, check=True).stdout.strip()

def get_tags():
    return run_git(["tag", "--sort=creatordate", "--merged"]).splitlines()

def get_commits_between(from_ref, to_ref):
    range_expr = f"{from_ref}..{to_ref}" if from_ref else to_ref
    raw = run_git(["log", range_expr, "--pretty=format:%s (%an)"])
    return [line.strip() for line in raw.splitlines() if line.strip()]

def generate_changelog():
    tags = get_tags()
    changelog = ["# Changelog"]
    seen_messages = set()

    for i in range(len(tags)-1, -1, -1):  # newest tag last
        tag = tags[i]
        prev_tag = tags[i-1] if i > 0 else None
        commits = get_commits_between(prev_tag, tag)

        unique = []
        for message in commits:
            if message not in seen_messages:
                unique.append(f"* {message}")
                seen_messages.add(message)

        changelog.append(f"\n## {tag}")
        changelog.extend(unique if unique else ["* No unique changes"])

    Path("CHANGELOG.md").write_text("\n".join(changelog).strip() + "\n")
    print("✅ CHANGELOG.md generated with all tags, deduplicated per message.")

if __name__ == "__main__":
    generate_changelog()
