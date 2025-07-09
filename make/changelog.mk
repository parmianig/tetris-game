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

	# Extract everything before the changelog block
	@awk 'BEGIN{p=1} /^## Changelog/ {print; getline; print; exit} p' README.md > .readme_pre.tmp

	# Extract latest version section only
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {if (++found > 1) exit} found' CHANGELOG.md > .changelog_latest.tmp

	# Extract everything after the first '---' *following* the changelog section
	@awk 'BEGIN{skip=1} /^## Changelog/ {getline; skip=1} /^---/ {skip=0; next} skip==0' README.md > .readme_post.tmp

	# Combine parts together
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_post.tmp > .README.new && mv .README.new README.md

	# Cleanup
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog section updated."

