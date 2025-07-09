.PHONY: changelog-readme

changelog-readme:
	@echo "📝 Updating changelog section in README.md..."

	# Extract the head: everything up to and including `<!-- changelog -->`
	@awk '/^## Changelog/ {print; getline; print; exit} {print}' README.md > .readme.head.tmp

	# Extract the tail: everything after the next `---` (the separator)
	@awk 'f && /^---/ {print; f=0} !f {next} {print} /^---/ {f=1}' README.md > .readme.tail.tmp

	# Extract the latest changelog block from CHANGELOG.md
	@awk 'BEGIN {p=0} /^## v[0-9]+\.[0-9]+\.[0-9]+/ {if (p++) exit} {if (p) print} /^## v[0-9]+\.[0-9]+\.[0-9]+/ {p=1}' CHANGELOG.md > .changelog.latest.tmp

	# Assemble new README
	@cat .readme.head.tmp .changelog.latest.tmp .readme.tail.tmp > .README.updated && mv .README.updated README.md

	# Cleanup
	@rm -f .readme.head.tmp .readme.tail.tmp .changelog.latest.tmp

	@echo "✅ Injected latest changelog entry into README.md"
