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
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	tail -n +2 CHANGELOG.md > .changelog.tmp && \
	sed -i '' "/<!-- changelog -->/r .changelog.tmp" README.md && rm .changelog.tmp; \
	echo "✅ CHANGELOG.md updated and injected into README.md"

generate-changelog-history:
	@python3 scripts/generate_changelog.py && \
	sed -i '' '/<!-- changelog -->/q' README.md && \
	echo "" >> README.md && \
	cat CHANGELOG.md >> README.md && \
	echo "✅ Full changelog injected into README.md"
