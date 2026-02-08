---
description: Instructions for Cursor Agent mode operations
alwaysApply: true
---

# Agent Mode Instructions

## Package Manager
- **Always use `pnpm`**, never `npm` or `yarn`
- Install packages: `pnpm add <package>` or `pnpm add -D <package>`
- Run scripts: `pnpm run <script>`

## Code Changes
- Don't modify files in `node_modules/` or `dist/`
- Don't modify migration files that have already run (timestamps in the past)
- Don't delete or rename entity ID columns without a migration plan

## Git Operations
- Use conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- Don't commit generated files (`dist/`, coverage reports)
