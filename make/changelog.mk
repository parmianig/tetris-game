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

	# Extract header up to and including <!-- changelog -->
	@awk 'BEGIN{in=1} /^## Changelog/ {print; next} /<!-- changelog -->/ {print; exit} in' README.md > .readme_pre.tmp

	# Extract the first changelog section only (latest)
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp

	# Extract footer from first --- after <!-- changelog -->
	@awk 'f;/<!-- changelog -->/ {f=1; next} /^---/ {f=1; print; exit}' README.md > .readme_mid.tmp
	@awk 'f; /^---/ {f=1}' README.md > .readme_tail.tmp

	# Merge into README.md
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md

	# Cleanup
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog updated with only the latest version."
