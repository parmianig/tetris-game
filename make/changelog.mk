# Inject latest version changelog only
changelog-readme:
	@echo "📝 Injecting latest changelog section into README.md..."
	@awk 'BEGIN {p=0} /^## v[0-9]+\.[0-9]+\.[0-9]+/ {if (p++) exit} p {print}' CHANGELOG.md > .latest_changelog.tmp
	@sed -i '' '/<!-- changelog -->/q' README.md
	@echo "" >> README.md
	@cat .latest_changelog.tmp >> README.md
	@rm .latest_changelog.tmp
	@echo "✅ Latest changelog injected into README.md"
