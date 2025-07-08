# Makefile

PYTHON := python3.12
VENV := .venv
ACTIVATE := $(VENV)/bin/activate
TAG_PREFIX := release/v

.PHONY: bootstrap install-hook setup install backend-install frontend-install install-all clean \
        version-set version-set-fe version-set-be version-set-app \
        version-patch-fe version-patch-be version-patch-app \
        version-minor-fe version-minor-be version-minor-app \
        version-major-fe version-major-be version-major-app \
        version-dry-run-fe version-dry-run-be version-dry-run-app \
        version-show version-check-precommit changelog version-readme-update check-tag-exists

# 🔁 Bootstrap
bootstrap: install-hook

# 🧱 Environment
setup:
	@echo "👉 Creating Python venv..."
	$(PYTHON) -m venv $(VENV)
	@echo "✅ Done. Run 'source $(ACTIVATE)' to activate it."

install-hook:
	@echo "🔧 Installing Git pre-commit hook via symlink..."
	@mkdir -p .git/hooks
	@ln -sf ../../.hooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Pre-commit hook installed from .hooks/pre-commit"

# 📦 Install
backend-install:
	source $(ACTIVATE) && pip install -r backend/requirements.txt

frontend-install:
	cd frontend && npm install

install-all: backend-install frontend-install

# 🧹 Clean
clean:
	rm -rf $(VENV)

# 🔁 Version Set
version-set-fe:
	@VERSION=$$(cat frontend/VERSION); \
	jq --arg v "$$VERSION" '.version = $$v' frontend/package.json > frontend/tmp.package.json && \
	mv frontend/tmp.package.json frontend/package.json; \
	echo "🔁 Synced frontend/package.json to $$VERSION"

version-set-be:
	@echo "🔁 Backend VERSION: $$(cat backend/VERSION)"

version-set-app:
	@echo "🔁 App VERSION: $$(cat VERSION)"

version-set: version-set-fe version-set-be version-set-app version-readme-update

# 🔎 Tag check
check-tag-exists:
	@TAG=$(TAG_PREFIX)$$(cat VERSION); \
	if git rev-parse "$$TAG" >/dev/null 2>&1; then \
		echo "❌ Tag $$TAG already exists. Please bump version."; exit 1; \
	else \
		echo "✅ Tag $$TAG is available."; \
	fi

# 🔼 Version bump targets (safe, fail-fast)
version-patch-fe:
	@python3 scripts/bump_version.py patch frontend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-fe && \
	make version-readme-update && \
	make changelog

version-minor-fe:
	@python3 scripts/bump_version.py minor frontend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-fe && \
	make version-readme-update && \
	make changelog

version-major-fe:
	@python3 scripts/bump_version.py major frontend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-fe && \
	make version-readme-update && \
	make changelog

version-patch-be:
	@python3 scripts/bump_version.py patch backend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-be && \
	make version-readme-update && \
	make changelog

version-minor-be:
	@python3 scripts/bump_version.py minor backend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-be && \
	make version-readme-update && \
	make changelog

version-major-be:
	@python3 scripts/bump_version.py major backend && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-be && \
	make version-readme-update && \
	make changelog

version-patch-app:
	@python3 scripts/bump_version.py patch app && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-app && \
	make version-readme-update && \
	make changelog

version-minor-app:
	@python3 scripts/bump_version.py minor app && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-app && \
	make version-readme-update && \
	make changelog

version-major-app:
	@python3 scripts/bump_version.py major app && \
	make version-check-precommit && \
	make check-tag-exists && \
	make version-set-app && \
	make version-readme-update && \
	make changelog

# 🧪 Dry-run
version-dry-run-fe:
	@python3 scripts/bump_version.py patch frontend --dry-run

version-dry-run-be:
	@python3 scripts/bump_version.py patch backend --dry-run

version-dry-run-app:
	@python3 scripts/bump_version.py patch app --dry-run

# ✅ Version checks
version-check-precommit:
	@echo "🔍 Checking version bump per area..."
	@CHANGED=$$(git diff --cached --name-only); \
	CURR_FE=$$(cat frontend/VERSION); \
	CURR_BE=$$(cat backend/VERSION); \
	CURR_APP=$$(cat VERSION); \
	LAST_FE=$$(git show HEAD:frontend/VERSION 2>/dev/null || echo "none"); \
	LAST_BE=$$(git show HEAD:backend/VERSION 2>/dev/null || echo "none"); \
	LAST_APP=$$(git show HEAD:VERSION 2>/dev/null || echo "none"); \
	if echo "$$CHANGED" | grep -q '^frontend/' && [ "$$CURR_FE" = "$$LAST_FE" ]; then \
		echo "❌ Frontend version not bumped."; exit 1; \
	fi; \
	if echo "$$CHANGED" | grep -q '^backend/' && [ "$$CURR_BE" = "$$LAST_BE" ]; then \
		echo "❌ Backend version not bumped."; exit 1; \
	fi; \
	if echo "$$CHANGED" | grep -q -E '^(VERSION|Makefile|k8s/)' && [ "$$CURR_APP" = "$$LAST_APP" ]; then \
		echo "❌ App version not bumped."; exit 1; \
	fi; \
	if ! echo "v$$CURR_APP" | grep -Eq '^v[0-9]+\.[0-9]+\.[0-9]+$$'; then \
		echo "❌ Invalid tag format. Must be vX.Y.Z"; exit 1; \
	fi; \
	echo "✅ Version bump check passed."

# 🔎 Version display
version-show:
	@echo "📦 App Version:      $$(cat VERSION)"
	@echo "📦 Backend Version:  $$(cat backend/VERSION)"
	@echo "📦 Frontend Version: $$(cat frontend/VERSION)"

generate-changelog-history:
	@python3 scripts/generate_changelog.py && echo "✅ CHANGELOG.md from full history injected." && \
	sed -i '' "/<!-- changelog -->/r CHANGELOG.md" README.md

# 📝 Changelog generation
changelog:
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	echo "✅ CHANGELOG.md updated."; \
	sed -i '' "/<!-- changelog -->/r CHANGELOG.md" README.md

# 🪪 README version injection
version-readme-update:
	@echo "🔁 Updating README.md with current versions..."
	@sed -i '' "s/APP_VERSION: .*/APP_VERSION: $$(cat VERSION)/" README.md || true
	@sed -i '' "s/FRONTEND_VERSION: .*/FRONTEND_VERSION: $$(cat frontend/VERSION)/" README.md || true
	@sed -i '' "s/BACKEND_VERSION: .*/BACKEND_VERSION: $$(cat backend/VERSION)/" README.md || true
	@echo "✅ README.md updated with versions."

release:
	@echo "🚀 Preparing release..."
	@CHANGED=$$(git status --porcelain | awk '{print $$2}'); \
	BUMP_FE=0; BUMP_BE=0; \
	if echo "$$CHANGED" | grep -q '^frontend/'; then BUMP_FE=1; fi; \
	if echo "$$CHANGED" | grep -q '^backend/'; then BUMP_BE=1; fi; \
	if [ "$$BUMP_FE" = "1" ]; then \
		echo "🔼 Bumping frontend version..."; \
		python3 scripts/bump_version.py patch frontend; \
	fi; \
	if [ "$$BUMP_BE" = "1" ]; then \
		echo "🔼 Bumping backend version..."; \
		python3 scripts/bump_version.py patch backend; \
	fi; \
	echo "🔼 Bumping app version..."; \
	python3 scripts/bump_version.py patch app; \
	make version-check-precommit; \
	make check-tag-exists; \
	make version-set; \
	make version-readme-update; \
	make changelog; \
	VERSION=$$(cat VERSION); \
	git add VERSION backend/VERSION frontend/VERSION frontend/package.json CHANGELOG.md README.md Makefile scripts/*.py; \
	git commit -m "chore(release): version $$VERSION"; \
	git tag release/v$$VERSION; \
	git push origin main --follow-tags; \
	echo "✅ Release v$$VERSION completed!"
