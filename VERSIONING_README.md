# 🧭 Project Versioning Guide

This project uses **semantic versioning** (`MAJOR.MINOR.PATCH`) for managing versions of:
- The overall application
- The frontend
- The backend

All versioning logic is centralized through the `Makefile`, with clear rules and automation to prevent mistakes.

---

## 📁 Version Files (Source of Truth)

| Scope     | Path              | Used For                                |
|-----------|-------------------|-----------------------------------------|
| App       | `VERSION`         | Central/global version of the project   |
| Frontend  | `frontend/VERSION`| Version of the frontend module          |
| Backend   | `backend/VERSION` | Version of the backend module           |

> 🧠 These files are considered the **source of truth** for versioning.

---

## 🔧 Setup Instructions

1. **Install the Git pre-commit hook**
   ```bash
   make bootstrap
   ```

2. **Install project dependencies**
   ```bash
   make install-all
   ```

3. **You're ready to work!**

---

## 🧱 Bumping Versions

Each of these will:

- Update `frontend/VERSION`
- Automatically call `make version-commit`
- Sync the version across all version files (`VERSION`, `backend/VERSION`, etc.)
- Update `frontend/package.json`
- Generate a `CHANGELOG.md`
- Commit and tag the release

```bash
make version-patch   # v0.1.0 → v0.1.1
make version-minor   # v0.1.0 → v0.2.0
make version-major   # v0.1.0 → v1.0.0
```

---

## 🔍 Pre-commit Hook Validation

Before every commit, the pre-commit hook validates version changes.

| Code Changed                    | Required Version Bump File      |
|---------------------------------|----------------------------------|
| Files under `frontend/`         | `frontend/VERSION`               |
| Files under `backend/`          | `backend/VERSION`                |
| `VERSION`, `Makefile`, `k8s/`   | `VERSION`                        |

If a change is made but the corresponding version is not bumped, the commit will be **blocked**.

---

## 🔄 Manual Version Sync

If you manually edit `frontend/VERSION`, ensure all other version files are updated:

```bash
make version-set
```

This updates:

- `frontend/package.json`
- `backend/VERSION`
- `VERSION`

---

## 📄 Show Current Versions

Use the following command to print all versions:

```bash
make version-show
```

Output:
```
📦 App Version:      0.1.2
📦 Backend Version:  0.1.2
📦 Frontend Version: 0.1.2
```

---

## 📝 Generate Changelog (Manual)

If needed:

```bash
make changelog
```

It creates a `CHANGELOG.md` based on all Git commits since the last tag.

---

## 🛠️ Related Files

| File Path                | Purpose                           |
|--------------------------|-----------------------------------|
| `.hooks/pre-commit`      | Enforces version bump before commit |
| `scripts/bump_version.py`| Script that bumps semantic version by type |

---

## ✅ Tips & Best Practices

- 🔒 **Never manually edit** `package.json` version field. Always use `make version-*`.
- ⛔ **Don't commit code without bumping version** if changes affect a project area.
- 📄 Use `git tag -l` to inspect existing releases.
- 🔁 Keep the `frontend/VERSION` file updated — it drives all version sync.
