# Makefile (entrypoint)

# Centralized configuration
PYTHON := python3.12
RELEASE_MSG ?= chore: version bump

release-debug:
	$(MAKE) release-minor DEBUG=1 DRY_RUN=1

# Include modular chunks
include make/common.mk
include make/setup.mk
include make/install.mk
include make/versioning.mk
# include make/check.mk         # <--- REMOVE this line if not needed
include make/changelog.mk
include make/do_release.mk
include make/release.mk
