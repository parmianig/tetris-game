.PHONY: changelog changelog-readme generate-changelog-history

# 🔄 Generate CHANGELOG.md for latest version and inject it into README.md
changelog:
	@echo "📦 Generating latest CHANGELOG.md..."
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	$(MAKE) changelog-readme

# 🧼 Inject latest changelog section into README.md between placeholders
changelog-readme:
	@echo "🧼 Injecting latest changelog section into README.md..."
	@awk 'BEGIN{p=1} /^## Changelog/ {print; getline; print; p=0; next} /^---/ {p=1} p' README.md > .readme_head.tmp; \
	awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp; \
	awk 'BEGIN{f=0} /^---/ {f=1} f' README.md > .readme_tail.tmp; \
	cat .readme_head.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md; \
	rm -f .readme_*.tmp .changelog_latest.tmp; \
	echo "✅ README.md changelog updated."

# 📜 Generate full changelog from tag history and inject into README.md
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@awk 'BEGIN{p=1} /^## Changelog/ {print; print "<!-- changelog -->"; p=0; next} /^---/ {p=1} p' README.md > .readme_head.tmp; \
	awk 'BEGIN{f=0} /^---/ {f=1} f' README.md > .readme_tail.tmp; \
	cat .readme_head.tmp CHANGELOG.md .readme_tail.tmp > .README.new && mv .README.new README.md; \
	rm -f .readme_head.tmp .readme_tail.tmp; \
	echo "✅ Full changelog injected into README.md."
