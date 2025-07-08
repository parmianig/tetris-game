#!/usr/bin/env python3

import sys
import subprocess
import re
import json
from pathlib import Path

TAG_PREFIX = "release/v"

def bump_version(version: str, part: str) -> str:
    major, minor, patch = map(int, version.strip().split('.'))
    if part == "major":
        return f"{major + 1}.0.0"
    elif part == "minor":
        return f"{major}.{minor + 1}.0"
    elif part == "patch":
        return f"{major}.{minor}.{patch + 1}"
    else:
        raise ValueError("Invalid bump type")

def get_version_file(component: str) -> Path:
    return {
        "frontend": Path("frontend/VERSION"),
        "backend": Path("backend/VERSION"),
        "app": Path("VERSION")
    }.get(component)

def check_tag_exists(tag: str) -> bool:
    result = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", tag],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    return result.returncode == 0

def generate_changelog(tag: str, dry_run: bool) -> str:
    try:
        tags = subprocess.run(["git", "tag", "--sort=-creatordate"], capture_output=True, text=True)
        tag_list = tags.stdout.strip().splitlines()
        previous_tag = tag_list[1] if len(tag_list) > 1 else None

        if previous_tag:
            log = subprocess.run(["git", "log", f"{previous_tag}..HEAD", "--pretty=format:* %s (%an)"],
                                 capture_output=True, text=True)
        else:
            log = subprocess.run(["git", "log", "--pretty=format:* %s (%an)"],
                                 capture_output=True, text=True)

        content = f"# Changelog\n\n## {tag}\n{log.stdout.strip()}\n"
        if not dry_run:
            Path("CHANGELOG.md").write_text(content)
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

def create_git_tag(tag: str, dry_run: bool) -> str:
    if dry_run:
        return "dry-run"
    try:
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", f"chore: release {tag}"], check=True)
        subprocess.run(["git", "tag", tag], check=True)
        return "created"
    except subprocess.CalledProcessError as e:
        return f"error: {e}"

def main():
    if len(sys.argv) < 3:
        print("Usage: bump_version.py [patch|minor|major] [frontend|backend|app] [--dry-run] [--tag]")
        sys.exit(1)

    part = sys.argv[1]
    component = sys.argv[2]
    dry_run = "--dry-run" in sys.argv
    create_tag = "--tag" in sys.argv

    version_file = get_version_file(component)
    if not version_file or not version_file.exists():
        print(json.dumps({"error": f"Invalid or missing version file for {component}"}))
        sys.exit(1)

    current_version = version_file.read_text().strip()
    if not re.match(r"^\d+\.\d+\.\d+$", current_version):
        print(json.dumps({"error": f"Invalid version format: {current_version}"}))
        sys.exit(1)

    new_version = bump_version(current_version, part)
    tag = f"{TAG_PREFIX}{new_version}"

    if check_tag_exists(tag):
        print(json.dumps({"error": f"Tag '{tag}' already exists. Please bump again."}))
        sys.exit(1)

    result = {
        "dry_run": dry_run,
        "component": component,
        "version_bump": {
            "from": current_version,
            "to": new_version,
            "file": str(version_file),
            "status": "dry-run" if dry_run else "written"
        },
        "sync": {},
        "sync_package_json": None,
        "changelog": {"status": "skipped"},
        "git_tag": None,
        "readme_versions": "skipped",
        "resolved_versions": {}
    }

    if not dry_run:
        version_file.write_text(new_version + "\n")

    if component == "frontend":
        pkg = Path("frontend/package.json")
        if pkg.exists():
            updated = re.sub(r'"version":\s*"\d+\.\d+\.\d+"',
                             f'"version": "{new_version}"',
                             pkg.read_text())
            if not dry_run:
                pkg.write_text(updated)
            result["sync_package_json"] = "written" if not dry_run else "dry-run"
            result["sync"]["frontend/package.json"] = result["sync_package_json"]

    result["changelog"]["status"] = generate_changelog(tag, dry_run)
    result["readme_versions"] = update_readme_versions(dry_run)

    if create_tag:
        result["git_tag"] = create_git_tag(tag, dry_run)

    result["resolved_versions"] = {
        "frontend": Path("frontend/VERSION").read_text().strip() if Path("frontend/VERSION").exists() else None,
        "backend": Path("backend/VERSION").read_text().strip() if Path("backend/VERSION").exists() else None,
        "app": Path("VERSION").read_text().strip() if Path("VERSION").exists() else None
    }

    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
