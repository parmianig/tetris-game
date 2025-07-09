.PHONY: changelog-readme changelog generate-changelog-history

# 📜 Generate full changelog history from Git tags
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@echo "✅ CHANGELOG.md regenerated from tag history."

# 📦 Generate latest changelog section only (but preserve full CHANGELOG.md)
changelog:
	@echo "📦 Refreshing latest CHANGELOG.md and README changelog section..."
	@make generate-changelog-history
	@make changelog-readme

# 🧼 Inject only the latest changelog section into README.md
changelog-readme:
	@echo "🧼 Injecting latest changelog section into README.md..."

	# Extract header up to and including <!-- changelog -->
	@awk '{print} /<!-- changelog -->/ {exit}' README.md > .readme_pre.tmp

	# Extract latest changelog section (only topmost release)
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {if (++found > 1) exit} found' CHANGELOG.md > .changelog_latest.tmp

	# Extract the tail after the --- that follows changelog placeholder
	@awk 'BEGIN {in_block=0} /^---/ {if (in_block==0) {in_block=1; next} print}' README.md > .readme_tail.tmp

	# Merge all into README.md
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md

	# Cleanup
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog section updated with the latest release."
