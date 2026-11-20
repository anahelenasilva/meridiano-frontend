---
name: visual-check
description: Use when Ana asks you to check a change in the browser, such as a visual check, a screenshot of a page, screenshots for a PR, or an issue's "done when" item that needs eyes on the UI.
---

# Visual check

One browser session per frontend, one cached login, pages driven with the Playwright CLI (`npx playwright cli`, bundled with the repo's `@playwright/test`). After each command the CLI prints the page URL and a link to a snapshot file in `.playwright-cli/`, never the snapshot itself, so read a snapshot file or run `find` only when you need the page structure. `npx playwright cli --help` lists every command. You run your own servers on your own ports and leave Ana's alone. The check is an eyeball check of what the issue names; the CI tests are the proof.

## Steps

1. **Scope the check.** Read the issue's "done when" item (`gh issue view <n>`) and list the pages to open (routes in `src/App.tsx`) with one thing each page must show. Default to desktop 1440×900, light theme. Add mobile widths, dark theme or a before/after comparison only when the item names them; "looks the same" or "no visual change" means before/after. Done when every page on the list has one expected observation.

2. **Start the backend, or reuse one.** If `lsof -nP -iTCP:3001 -sTCP:LISTEN` shows a listener, reuse it. Otherwise run this in the background from the `meridiano-nestjs` checkout next to the main frontend checkout:

   ```sh
   PORT=3001 pnpm start:dev > "$CLAUDE_JOB_DIR/tmp/backend.log" 2>&1
   ```

   Done when `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/api/health` prints `200`.
   - `PORT=3001` matches the Vite proxy, so the backend `.env` never needs reading (the auto-mode classifier can block reading it).
   - The data is local: Postgres is the Docker container on port 5435 (the `ssh` process holding 5435 is Colima's port forward), and Redis is Homebrew Redis on 127.0.0.1:6379.
   - Digest guard: `grep 'news-digest job' "$CLAUDE_JOB_DIR/tmp/backend.log"` shows no `completed` line right after startup. A completed run means a stale repeat schedule is back in Redis (the #115 session found a `* * * * *` one); stop the backend and tell Ana.

3. **Start the frontend from the branch under test.** Run this in the background from the worktree, on a port other than Ana's 8080:

   ```sh
   VITE_API_BASE_URL=http://localhost:5181 pnpm exec vite --port 5181 --strictPort > "$CLAUDE_JOB_DIR/tmp/fe-after.log" 2>&1
   ```

   Pointing `VITE_API_BASE_URL` at the frontend's own origin sends API calls through the Vite proxy (`/api` to 127.0.0.1:3001 in `vite.config.ts`), so sign-in is same-origin whatever `.env.local` says. If 5181 is taken, use the next free port and change both numbers. For before/after, start the main checkout (first line of `git worktree list`) the same way on the next port, and say so if it is not on `main`. Done when `curl` on `http://localhost:<port>/api/health` prints `200` for each frontend.

4. **Open a signed-in browser session per frontend.** Run `node .claude/skills/visual-check/login.mjs http://localhost:<port>`, passing every frontend origin (both ports for before/after). It reuses the cached token or logs in once as the `.env.test` user, writes a Playwright storage-state file with `auth_token` and `meridiano_user` for each origin, and prints its path. Then, per frontend, with the session named `after` (or `before` for the main checkout):

   ```sh
   npx playwright cli -s=after open
   npx playwright cli -s=after resize 1440 900
   npx playwright cli -s=after state-load <state file path>
   ```

   Pass the state file by path only, so the token stays out of the transcript; keep its contents and the localStorage values out of every command and result. Each named session is its own browser, so before and after never share a tab. Dark theme is `set-color-scheme dark`; a mobile width is another `resize`. Done when `goto http://localhost:<port>/` followed by `find "Sign in"` finds no match in each session.
   - Sign-in form still showing: the cached token may predate a backend secret change, so rerun the script with `--fresh` and `state-load` again.
   - The backend allows 5 logins per 15 minutes per IP (`meridiano-nestjs/src/auth/auth.controller.ts:16`). On a 429 the script prints the reset command for the counter in Homebrew Redis; offer it to Ana.

5. **Open each page and screenshot it.** For each page on the list, in each session:
   1. `goto` it, and `click` into any state the item names (an expanded row, an open dialog). `find "<text>"` returns the element refs to click.
   2. Wait for text that only shows once the data loads, such as a heading or label from the page: `run-code "page => page.getByText('<text>').first().waitFor()"`.
   3. `screenshot --filename=~/Desktop/dev/.scratch/YYYY-MM-DD-meridiano-frontend-<issue>-visual/NN-<page>.png`, with the home directory written out as an absolute path.
   4. Read the screenshot and judge it against the page's expected observation. Retake it if it shows a spinner or the login form.

   Done when every page on the list has a screenshot you read and a pass or fail against its observation.

6. **Hand over and clean up.** Write the per-page results in an evidence file next to the screenshots, and send the screenshots that prove the item with `SendUserFile`. When the check backs a PR, put the screenshots in the PR body yourself: reference each one by local path in the body file (`![After: Note and Ask side by side](./after.png)`) and pass the same path to `--attach` on `gh pr create` or `gh pr edit`, which uploads it to GitHub and rewrites the reference to the uploaded URL. Run `close` on each session, stop every server you started with `TaskStop`, and leave the ones you reused running. Done when the reply gives pass or fail per page, `gh pr view --json body` (when there is a PR) shows an uploaded URL in place of every local screenshot path, `npx playwright cli list` prints `(no browsers)`, and `lsof` shows nothing listening on the ports you started.
