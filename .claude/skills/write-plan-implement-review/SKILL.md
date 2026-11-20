---
name: write-plan-implement-review
description: "Use when Ana asks to take a GitHub issue to a PR: plan it, review the plan, implement it, review the code and open the PR, each step in its own subagent."
---

# Write plan, implement, review

You are the **orchestrator** of one issue-to-PR run. Five subagents do the work in order, and each hands the next a path or a branch, never content. You dispatch, check each hand-off exists, and pass it on. The plan, the code and the checks belong to the subagents; your context holds only paths and statuses.

The input is one GitHub issue number `<n>`. Ask Ana for it when her message names none.

## Hand-offs

| Step | The subagent | Gets | Returns |
| --- | --- | --- | --- |
| 1. Plan | writes the plan | `<n>` | plan path |
| 2. Plan review | attacks and fixes the plan | `<n>`, plan path | one line per fix |
| 3. Implement | builds the plan in a worktree | `<n>`, plan path | worktree path, branch |
| 4. Code review | reviews and fixes the branch | `<n>`, plan path, worktree path | review notes path |
| 5. PR | pushes and opens the PR | `<n>`, worktree path, review notes path | PR URL |

- **Plan:** `/Users/anahelenadasilva/Desktop/dev/.scratch/YYYY-MM-DD-meridiano-frontend-issue-<n>-plan.md`
- **Review notes:** the same name ending in `-review.md`.
- **Worktree:** `.claude/worktrees/issue-<n>` under the main checkout (the first line of `git worktree list`), on branch `claude/issue-<n>-<slug>`, where the slug is the issue title in lowercase with hyphens, at most 5 words.
- **Checks:** `pnpm typecheck && pnpm lint && pnpm exec vitest run --maxWorkers=2`. Two workers, because Ana runs several sessions on this Mac at once.

## Dispatch

Every dispatch is `subagent_type: "general-purpose"` with `model: "opus"`, and carries:

- the issue number, the hand-offs its row gets, and its step's brief below;
- for steps 3 to 5, the Co-Authored-By line naming the subagent's own model, for its commits;
- the closing instruction: "Your final message is at most 10 lines: done or blocked, what you return, and the blocker if blocked."

Before the next dispatch, check the hand-off: `test -f` on a returned file, `git -C <worktree> log --oneline origin/main..HEAD` on a branch. A blocked subagent or a missing hand-off ends the run, and your report names the step and the blocker.

## Steps

### 1. Plan

**Brief:** run `superpowers:writing-plans` on the issue (`gh issue view <n> --comments`) and save the plan at the plan path, in place of the skill's `docs/superpowers/plans/`. The execution method is already chosen: Native, with `superpowers:executing-plans`. Step 2 stands in for the human review at the skill's handoff, so return the path once the plan is saved.

**Done when:** the plan file exists and every acceptance criterion in the issue maps to a task.

### 2. Plan review

**Brief:** review the plan adversarially, as a reviewer who expects it to be wrong. Check every file path and symbol it names against `origin/main` with `git grep`, every acceptance criterion in the issue against a task and its test, and every test against the behavior it claims to prove. Fix what is worth fixing by editing the plan file in place, so it stays the only copy.

**Done when:** every task and every acceptance criterion has been checked, and the return lists each fix in one line.

### 3. Implement

**Brief:** run `git fetch origin`, create the worktree and branch from `origin/main`, then run `superpowers:executing-plans` on the plan inside the worktree. Stop after the last task's commit: steps 4 and 5 own the whole-branch review and finishing the branch.

**Done when:** every plan task is committed on the branch and the checks pass.

### 4. Code review

**Brief:** read `git diff origin/main...HEAD` in the worktree cold, against the issue, the plan, `~/.claude/GLOBAL_TYPESCRIPT.md` and the repo docs `CLAUDE.md` points at. A finding is an acceptance criterion with no test, a change outside the issue, a task built differently from the plan with no reason, or a broken coding rule. Rule on each finding: fix a real one test first and commit, and leave the rest open with the reason. Write every finding to the review notes with its `file:line` and ruling, then run the checks.

**Done when:** every acceptance criterion is traced to a test, every finding has a ruling in the review notes, and the checks pass.

### 5. PR

**Brief:** push the branch with `git push -u origin <branch>` and open the PR with `gh pr create`. The title is a conventional commit in the style of `git log --oneline -10`. The body follows `~/.claude/GLOBAL_VOICE.md`, has `Closes #<n>`, and lists the open findings from the review notes. Check every claim in the body against the diff before creating the PR.

**Done when:** `gh pr view --json url,body` returns the URL and the body has `Closes #<n>`.

## Closing report

The run ends at the open PR, and Ana merges. The report names the PR URL, the plan path, the review notes path and each open finding.
