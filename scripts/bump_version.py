#!/usr/bin/env python3

import sys
import subprocess
import re
import json
import argparse
from pathlib import Path

TAG_PREFIX = "release/v"

def bump_version(version: str, part: str) -> str:
    major, minor, patch = map(int, version.strip().split('.'))
    return {
        "major": f"{major + 1}.0.0",
        "minor": f"{major}.{minor + 1}.0",
        "patch": f"{major}.{minor}.{patch + 1}"
    }[part]

def get_version_file(component: str) -> Path:
    return {
        "frontend": Path("frontend/VERSION"),
        "backend": Path("backend/VERSION"),
        "app": Path("VERSION")
    }.get(component)

def check_tag_exists(tag: str) -> bool:
    return subprocess.run(
        ["git", "rev-parse", "--quiet", "--verify", tag],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ).returncode == 0

def generate_changelog(tag: str, dry_run: bool) -> str:
    try:
        tags = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True)
        tag_list = tags.stdout.strip().splitlines()
        previous_tag = tag_list[1] if len(tag_list) > 1 else None
        range_ref = f"{previous_tag}..HEAD" if previous_tag else "HEAD"
        log = subprocess.run(["git", "log", range_ref, "--pretty=format:* %s (%an)"],
                             capture_output=True, text=True)
        changelog_content = f"# Changelog\n\n## {tag}\n{log.stdout.strip()}\n"
        if not dry_run:
            Path("CHANGELOG.md").write_text(changelog_content)
        return "generated" if not dry_run else "dry-run"
    except Exception as e:
        return f"error: {str(e)}"

def update_readme_versions(dry_run: bool) -> str:
    if dry_run:
        return "dry-run"
    for name, file in [("APP_VERSION", "VERSION"),
                       ("FRONTEND_VERSION", "frontend/VERSION"),
                       ("BACKEND_VERSION", "backend/VERSION")]:
        version = Path(file).read_text().strip()
        subprocess.run(["sed", "-i", "", f"s/{name}: .*/{name}: {version}/", "README.md"])
    return "updated"

def create_git_tag(tag: str, dry_run: bool, msg: str) -> str:
    if dry_run:
        return "dry-run"
    try:
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", msg], check=True)
        subprocess.run(["git", "tag", tag], check=True)
        return "created"
    except subprocess.CalledProcessError as e:
        return f"error: {e}"

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("bump", choices=["patch", "minor", "major"])
    parser.add_argument("component", choices=["frontend", "backend", "app"])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--msg", default="chore: version bump", help="Git commit message")
    parser.add_argument("--tag", action="store_true")
    return parser.parse_args()

def apply_version_changes(component: str, new_version: str, dry_run: bool, result: dict):
    version_file = get_version_file(component)
    if not dry_run:
        version_file.write_text(new_version + "\n")

    if component == "frontend":
        pkg = Path("frontend/package.json")
        if pkg.exists():
            pkg_json = re.sub(r'"version":\s*"\d+\.\d+\.\d+"',
                              f'"version": "{new_version}"',
                              pkg.read_text())
            if not dry_run:
                pkg.write_text(pkg_json)
            result["sync_package_json"] = "written" if not dry_run else "dry-run"
            result["sync"]["frontend/package.json"] = result["sync_package_json"]

def finalize_and_report(result: dict):
    for comp, path in [("frontend", "frontend/VERSION"),
                       ("backend", "backend/VERSION"),
                       ("app", "VERSION")]:
        if Path(path).exists():
            result["resolved_versions"][comp] = Path(path).read_text().strip()
    print(json.dumps(result, indent=2))

def main():
    args = parse_args()
    result = {
        "dry_run": args.dry_run,
        "component": args.component,
        "version_bump": {},
        "sync": {},
        "sync_package_json": None,
        "changelog": {"status": "skipped"},
        "git_tag": None,
        "readme_versions": "skipped",
        "resolved_versions": {}
    }

    version_file = get_version_file(args.component)
    if not version_file or not version_file.exists():
        print(json.dumps({"error": f"Invalid or missing version file for {args.component}"}))
        sys.exit(1)

    current_version = version_file.read_text().strip()
    if not re.match(r"^\d+\.\d+\.\d+$", current_version):
        print(json.dumps({"error": f"Invalid version format: {current_version}"}))
        sys.exit(1)

    new_version = bump_version(current_version, args.bump)
    tag = f"{TAG_PREFIX}{new_version}"

    if check_tag_exists(tag):
        print(json.dumps({"error": f"Tag '{tag}' already exists. Please bump again."}))
        sys.exit(1)

    result["version_bump"] = {
        "from": current_version,
        "to": new_version,
        "file": str(version_file),
        "status": "dry-run" if args.dry_run else "written"
    }

    apply_version_changes(args.component, new_version, args.dry_run, result)
    result["changelog"]["status"] = generate_changelog(tag, args.dry_run)
    result["readme_versions"] = update_readme_versions(args.dry_run)

    if args.tag:
        result["git_tag"] = create_git_tag(tag, args.dry_run, args.msg)

    finalize_and_report(result)

if __name__ == "__main__":
    main()
