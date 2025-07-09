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
	echo "# Changelog\n\n## v$$VERSION" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	make changelog-readme

# 🧼 Inject only the latest changelog section into README.md
changelog-readme:
	@echo "🧼 Injecting latest changelog section into README.md..."
	@awk 'BEGIN{in_block=1} /^## Changelog/ {print; print "<!-- changelog -->"; next} /^---/ {in_block=0} in_block' README.md > .readme_pre.tmp
	@awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp
	@awk '/^---/ {found=1} found' README.md > .readme_post.tmp
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_post.tmp > .README.new && mv .README.new README.md
	@rm -f .readme_*.tmp .changelog_latest.tmp
	@echo "✅ README.md changelog updated."
