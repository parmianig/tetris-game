.PHONY: changelog-readme changelog generate-changelog-history

# 📜 Generate full changelog history from Git tags
generate-changelog-history:
	@echo "📜 Generating full CHANGELOG.md from git tags..."
	@python3 scripts/generate_changelog.py
	@echo "✅ CHANGELOG.md regenerated from tag history."

# 📦 Inject latest tag entry into README.md
changelog:
	@echo "📦 Extracting latest changelog section for README.md..."
	@awk 'BEGIN{p=1} /^## Changelog/ {print; print "<!-- changelog -->"; p=0; next} /^---/ {p=1} p' README.md > .readme_head.tmp
	@awk '/^## / {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp
	@awk 'BEGIN{f=0} /^---/ {f=1} f' README.md > .readme_tail.tmp
	@cat .readme_head.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md
	@rm -f .readme_*.tmp .changelog_latest.tmp
	@echo "✅ README.md changelog section updated with latest entry."
