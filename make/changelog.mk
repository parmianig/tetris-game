.PHONY: changelog-readme changelog generate-changelog-history

# 📜 Generate full changelog history from Git tags
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@echo "✅ CHANGELOG.md regenerated from tag history."

# 📦 Generate changelog for latest version only and inject into README
changelog:
	@echo "📦 Generating latest CHANGELOG.md..."
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## release/v$$VERSION" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	make changelog-readme

# 🧼 Inject only the latest changelog section into README.md (preserving content)
changelog-readme:
	@echo "🧼 Injecting latest changelog section into README.md..."

	# Extract header up to and including <!-- changelog -->
	@awk '{ print; if ($$0 ~ /<!-- changelog -->/) { exit } }' README.md > .readme_pre.tmp

	# Extract latest changelog block (top section only)
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ { if (found) exit; found=1 } found' CHANGELOG.md > .changelog_latest.tmp

	# Extract the README tail after first --- after <!-- changelog -->
	@awk '/<!-- changelog -->/ {found=1; next} found && /^---/ {print; exit}' README.md > .readme_mid.tmp
	@awk '/^---/ {seen=1} seen' README.md > .readme_tail.tmp

	# Combine all
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md

	# Cleanup
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog updated with only the latest version."
