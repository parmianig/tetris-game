include make/common.mk

.PHONY: release

# 🚀 Perform a complete release flow based on detected changes
release:
	@echo "🚀 Preparing release..."
	@CHANGED=$$(git status --porcelain | awk '{print $$2}'); \
	BUMP_FE=0; BUMP_BE=0; \
	if echo "$$CHANGED" | grep -q '^frontend/'; then BUMP_FE=1; fi; \
	if echo "$$CHANGED" | grep -q '^backend/'; then BUMP_BE=1; fi; \
	if [ "$$BUMP_FE" = "1" ]; then \
		echo "🔼 Bumping frontend version..."; \
		python3 scripts/bump_version.py patch frontend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	if [ "$$BUMP_BE" = "1" ]; then \
		echo "🔼 Bumping backend version..."; \
		python3 scripts/bump_version.py patch backend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	echo "🔼 Bumping app version..."; \
	python3 scripts/bump_version.py patch app --tag --msg "$(RELEASE_MSG)"; \
	make version-check-precommit; \
	make check-tag-exists; \
	make version-set; \
	make version-readme-update; \
	make changelog; \
	VERSION=$$(cat VERSION); \
	git add VERSION backend/VERSION frontend/VERSION frontend/package.json CHANGELOG.md README.md Makefile scripts/*.py; \
	git commit -m "$(RELEASE_MSG)"; \
	git tag release/v$$VERSION; \
	git push origin main --follow-tags; \
	echo "✅ Release v$$VERSION completed!"
