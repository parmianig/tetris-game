.PHONY: version-check-precommit

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
