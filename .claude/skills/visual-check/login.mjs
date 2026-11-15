// Usage: node .claude/skills/visual-check/login.mjs [--fresh]
//
// Writes a session for the local backend to ~/.cache/meridiano/agent-session.json
// ({ access_token, user }, mode 600) and prints its path. The visual-check skill
// loads that file into the Playwright MCP browser. Reuses the cached session while
// its token has more than an hour left, so one real login covers about a day.
// --fresh skips the cache. Reads E2E_USERNAME and E2E_PASSWORD from the main
// checkout's .env.test. Prints the username, never the password or the token.
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";
const SESSION_FILE = join(homedir(), ".cache", "meridiano", "agent-session.json");
const MIN_TOKEN_LIFE_MS = 60 * 60 * 1000;

function tokenExpiry(token) {
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  return new Date(payload.exp * 1000);
}

function report(session, source) {
  const expires = tokenExpiry(session.access_token).toISOString();
  console.log(`${source} session for ${session.user.username}, token expires ${expires}`);
  console.log(`session file: ${SESSION_FILE}`);
}

function readCachedSession() {
  if (process.argv.includes("--fresh") || !existsSync(SESSION_FILE)) return null;
  try {
    const session = JSON.parse(readFileSync(SESSION_FILE, "utf8"));
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

const cached = readCachedSession();
if (cached) {
  report(cached, "reusing cached");
} else {
  try {
    const session = await login();
    mkdirSync(dirname(SESSION_FILE), { recursive: true, mode: 0o700 });
    writeFileSync(SESSION_FILE, JSON.stringify(session), { mode: 0o600 });
    chmodSync(SESSION_FILE, 0o600);
    report(session, "new");
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
