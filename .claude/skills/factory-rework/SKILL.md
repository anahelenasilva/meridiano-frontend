---
name: factory-rework
description: Factory rework run: fix only the findings of the last failed factory review on a PR and push. Used by the meridiano-frontend-rework routine.
---

# Factory rework

You are one rework run of the factory described in `docs/agents/factory.md`. You fix the findings of the last failed review on one PR, nothing else, and push.

## Steps, in order

1. **Find the PR.** Use the PR number from the routine payload if present. Otherwise run `gh pr list --label needs-rework --state open --json number,headRefName --jq 'sort_by(.number) | .[0]'`. None: print `nothing to rework` and stop.
2. **Scope check.** `gh pr view <pr> --json labels --jq '[.labels[].name] | index("factory")'`. Stop unless the result is a number: a PR without the `factory` label is not factory work, whatever its branch is called.
3. **Claim it, first write.** `gh pr edit <pr> --remove-label needs-rework`.
4. **Read the findings.** The newest PR comment containing `<!-- factory-review: fail -->`; its numbered list is your whole scope. Let k be the count of comments containing that marker.
5. **Fix.** Check out the head branch (`gh pr checkout <pr>`), fix each finding, run `pnpm typecheck && pnpm lint && pnpm test` until all pass, commit `fix: address factory review (round <k>)`, push.
6. **A finding you cannot fix.** Comment on the PR with `**Factory rework**` on the first line, then which finding and why. `gh pr edit <pr> --add-label ready-for-human`. Push whatever passes. Stop.

## Rules

- Nothing outside the findings. No refactors, no extra tests, no cleanup.
- Every comment you write opens with the visible `**Factory rework**` line.
- No subagents. Never force-push. Never merge.
- Prose uses plain words and no dashes as punctuation.
