changelog-readme:
	@echo "📝 Injecting latest changelog section into README.md..."
	@awk 'BEGIN {found=0} /^## v[0-9]+\.[0-9]+\.[0-9]+/ {if (!found++) print $$0; else exit} found' CHANGELOG.md > .latest_changelog.tmp
	@awk '{print} /^<!-- changelog -->/ {exit}' README.md > .readme_head.tmp
	@cat .readme_head.tmp .latest_changelog.tmp > .README.new
	@mv .README.new README.md
	@rm -f .latest_changelog.tmp .readme_head.tmp
	@echo "✅ README.md changelog section updated."
