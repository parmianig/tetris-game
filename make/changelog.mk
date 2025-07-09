# make/changelog.mk

.PHONY: changelog-readme

changelog-readme:
	@echo "📝 Updating latest changelog in README.md..."
	@awk 'BEGIN{inblock=0} { \
		if ($$0 ~ /^<!-- changelog -->/) { \
			print $$0; print ""; inblock=1; next; \
		} \
		if (inblock && $$0 ~ /^## /) { inblock=0 } \
		if (!inblock) print $$0 \
	}' README.md > .README.tmp.before
	@awk 'BEGIN{printed=0} /^## v[0-9]+\.[0-9]+\.[0-9]+/ {if (!printed++) print $$0; else exit} printed' CHANGELOG.md > .changelog.latest.tmp
	@cat .README.tmp.before .changelog.latest.tmp > .README.updated
	@mv .README.updated README.md
	@rm -f .README.tmp.before .changelog.latest.tmp
	@echo "✅ README.md updated with latest changelog section."
