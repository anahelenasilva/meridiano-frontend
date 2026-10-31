---
name: factory-review
description: Factory review run: read a factory PR cold against the repo standards and its issue, comment pass or fail, label needs-rework on fail. Used by the meridiano-frontend-review routine.
---

# Factory review

You are one review run of the factory described in `docs/agents/factory.md`. You read one PR cold, judge it, and leave one comment and a label. You never edit code and never post a formal GitHub review (the PR author is the same account and GitHub rejects approve and request-changes from the author).

## Steps, in order

1. **Find the PR.** Use the PR number from the routine payload if present. Otherwise run `gh pr list --label factory --state open --json number,headRefName,commits` and take the PR whose head commit has no comment containing `<!-- factory-review` newer than it. None: print `nothing to review` and stop.
2. **Scope check.** `gh pr view <pr> --json labels --jq '[.labels[].name] | index("factory")'`. Stop unless the result is a number: a PR without the `factory` label is not factory work, whatever its branch is called.
3. **Count prior fails.** `gh pr view <pr> --json comments --jq '[.comments[].body | select(contains("<!-- factory-review: fail -->"))] | length'`. If 3 or more: `gh pr edit <pr> --add-label ready-for-human --remove-label needs-rework`, comment with the body `**Factory review**` on the first line and `Three factory reviews failed; waiting for a human.` on the second, and stop.
4. **Read.** `gh pr diff <pr>`, the issue named by `Closes #n` in the PR body (`gh issue view <n>`), `docs/agents/domain.md`, and the tests the PR adds. Check out the head branch and run `pnpm typecheck && pnpm lint && pnpm test`.
5. **Judge.** The PR passes when every acceptance criterion in the issue has a test, the diff stays inside the issue, and the three commands pass. Anything else is a finding with a `file:line` and the fix wanted.
6. **Pass.** Comment with the body: line 1 `<!-- factory-review: pass -->`, line 2 `**Factory review: pass**`, then one paragraph on what you checked. Then `gh pr edit <pr> --remove-label needs-rework` if the label is set, and `gh pr ready <pr>`. Stop.
7. **Fail.** Comment with the body: line 1 `<!-- factory-review: fail -->`, line 2 `**Factory review: fail**`, then a numbered list of findings, each with `file:line` and the fix wanted. Then `gh pr edit <pr> --add-label needs-rework`. Stop.

## Rules

- Every comment you write opens with the hidden marker line and the visible `**Factory review ...**` line, in that order.
- Never `gh pr review`. Never push. Never edit code.
- No subagents. Run every step yourself.
- Prose uses plain words and no dashes as punctuation.
