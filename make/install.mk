.PHONY: install-all backend-install frontend-install

backend-install:
	source $(ACTIVATE) && pip install -r backend/requirements.txt

frontend-install:
	cd frontend && npm install

install-all: backend-install frontend-install
