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

	# 1. Extract the latest release changelog block from CHANGELOG.md
	@awk '/^## release\/v[0-9]+\.[0-9]+\.[0-9]+/ {if (++f == 2) exit} f' CHANGELOG.md > .changelog_latest.tmp

	# 2. Extract everything from README.md up to and including the changelog placeholder
	@awk '{ print } /<!-- changelog -->/ { exit }' README.md > .readme_pre.tmp

	# 3. Extract everything after the first `---` following <!-- changelog --> line
	@awk 'f && $$0 == "---" { print; found=1; next } f && found { print } /<!-- changelog -->/ { f=1 }' README.md > .readme_post.tmp

	# 4. Build new README with inserted latest changelog
	@cat .readme_pre.tmp .changelog_latest.tmp .readme_post.tmp > .README.new

	# 5. Replace original and clean up
	@mv .README.new README.md
	@rm -f .readme_*.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog injected correctly."
