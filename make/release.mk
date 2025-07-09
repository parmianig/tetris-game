# make/release.mk

include make/do_release.mk
include make/changelog.mk

.PHONY: release release-patch release-minor release-major do-release

# Default release is patch-level
release: release-patch

release-patch:
	@$(MAKE) do-release bump=patch RELEASE_MSG="$(RELEASE_MSG)"

release-minor:
	@$(MAKE) do-release bump=minor RELEASE_MSG="$(RELEASE_MSG)"

release-major:
	@$(MAKE) do-release bump=major RELEASE_MSG="$(RELEASE_MSG)"

# Call the shared do-release logic with proper bump type
do-release:
	$(call do_release,$(bump))
