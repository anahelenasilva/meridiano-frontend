# Factory

The factory is the set of unattended runs that turn `ready-for-agent` issues into reviewed draft PRs. Ana merges every PR by hand. This file is the language the factory skills share and the contract between them.

## Language

- **Task**: a kind of work, defined once and run many times. This repo has three: implement, review, rework.
- **Trigger**: the event that starts a run. A clock for implement; a PR event (opened, synchronize) for review; the `needs-rework` label for rework.
- **Run**: one execution of a task, from its trigger to its finish. A run never waits for a human; it ends, and the human's later change to an issue or PR starts a new run.
- **Runner**: the disposable cloud session a run executes on. Nothing on it survives the run; the only memory between runs is GitHub.
- **Ticket tracker**: GitHub Issues. Ana files issues and labels them; labels are how runs hand work to each other.
- **Git host**: GitHub. Branches, draft PRs and review comments live here.
- **Orchestrator**: Claude cloud routines. One routine per task, each with a one-line prompt that reads its skill file.

## Tasks

| Task | Trigger | Does | Triggers next | Human re-entry |
| --- | --- | --- | --- | --- |
| Implement | clock routine, twice a day; takes the lowest-numbered `ready-for-agent` issue | swaps the label to `agent-in-progress`, builds until typecheck, lint and tests pass, opens a draft PR with `Closes #n` | PR opened event starts review | blocked: comment plus `ready-for-human` |
| Review | PR opened or synchronize on a PR labelled `factory` | reads the diff cold against the repo standards and the issue; comments pass or fail | fail: labels `needs-rework`; pass: marks the PR ready and ends | Ana merges |
| Rework | PR labelled `needs-rework` | fixes only the findings of the last failed review, pushes, drops the label | synchronize starts review again | after 3 failed reviews, `ready-for-human` |

Skills: `.claude/skills/factory-implement/SKILL.md`, `.claude/skills/factory-review/SKILL.md`, `.claude/skills/factory-rework/SKILL.md`.

## Labels

| Label | Set by | Cleared by |
| --- | --- | --- |
| `factory` (on the PR) | implement, when it opens the PR | nobody; review and rework act only on PRs that carry it, so a PR from any other `claude/*` session is left alone |
| `ready-for-agent` | Ana | implement, when it takes the issue |
| `agent-in-progress` | implement, as its first write | merging the PR closes the issue; implement clears it when blocked |
| `needs-rework` | review, on a fail | rework, as its first write |
| `ready-for-human` | implement when blocked; rework when a finding cannot be fixed; review after 3 fails | Ana |

An issue labelled `agent-in-progress` with no open PR is stale; Ana resets it by hand.

## Comments

Every comment a run writes opens with a hidden marker line (review only: `<!-- factory-review: pass -->` or `<!-- factory-review: fail -->`) and a visible bold line naming the run: `**Factory review: pass**`, `**Factory review: fail**`, `**Factory rework**`, `**Factory implement**`. Runs act as Ana's GitHub account, so this line is how a factory comment is told from one she typed. Review never posts a formal GitHub review: the PR author is the same account and GitHub rejects approve and request-changes from the author.

## Brakes

- Automated checks: `pnpm typecheck && pnpm lint && pnpm test` inside every run, and the "Test and Lint" workflow on every PR.
- Automated review: the review task, on every push to a PR labelled `factory`.
- Human review: Ana reads and merges every PR. Nothing merges on its own.
- Cap: after 3 failed reviews on one PR the loop stops and the PR waits for Ana.
