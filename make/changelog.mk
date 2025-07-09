.PHONY: changelog generate-changelog-history

# 📜 Generate full changelog history
generate-changelog-history:
	@python3 scripts/generate_changelog.py && \
	sed -i '' '/<!-- changelog -->/q' README.md && \
	echo "" >> README.md && \
	cat CHANGELOG.md >> README.md && \
	echo "✅ Full changelog injected into README.md"

# 📝 Changelog (latest only injected to README)
changelog:
	@VERSION=$$(cat VERSION); \
	echo "# Changelog\n\n## v$$VERSION\n" > CHANGELOG.md; \
	git tag --sort=-creatordate | tail -n 2 | head -n 1 | xargs -I {} \
	git log {}..HEAD --pretty=format:"* %s (%an)" >> CHANGELOG.md; \
	tail -n +2 CHANGELOG.md | awk '/^## /{i++} i==1' > .changelog.latest && \
	sed -i '' '/<!-- changelog -->/q' README.md && \
	echo "" >> README.md && \
	cat .changelog.latest >> README.md && \
	rm .changelog.latest; \
	echo "✅ README.md updated with latest changelog and full history in CHANGELOG.md"

