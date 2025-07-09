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

	# Step 1: Extract lines up to and including <!-- changelog -->
	@awk '{print} /<!-- changelog -->/ {exit}' README.md > .readme_pre.tmp

	# Step 2: Extract topmost changelog section from CHANGELOG.md
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {if (++found > 1) exit} found' CHANGELOG.md > .changelog_latest.tmp

	# Step 3: Extract content after the first --- separator
	@awk 'BEGIN{found=0} /^---/ {found=1; print; next} found' README.md > .readme_tail.tmp

	# Step 4: Combine all parts
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md

	# Cleanup
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog section updated with the latest version only."
