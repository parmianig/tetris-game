.PHONY: changelog-readme changelog generate-changelog-history

# 📜 Generate full changelog history from Git tags
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@echo "✅ CHANGELOG.md regenerated from tag history."

# 📦 Generate changelog for latest version only and inject it
changelog:
	@echo "📦 Generating latest CHANGELOG.md..."
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## release/v$$VERSION" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	make changelog-readme

# 🧼 Inject only the latest changelog section into README.md
changelog-readme:
	@echo "🧼 Injecting latest changelog section into README.md..."
	@awk 'BEGIN{found=0} /^## Changelog/ {print; found=1; next} found && /^---/ {exit} !found || /^---/ {print}' README.md > .readme_top.tmp
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp
	@awk 'BEGIN{copy=0} /^---/ {copy=1; print; next} copy {print}' README.md > .readme_bottom.tmp
	@cat .readme_top.tmp .changelog_latest.tmp .readme_bottom.tmp > README.md
	@rm -f .readme_*.tmp .changelog_latest.tmp
	@echo "✅ README.md changelog updated."
