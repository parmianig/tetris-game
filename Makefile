# Makefile (entrypoint)

# Centralized configuration
PYTHON := python3.12
RELEASE_MSG ?= chore: version bump

# Include modular chunks
include make/common.mk
include make/setup.mk
include make/install.mk
include make/versioning.mk
include make/check.mk
include make/do_release.mk
include make/release.mk
