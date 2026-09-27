#!/bin/bash
set -euo pipefail
node --test tests/*.test.js
# Playwright owns server startup and cleanup; forward browser/project options.
npm test -- "$@"
