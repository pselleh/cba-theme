intl_imports = ./node_modules/.bin/intl-imports.js

ATLAS_OPTIONS ?=

.PHONY: requirements pull_translations

requirements:
	npm ci

# Minimal i18n: only platform + paragon (this app is not on Transifex yet).
# Prefix PATH so `atlas` resolves after `cd src/i18n/messages` (relative node_modules/.bin would break).
# Docker: Tutor base image also sets PATH to node_modules/.bin; optional global install in Dockerfile is a fallback.
pull_translations:
	rm -rf src/i18n/messages
	mkdir -p src/i18n/messages
	cd src/i18n/messages \
	&& PATH="$(CURDIR)/node_modules/.bin:$(PATH)" atlas pull $(ATLAS_OPTIONS) \
	 translations/frontend-platform/src/i18n/messages:frontend-platform \
	 translations/paragon/src/i18n/messages:paragon
	$(intl_imports) frontend-platform paragon
