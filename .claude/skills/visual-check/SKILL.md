---
name: visual-check
description: Use when Ana asks you to check a change in the browser, such as a visual check, a screenshot of a page, or an issue's "done when" item that needs eyes on the UI.
---

# Visual check

One browser, one cached login, pages opened by hand with the Playwright MCP tools (`mcp__playwright__browser_*`). You run your own servers on your own ports and leave Ana's alone. The check is an eyeball check of what the issue names; the CI tests are the proof.

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

4. **Sign in with the agent session.** Run `node .claude/skills/visual-check/login.mjs`. It reuses the cached session or logs in once as the `.env.test` user, then prints the session file path. Then `browser_resize` to 1440×900, `browser_navigate` to `http://localhost:<port>/`, and run this with `browser_run_code_unsafe`, using the printed path:

   ```js
   async (page) => {
     await page.route("**/__agent_session", (r) =>
       r.fulfill({ path: "<session file path>", contentType: "application/json" }),
     );
     const who = await page.evaluate(async () => {
       const s = await (await fetch("/__agent_session")).json();
       localStorage.setItem("auth_token", s.access_token);
       localStorage.setItem("meridiano_user", JSON.stringify(s.user));
       return s.user.username;
     });
     await page.unroute("**/__agent_session");
     await page.reload();
     return who;
   }
   ```

   The page reads the file through the routed fetch, so the token stays out of the transcript; keep the session file and localStorage values out of every command and result. localStorage is per origin, so a before/after check runs the snippet once per frontend port. Done when the snippet returns the username and the reloaded page shows its data, not the sign-in form.
   - Sign-in form still showing: the cached token may predate a backend secret change, so rerun the script with `--fresh`.
   - The backend allows 5 logins per 15 minutes per IP (`meridiano-nestjs/src/auth/auth.controller.ts:16`). On a 429 the script prints the reset command for the counter in Homebrew Redis; offer it to Ana.

5. **Open each page and screenshot it.** For each page on the list:
   1. `browser_navigate` to it, and click into any state the item names (an expanded row, an open dialog).
   2. `browser_wait_for` text that only shows once the data loads, such as a heading or label from the page.
   3. `browser_take_screenshot` with `filename: ".playwright-mcp/<issue>/NN-<page>.png"` (`.playwright-mcp/` is gitignored). The MCP server writes only inside its allowed roots; if a save fails, the error lists them, so pick one. The tool result shows where the file landed.
   4. Read the screenshot and judge it against the page's expected observation. Retake it if it shows a spinner or the login form.

   Done when every page on the list has a screenshot you read and a pass or fail against its observation.

6. **Hand over and clean up.** Copy the screenshots to `~/Desktop/dev/.scratch/YYYY-MM-DD-meridiano-frontend-<issue>-visual/`, write the per-page results in an evidence file there, and send the screenshots that prove the item with `SendUserFile`. Stop every server you started with `TaskStop`, and leave the ones you reused running. Done when the reply gives pass or fail per page and `lsof` shows nothing listening on the ports you started.
