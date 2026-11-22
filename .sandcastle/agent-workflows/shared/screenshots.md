# Screenshots in a factory job

The job has no backend, so every `/api` request the page makes gets its answer from you. Unanswered ones return 502 through the Vite proxy and the page shows an error state. The commands are the Playwright CLI, `npx playwright cli`, which ships with the repo's `@playwright/test`. `npx playwright cli --help` lists them all.

1. Start the app on its own port, with the API base set to the app's own origin so every request is a same-origin `/api/...` the browser session can answer:

   ```sh
   VITE_API_BASE_URL=http://localhost:5181 pnpm exec vite --port 5181 --strictPort > /tmp/vite.log 2>&1 &
   ```

2. Write a signed-in session to /tmp/state.json. `AuthContext` restores a session from `localStorage` when `auth_token` is set and `meridiano_user` has an `id`, and asks the backend nothing:

   ```json
   {
     "cookies": [],
     "origins": [
       {
         "origin": "http://localhost:5181",
         "localStorage": [
           { "name": "auth_token", "value": "factory" },
           {
             "name": "meridiano_user",
             "value": "{\"id\":\"1\",\"email\":\"factory@example.com\",\"username\":\"factory\"}"
           }
         ]
       }
     ]
   }
   ```

3. Open the browser, load the session, and answer the requests the page makes. The response types are in `src/types/api.ts`, and the functions that call each endpoint are in `src/services/api.ts`:

   ```sh
   npx playwright cli open
   npx playwright cli resize 1440 900
   npx playwright cli state-load /tmp/state.json
   npx playwright cli route "**/api/profiles" --content-type application/json --body '["technology"]'
   npx playwright cli route "**/api/articles?*" --content-type application/json --body '{"articles":[],"pagination":{"page":1,"per_page":20,"total_pages":1,"total_articles":0}}'
   ```

4. Open the page, wait for text that only shows once its data has loaded, and save the PNG:

   ```sh
   mkdir -p /tmp/evidence
   npx playwright cli goto http://localhost:5181/articles
   npx playwright cli run-code "page => page.getByText('Articles').first().waitFor()"
   npx playwright cli screenshot --filename=/tmp/evidence/after.png
   ```

   `npx playwright cli requests` lists what the page asked for. Any `/api` line that is not 200 still needs a `route`.

5. Read the PNG before you rely on it. Retake it when it shows the sign-in form, a spinner or an error state.

6. Finish with `npx playwright cli close` and stop Vite. The CLI writes its own files to `.playwright-cli/`, which git ignores.

Give the mocked answers enough rows to show the change: an empty list proves little. Say in the text next to a screenshot that its data is mocked. Dark theme is `npx playwright cli set-color-scheme dark`, and a mobile width is another `resize`.
