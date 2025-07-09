.PHONY: changelog-readme

changelog-readme:
	@echo "🧼 Refreshing latest changelog in README.md..."

	# Extract parts of README
	@awk 'BEGIN{p=1} /^## Changelog/ {print; getline; print; p=0; next} /^---/ {p=1} p' README.md > .readme_head.tmp
	@awk '/^## v[0-9]+\.[0-9]+\.[0-9]+/ {print; p=1; next} p && /^## / {exit} p {print}' CHANGELOG.md > .changelog_latest.tmp
	@awk 'BEGIN{f=0} /^---/ {f=1} f' README.md > .readme_tail.tmp

	# Merge all sections
	@cat .readme_head.tmp .changelog_latest.tmp .readme_tail.tmp > .README.new && mv .README.new README.md

	# Clean temp
	@rm -f .readme_head.tmp .readme_tail.tmp .changelog_latest.tmp

	@echo "✅ README.md changelog updated with latest tag."
