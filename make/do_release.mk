define do_release
	@echo "🚀 Preparing $(1) release..."
	@set -e; \
	if [ "$(DEBUG)" = "1" ]; then echo "🔍 DEBUG MODE ENABLED"; fi; \
	if [ "$(DRY_RUN)" = "1" ]; then echo "🧪 Running in DRY RUN mode"; fi; \
	python3 scripts/bump_version.py $(1) \
		$(if $(DEBUG),--debug) \
		$(if $(DRY_RUN),--dry-run) \
		--tag \
		--msg "$(RELEASE_MSG)"; \
  make version-check-precommit; \
	make version-set; \
	make version-readme-update; \
	make changelog; \
	VERSION=$$(cat VERSION); \
	echo "✅ All steps completed. Committing release v$$VERSION..."; \
	git add VERSION backend/VERSION frontend/VERSION frontend/package.json CHANGELOG.md README.md Makefile scripts/*.py; \
	git commit -m "$(RELEASE_MSG)"; \
	git push origin main --follow-tags; \
	echo "✅ Release v$$VERSION completed!"
endef
