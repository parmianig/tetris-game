# make/release.mk

include make/do_release.mk

.PHONY: release release-patch release-minor release-major do-release

release: release-patch

release-patch:
	@$(MAKE) do-release bump=patch RELEASE_MSG="$(RELEASE_MSG)"

release-minor:
	@$(MAKE) do-release bump=minor RELEASE_MSG="$(RELEASE_MSG)"

release-major:
	@$(MAKE) do-release bump=major RELEASE_MSG="$(RELEASE_MSG)"

do-release:
	$(call do_release)
