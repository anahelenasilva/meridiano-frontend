// Usage: node .claude/skills/visual-check/login.mjs [--fresh] <frontend origin>...
//   e.g. node .claude/skills/visual-check/login.mjs http://localhost:5181 http://localhost:5182
//
// Writes a Playwright storage-state file for the local backend's session to
// ~/.cache/meridiano/agent-state.json (mode 600) and prints its path. The file sets
// localStorage auth_token and meridiano_user on every origin passed in, so
// `npx playwright cli state-load <path>` signs a browser session in. Reuses the cached
// token while it has more than an hour left, so one real login covers about a day.
// --fresh skips the cache. Reads E2E_USERNAME and E2E_PASSWORD from the main
// checkout's .env.test. Prints the username, never the password or the token.
/* global process, Buffer, console, fetch -- Node globals; eslint.config.mjs assumes the browser */
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";
const STATE_FILE = join(homedir(), ".cache", "meridiano", "agent-state.json");
const MIN_TOKEN_LIFE_MS = 60 * 60 * 1000;

function tokenExpiry(token) {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  return new Date(payload.exp * 1000);
}

function readCachedSession() {
  if (process.argv.includes("--fresh") || !existsSync(STATE_FILE)) return null;
  try {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf8"));
    // Every origin holds the same session, so the first one is enough.
    const items = Object.fromEntries(state.origins[0].localStorage.map((item) => [item.name, item.value]));
    const session = { access_token: items.auth_token, user: JSON.parse(items.meridiano_user) };
    const msLeft = tokenExpiry(session.access_token).getTime() - Date.now();
    return msLeft > MIN_TOKEN_LIFE_MS ? session : null;
  } catch {
    return null;
  }
}

// .env.test is gitignored, so worktrees lack it; read the main checkout's copy.
function readTestCredentials() {
  const gitDir = execFileSync("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], {
    encoding: "utf8",
  }).trim();
  const envPath = join(dirname(gitDir), ".env.test");
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  if (!env.E2E_USERNAME || !env.E2E_PASSWORD) {
    throw new Error(`E2E_USERNAME or E2E_PASSWORD missing in ${envPath}`);
  }
  return { email: env.E2E_USERNAME, password: env.E2E_PASSWORD };
}

async function login() {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(readTestCredentials()),
  });
  if (response.status === 429) {
    throw new Error(
      "429: login limit hit (5 per 15 min per IP). Reset: redis-cli -h 127.0.0.1 DEL rate_limit:127.0.0.1",
    );
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`login failed with ${response.status}: ${body.message ?? "no message"}`);
  return { access_token: body.access_token, user: body.user };
}

function writeState(session, origins) {
  const localStorage = [
    { name: "auth_token", value: session.access_token },
    { name: "meridiano_user", value: JSON.stringify(session.user) },
  ];
  const state = { cookies: [], origins: origins.map((origin) => ({ origin, localStorage })) };
  mkdirSync(dirname(STATE_FILE), { recursive: true, mode: 0o700 });
  writeFileSync(STATE_FILE, JSON.stringify(state), { mode: 0o600 });
  chmodSync(STATE_FILE, 0o600);
}

const origins = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
if (origins.length === 0) {
  console.error("Pass each frontend origin to sign in, e.g. http://localhost:5181");
  process.exit(1);
}

try {
  const cached = readCachedSession();
  const session = cached ?? (await login());
  writeState(session, origins);
  const expires = tokenExpiry(session.access_token).toISOString();
  console.log(`${cached ? "reusing cached" : "new"} session for ${session.user.username}, token expires ${expires}`);
  console.log(`state file: ${STATE_FILE}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
