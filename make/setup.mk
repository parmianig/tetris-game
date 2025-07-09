include make/common.mk

.PHONY: bootstrap setup clean install-hook

bootstrap: install-hook

setup:
	@echo "👉 Creating Python venv..."
	$(PYTHON) -m venv $(VENV)
	@echo "✅ Done. Run 'source $(ACTIVATE)' to activate it."

install-hook:
	@echo "🔧 Installing Git pre-commit hook via symlink..."
	@mkdir -p .git/hooks
	@ln -sf ../../.hooks/pre-commit .git/hooks/pre-commit
	@chmod +x .git/hooks/pre-commit
	@echo "✅ Pre-commit hook installed"

clean:
	rm -rf $(VENV)
