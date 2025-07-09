.PHONY: version-show version-set version-set-fe version-set-be version-set-app \
        version-patch-fe version-minor-fe version-major-fe \
        version-patch-be version-minor-be version-major-be \
        version-patch-app version-minor-app version-major-app \
        version-dry-run-fe version-dry-run-be version-dry-run-app \
        version-readme-update changelog generate-changelog-history

version-set: version-set-fe version-set-be version-set-app version-readme-update

version-set-fe:
	@VERSION=$$(cat frontend/VERSION); \
	jq --arg v "$$VERSION" '.version = $$v' frontend/package.json > frontend/tmp.package.json && \
	mv frontend/tmp.package.json frontend/package.json; \
	echo "🔁 Synced frontend/package.json to $$VERSION"

version-set-be:
	@echo "🔁 Backend VERSION: $$(cat backend/VERSION)"

version-set-app:
	@echo "🔁 App VERSION: $$(cat VERSION)"

version-show:
	@echo "📦 App Version:      $$(cat VERSION)"
	@echo "📦 Backend Version:  $$(cat backend/VERSION)"
	@echo "📦 Frontend Version: $$(cat frontend/VERSION)"

version-patch-fe:
	@python3 scripts/bump_version.py patch frontend --tag --msg "$(RELEASE_MSG)"

version-minor-fe:
	@python3 scripts/bump_version.py minor frontend --tag --msg "$(RELEASE_MSG)"

version-major-fe:
	@python3 scripts/bump_version.py major frontend --tag --msg "$(RELEASE_MSG)"

version-patch-be:
	@python3 scripts/bump_version.py patch backend --tag --msg "$(RELEASE_MSG)"

version-minor-be:
	@python3 scripts/bump_version.py minor backend --tag --msg "$(RELEASE_MSG)"

version-major-be:
	@python3 scripts/bump_version.py major backend --tag --msg "$(RELEASE_MSG)"

version-patch-app:
	@python3 scripts/bump_version.py patch app --tag --msg "$(RELEASE_MSG)"

version-minor-app:
	@python3 scripts/bump_version.py minor app --tag --msg "$(RELEASE_MSG)"

version-major-app:
	@python3 scripts/bump_version.py major app --tag --msg "$(RELEASE_MSG)"

version-dry-run-fe:
	@python3 scripts/bump_version.py patch frontend --dry-run

version-dry-run-be:
	@python3 scripts/bump_version.py patch backend --dry-run

version-dry-run-app:
	@python3 scripts/bump_version.py patch app --dry-run

version-readme-update:
	@echo "🔁 Updating README.md with current versions..."
	@sed -i '' "s/APP_VERSION: .*/APP_VERSION: $$(cat VERSION)/" README.md || true
	@sed -i '' "s/FRONTEND_VERSION: .*/FRONTEND_VERSION: $$(cat frontend/VERSION)/" README.md || true
	@sed -i '' "s/BACKEND_VERSION: .*/BACKEND_VERSION: $$(cat backend/VERSION)/" README.md || true
	@echo "✅ README.md updated with versions."

changelog:
	@echo "📦 Building latest CHANGELOG.md and injecting into README.md..."
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	awk 'BEGIN{skip=0} {if ($$0 ~ /^## Changelog/) {print; print "<!-- changelog -->"; skip=1; next} if ($$0 ~ /^---/) {skip=0} if (!skip) print}' README.md > .README_HEAD.tmp; \
	awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .CHANGELOG_LATEST.tmp; \
	awk '/^---/ {f=1} f' README.md > .README_TAIL.tmp; \
	cat .README_HEAD.tmp .CHANGELOG_LATEST.tmp .README_TAIL.tmp > README.md && \
	rm -f .README_*.tmp .CHANGELOG_LATEST.tmp; \
	echo "✅ Injected latest v$$VERSION changelog into README.md."


generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py && \
	awk 'BEGIN{skip=0} {if ($$0 ~ /^## Changelog/) {print; print "<!-- changelog -->"; skip=1; next} if ($$0 ~ /^---/) {skip=0} if (!skip) print}' README.md > .README_HEAD.tmp; \
	awk '/^---/ {f=1} f' README.md > .README_TAIL.tmp; \
	cat .README_HEAD.tmp CHANGELOG.md .README_TAIL.tmp > README.md && \
	rm -f .README_HEAD.tmp .README_TAIL.tmp; \
	echo "✅ Full changelog injected into README.md"

