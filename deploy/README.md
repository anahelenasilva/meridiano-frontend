# Deploying the frontend to the Raspberry Pi

The Pi checks `origin/main` every two minutes. When it moves, the Pi pulls,
builds, and restarts `meridiano-frontend.service`. If the app does not come back
healthy, the previous commit gets rebuilt and restarted.

Nothing on the internet reaches the Pi. No forwarded port, no tunnel, no
credential in either direction. The Pi does all the reaching out, and a public
repo needs no authentication to fetch.

This is the API deploy with the database parts removed. There is no Postgres
backup and no migration step here, because the frontend has no database.
Rollback is pure code: rebuild the previous commit.

## What runs where

| Piece | Where | What it does |
| --- | --- | --- |
| `deploy.sh` | `/usr/local/bin/meridiano-frontend-deploy` | Fetch, build, restart, roll back on failure |
| `meridiano-frontend-deploy.timer` | systemd | Runs the script every two minutes |
| `meridiano-frontend.service` | systemd | The app itself, `vite preview` on port 8080 as `anahelena` |

The script runs as root so it can restart the unit. Every `git` and `pnpm` call
drops to `anahelena` with `sudo -u`. Running those as root would leave
root-owned files in the checkout and break the next deploy.

## Setup

Pull the files straight out of `origin/main` without moving the checkout. Do
not `git pull` first: that makes `HEAD` equal `origin/main`, and the script
would then report "nothing to do" and skip the build entirely.

```sh
cd /home/anahelena/dev/meridiano-frontend
git fetch origin main

git show origin/main:deploy/deploy.sh | sudo tee /usr/local/bin/meridiano-frontend-deploy >/dev/null
sudo chmod 755 /usr/local/bin/meridiano-frontend-deploy
git show origin/main:deploy/meridiano-frontend-deploy.service | sudo tee /etc/systemd/system/meridiano-frontend-deploy.service >/dev/null
git show origin/main:deploy/meridiano-frontend-deploy.timer | sudo tee /etc/systemd/system/meridiano-frontend-deploy.timer >/dev/null
sudo systemctl daemon-reload
```

These installed copies do not self-update. A deploy updates the checkout, so a
later change to `deploy/deploy.sh` or either unit lands in
`/home/anahelena/dev/meridiano-frontend/deploy/` and sits there until you rerun
the block above. Run `sudo systemctl daemon-reload` again after any unit change.

Run it by hand first and watch the whole thing:

```sh
sudo /usr/local/bin/meridiano-frontend-deploy
```

Then start the timer:

```sh
sudo systemctl enable --now meridiano-frontend-deploy.timer
systemctl list-timers meridiano-frontend-deploy.timer
```

Nothing else needs configuring. The script's defaults already match this Pi: the
checkout at `/home/anahelena/dev/meridiano-frontend`, the `anahelena` user,
`meridiano-frontend.service`, and port 8080.

## Day to day

Watch a deploy:

```sh
journalctl -u meridiano-frontend-deploy.service -f
```

Deploy now instead of waiting for the timer:

```sh
sudo systemctl start meridiano-frontend-deploy.service
```

Roll back to any commit by hand:

```sh
cd /home/anahelena/dev/meridiano-frontend
git reset --hard <sha> && pnpm install --frozen-lockfile && pnpm run build
sudo systemctl restart meridiano-frontend
```

The timer will pull it forward to `origin/main` again within two minutes, so
revert on GitHub if you want the rollback to stick.

## When a deploy fails

The script writes the failing commit to
`/var/lib/meridiano-frontend/failed-sha` and refuses to try it again until
`origin/main` moves to something else. Without that, a commit that fails its
health check would rebuild and restart every two minutes forever.

So a failed deploy leaves you on the previous commit, waiting for you to push a
fix. To force a retry of the same commit:

```sh
sudo rm /var/lib/meridiano-frontend/failed-sha
```

The script also refuses to run at all when tracked files are modified in the
checkout, rather than resetting over your work. Untracked files are never
touched and `git clean` is never called, so the stray `.next/` and
`next-env.d.ts` in the checkout are safe.

## Known trade-offs

`pnpm run build` rewrites `dist/` while the old `vite preview` is still serving
from it. `vite preview` is a static file server that reads from disk per
request, so during the build window a request can briefly 404 on a chunk that
has not been rewritten yet. The window is the length of one `vite build` (tens
of seconds) and only on a deploy. For a personal dashboard that is fine. If it
ever matters, build to a staging dir and swap it into place, at the cost of more
machinery than this deserves right now.

Rollback rebuilds from source, so a failed deploy means a few minutes of running
the old code before it is restored, rather than a few seconds.

The Pi deploys whatever is on `origin/main` without checking whether CI passed.
Pull requests are gated by `pr-checks.yml`, so this only matters for direct
pushes to main. Auto-rollback is the safety net there.

## Knobs

Set any of these in `meridiano-frontend-deploy.service`. Defaults are in the
script header.

`REPO`, `APP_USER`, `SERVICE`, `BRANCH`, `PNPM`, `PORT`, `HEALTH_TIMEOUT`,
`STATE_DIR`.
