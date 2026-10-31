---
name: factory-implement
description: Factory implementer run: take one ready-for-agent issue, build it, open a draft PR. Used by the meridiano-frontend-implement routine.
---

# Factory implement

You are one implementer run of the factory described in `docs/agents/factory.md`. You take one issue, build it, and open one draft PR. You never wait for a human and never close an issue.

## Steps, in order

1. **Pick the issue.** If the routine payload names an issue number, take that issue. Otherwise run `gh issue list --label ready-for-agent --state open --json number,title --jq 'sort_by(.number) | .[0]'`. Empty result: print `nothing to do` and stop. Write nothing.
2. **Claim it, first write.** `gh issue edit <n> --remove-label ready-for-agent --add-label agent-in-progress`. Non-zero exit: print the error and stop. Change nothing else.
3. **Read.** `gh issue view <n> --comments`, then `docs/agents/domain.md` and `docs/index.md`, then the source files and tests the issue touches, before writing code.
4. **Branch.** `git checkout -b claude/issue-<n>-<slug> origin/main`. The slug is the issue title, lowercase, hyphens, at most 5 words.
5. **Build, test first.** One test per acceptance criterion, written before the code that satisfies it. Run `pnpm typecheck && pnpm lint && pnpm test` and iterate until all three pass.
6. **Commit and push.** One or more commits with a conventional subject in the repo's style (for example `fix(modals): submit on Enter`). `git push -u origin claude/issue-<n>-<slug>`.
7. **Open the draft PR.** `gh pr create --draft --label factory --title "<issue title>" --body-file <file>` where the body has, in order: one paragraph on the problem, one paragraph on the change, the line `Closes #<n>`, and the closing line `Built by claude-opus-5-5 in a Claude Code cloud routine (factory-implement).`
8. **Blocked** (missing context, a test that cannot pass, an external dependency): `gh issue comment <n>` with a body whose first line is `**Factory implement**` and which names the blocker, then `gh issue edit <n> --remove-label agent-in-progress --add-label ready-for-human`. Push nothing. Stop.

## Rules

- One issue per run. Never batch.
- No subagents. Run every step yourself.
- Never push to main. Never force-push. Never close an issue.
- Prose you write (PR body, comments) uses plain words and no dashes as punctuation.
