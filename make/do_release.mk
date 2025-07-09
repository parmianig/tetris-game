# make/do_release.mk

define do_release
	@echo "🚀 Preparing $(bump) release..."
	@set -e; \
	CHANGED=$$(git status --porcelain | awk '{print $$2}'); \
	BUMP_FE=0; BUMP_BE=0; \
	if echo "$$CHANGED" | grep -q '^frontend/'; then BUMP_FE=1; fi; \
	if echo "$$CHANGED" | grep -q '^backend/'; then BUMP_BE=1; fi; \
	if [ "$$BUMP_FE" = "1" ]; then \
		echo "🔼 Bumping frontend version ($(bump))..."; \
		python3 scripts/bump_version.py $(bump) frontend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	if [ "$$BUMP_BE" = "1" ]; then \
		echo "🔼 Bumping backend version ($(bump))..."; \
		python3 scripts/bump_version.py $(bump) backend --tag --msg "$(RELEASE_MSG)"; \
	fi; \
	echo "🔼 Bumping app version ($(bump))..."; \
	python3 scripts/bump_version.py $(bump) app --tag --msg "$(RELEASE_MSG)"; \
	make version-check-precommit; \
	make version-set; \
	make version-readme-update; \
	make changelog; \
	VERSION=$$(cat VERSION); \
	git add VERSION backend/VERSION frontend/VERSION frontend/package.json CHANGELOG.md README.md Makefile scripts/*.py; \
	git commit -m "$(RELEASE_MSG)"; \
	git tag release/v$$VERSION; \
	git push origin main --follow-tags; \
	echo "✅ Release v$$VERSION completed!"
endef
