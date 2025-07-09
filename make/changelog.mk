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
	@VERSION=$$(cat VERSION); \
	awk 'BEGIN{block=1} /^## Changelog/ {print; print "<!-- changelog -->"; block=0; next} /^---/ {block=1} block {print}' README.md > .README_HEAD.tmp; \
	echo "" > .README_CHANGELOG.tmp; \
	awk -v v="v$$VERSION" '/^## v[0-9]+\.[0-9]+\.[0-9]+/ { if ($$2 == v) {print; inblock=1; next} } /^## v[0-9]+\.[0-9]+\.[0-9]+/ { inblock=0 } inblock && NF > 0 {print}' CHANGELOG.md >> .README_CHANGELOG.tmp; \
	awk 'BEGIN{print_marker=0} /^---/ {print_marker=1} print_marker' README.md > .README_TAIL.tmp; \
	cat .README_HEAD.tmp .README_CHANGELOG.tmp .README_TAIL.tmp > .README.new && mv .README.new README.md; \
	rm -f .README_*.tmp; \
	echo "✅ README.md changelog updated with v$$VERSION."

# 📜 Generate full changelog from tag history and inject into README.md
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@awk 'BEGIN{p=1} /^## Changelog/ {print; print "<!-- changelog -->"; p=0; next} /^---/ {p=1} p' README.md > .readme_head.tmp; \
	awk 'BEGIN{f=0} /^---/ {f=1} f' README.md > .readme_tail.tmp; \
	cat .readme_head.tmp CHANGELOG.md .readme_tail.tmp > .README.new && mv .README.new README.md; \
	rm -f .readme_head.tmp .readme_tail.tmp; \
	echo "✅ Full changelog injected into README.md."
