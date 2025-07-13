#!/usr/bin/env python3

import sys
import subprocess
import re
import json
import argparse
from pathlib import Path

TAG_PREFIX = "release/v"
DEBUG = False
FRONTEND_VERSION_PATH = "frontend/VERSION"
BACKEND_VERSION_PATH = "backend/VERSION"

def debug(msg: str):
    if DEBUG:
        print(f"[DEBUG] {msg}")

def bump_version(version: str, part: str) -> str:
    major, minor, patch = map(int, version.strip().split('.'))
    return {
        "major": f"{major + 1}.0.0",
        "minor": f"{major}.{minor + 1}.0",
        "patch": f"{major}.{minor}.{patch + 1}"
    }[part]

def get_version_file(component: str) -> Path:
    return {
        "frontend": Path(FRONTEND_VERSION_PATH),
        "backend": Path(BACKEND_VERSION_PATH),
        "app": Path("VERSION")
    }.get(component)

def check_tag_exists(tag: str) -> bool:
    exists = subprocess.run(
        ["git", "rev-parse", "--quiet", "--verify", tag],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ).returncode == 0
    debug(f"Tag '{tag}' exists: {exists}")
    return exists

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
                       ("FRONTEND_VERSION", FRONTEND_VERSION_PATH),
                       ("BACKEND_VERSION", BACKEND_VERSION_PATH)]:
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

def detect_changed_components() -> set:
    changed = subprocess.run(
        ["git", "status", "--porcelain"],
        capture_output=True, text=True
    ).stdout.strip().splitlines()

    components = set()
    for line in changed:
        filepath = line[3:]
        # NEW LOGIC: everything not in frontend/ or backend/ is considered "app"
        if filepath.startswith("frontend/"):
            components.add("frontend")
        elif filepath.startswith("backend/"):
            components.add("backend")
        elif not filepath.startswith("frontend/") and not filepath.startswith("backend/"):
            components.add("app")
    debug(f"Changed components: {components}")
    return components

def apply_version_changes(component: str, new_version: str, dry_run: bool, result: dict):
    version_file = get_version_file(component)
    if not dry_run:
        version_file.write_text(new_version + "\n")

    if component == "frontend":
        pkg = Path("frontend/package.json")
        if pkg.exists():
            # FIXED REGEX here!
            pkg_json = re.sub(r'"version":\s*"\d+\.\d+\.\d+"',
                              f'"version": "{new_version}"',
                              pkg.read_text())
            if not dry_run:
                pkg.write_text(pkg_json)
            result["sync_package_json"] = "written" if not dry_run else "dry-run"
            result["sync"]["frontend/package.json"] = result["sync_package_json"]

def bump_component_version(component: str, bump_type: str, dry_run: bool, result: dict) -> str:
    version_file = get_version_file(component)
    if not version_file or not version_file.exists():
        print(json.dumps({"error": f"Missing VERSION file for {component}"}))
        sys.exit(1)

    current_version = version_file.read_text().strip()
    if not re.match(r"^\d+\.\d+\.\d+$", current_version):
        print(json.dumps({"error": f"Invalid version format: {current_version}"}))
        sys.exit(1)

    new_version = bump_version(current_version, bump_type)
    tag = f"{TAG_PREFIX}{new_version}"

    while check_tag_exists(tag):
        debug(f"Tag '{tag}' already exists. Incrementing...")
        current_version = new_version
        new_version = bump_version(current_version, bump_type)
        tag = f"{TAG_PREFIX}{new_version}"

    result["version_bump"][component] = {
        "from": current_version,
        "to": new_version,
        "file": str(version_file),
        "status": "dry-run" if dry_run else "written"
    }

    apply_version_changes(component, new_version, dry_run, result)
    return new_version

def smart_bump(bump_type: str, dry_run: bool, result: dict):
    changed = detect_changed_components()
    components_to_bump = set()

    # If FE changes, bump FE and app
    if "frontend" in changed:
        components_to_bump.update(["frontend", "app"])
    # If BE changes, bump BE and app
    if "backend" in changed:
        components_to_bump.update(["backend", "app"])
    # If only app changes, bump app
    if "app" in changed and not ("frontend" in changed or "backend" in changed):
        components_to_bump.add("app")

    debug(f"Bumping components: {components_to_bump}")
    bumped_versions = {}
    for component in sorted(components_to_bump):
        bumped_versions[component] = bump_component_version(component, bump_type, dry_run, result)

    return bumped_versions

def finalize_and_report(result: dict):
    print("\n===== VERSION SUMMARY =====")
    for comp, path in [("frontend", FRONTEND_VERSION_PATH),
                       ("backend", BACKEND_VERSION_PATH),
                       ("app", "VERSION")]:
        if Path(path).exists():
            version = Path(path).read_text().strip()
            print(f"{comp:>8}: {version}")
            result["resolved_versions"][comp] = version
    print(json.dumps(result, indent=2))

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("bump", choices=["patch", "minor", "major"])
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--debug", action="store_true")
    parser.add_argument("--msg", default="chore: version bump", help="Git commit message")
    parser.add_argument("--tag", action="store_true")
    return parser.parse_args()

def main():
    global DEBUG
    args = parse_args()
    DEBUG = args.debug

    result = {
        "dry_run": args.dry_run,
        "component": "auto",
        "version_bump": {},
        "sync": {},
        "sync_package_json": None,
        "changelog": {"status": "skipped"},
        "git_tag": None,
        "readme_versions": "skipped",
        "resolved_versions": {}
    }

    bumped_versions = smart_bump(args.bump, args.dry_run, result)

    if "app" in bumped_versions:
        app_tag = f"{TAG_PREFIX}{bumped_versions['app']}"
        result["changelog"]["status"] = generate_changelog(app_tag, args.dry_run)
        result["readme_versions"] = update_readme_versions(args.dry_run)
        if args.tag:
            result["git_tag"] = create_git_tag(app_tag, args.dry_run, args.msg)

    finalize_and_report(result)

if __name__ == "__main__":
    main()
