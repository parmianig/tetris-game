include make/common.mk

.PHONY: version-patch-app version-minor-app version-major-app \
        version-set version-set-app version-set-be version-set-fe \
        version-patch-be version-patch-fe version-minor-fe version-major-fe \
        changelog version-readme-update generate-changelog-history

# Version Set
version-set-fe:
	@VERSION=$$(cat frontend/VERSION); \
	jq --arg v "$$VERSION" '.version = $$v' frontend/package.json > frontend/tmp.package.json && \
	mv frontend/tmp.package.json frontend/package.json

version-set-be:
	@echo "🔁 Backend VERSION: $$(cat backend/VERSION)"

version-set-app:
	@echo "🔁 App VERSION: $$(cat VERSION)"

version-set: version-set-fe version-set-be version-set-app version-readme-update

# Version bump
version-patch-app:
	@python3 scripts/bump_version.py patch app --tag --msg "$(RELEASE_MSG)" && \
	make version-check-precommit && make check-tag-exists && \
	make version-set-app && make version-readme-update && make changelog

# repeat for other bump types (minor, major, frontend, backend)

# Changelog
changelog:
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	tail -n +2 CHANGELOG.md > .changelog.tmp && \
	sed -i '' "/<!-- changelog -->/r .changelog.tmp" README.md && rm .changelog.tmp; \
	echo "✅ CHANGELOG.md updated and injected into README.md"

# Inject versions into README
version-readme-update:
	@sed -i '' "s/APP_VERSION: .*/APP_VERSION: $$(cat VERSION)/" README.md || true
	@sed -i '' "s/FRONTEND_VERSION: .*/FRONTEND_VERSION: $$(cat frontend/VERSION)/" README.md || true
	@sed -i '' "s/BACKEND_VERSION: .*/BACKEND_VERSION: $$(cat backend/VERSION)/" README.md || true
