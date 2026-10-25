// Compile-time guards on typedApiFetch's request body. `pnpm typecheck` checks
// this file (tsconfig includes `src`); vitest skips it, because its name does
// not match `src/**/*.{test,spec}.{ts,tsx}`. Nothing here runs: the probes sit
// in a function no one calls.
//
// Each `@ts-expect-error` is the assertion. If the body stops being checked
// against the generated schema in src/types/api.ts, the directive goes unused
// and `pnpm typecheck` fails with TS2578. Each probed call stays on one line,
// so the error lands on the line the directive covers.
import { typedApiFetch } from "./api";

export function requestBodyTypeProbes() {
  // POST /api/notes declares SaveNoteDto, so its exact shape compiles.
  void typedApiFetch("/api/notes", "post", { source_type: "article", source_id: "a-1", content: "hello" });

  // @ts-expect-error 'sourceType' is not a key SaveNoteDto declares
  void typedApiFetch("/api/notes", "post", { sourceType: "article", source_id: "a-1", content: "hello" });

  // @ts-expect-error SaveNoteDto requires 'content'
  void typedApiFetch("/api/notes", "post", { source_type: "article", source_id: "a-1" });

  // GET /api/profiles declares `requestBody?: never`, so it takes no body.
  void typedApiFetch("/api/profiles", "get");

  // @ts-expect-error GET /api/profiles declares no request body
  void typedApiFetch("/api/profiles", "get", { source_type: "article" });
}
