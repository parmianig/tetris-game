# make/do_release.mk

define do_release
	@echo "🚀 Preparing $(1) release..."
	@set -e; \
	CHANGED=$$(git status --porcelain | awk '{print $$2}'); \
	BUMP_FE=0; BUMP_BE=0; \
	if echo "$$CHANGED" | grep -q '^frontend/'; then BUMP_FE=1; fi; \
	if echo "$$CHANGED" | grep -q '^backend/'; then BUMP_BE=1; fi; \
	if [ "$$BUMP_FE" = "1" ]; then \
		echo "🔼 Bumping frontend version ($(1))..."; \
		python3 scripts/bump_version.py $(1) frontend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	if [ "$$BUMP_BE" = "1" ]; then \
		echo "🔼 Bumping backend version ($(1))..."; \
		python3 scripts/bump_version.py $(1) backend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	echo "🔼 Bumping app version ($(1))..."; \
	python3 scripts/bump_version.py $(1) app --tag --msg "$(RELEASE_MSG)"; \
	make version-check-precommit; \
	make version-set; \
	make version-readme-update; \
	make changelog; \
	VERSION=$$(cat VERSION); \
	echo "✅ All steps completed. Committing..."; \
	git add VERSION backend/VERSION frontend/VERSION frontend/package.json CHANGELOG.md README.md Makefile scripts/*.py; \
	git commit -m "$(RELEASE_MSG)"; \
	git push origin main --follow-tags; \
	echo "✅ Release v$$VERSION completed!"
endef
