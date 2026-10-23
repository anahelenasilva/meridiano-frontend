import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { reactRefresh } from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite(),
  {
    rules: {
      // The ui primitives and both contexts export helpers next to
      // components; fast refresh falls back to a reload there.
      "react-refresh/only-export-components": "warn",
    },
  },
  globalIgnores(["archive/**", "dist/**", "node_modules/**"]),
]);
