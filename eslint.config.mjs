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
      // Warnings, not errors, until the flagged effects are reworked: the
      // React Compiler rules landed with react-hooks 7 and 12 existing
      // sites trip them (AuthContext, ThemeContext, CustomBriefingPage,
      // ArticleDetailPage, EditArticleModal, EditChannelCategoriesModal,
      // NoteEditor, and the unused ui/carousel and ui/sidebar).
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // The ui primitives and both contexts export helpers next to
      // components; fast refresh falls back to a reload there.
      "react-refresh/only-export-components": "warn",
    },
  },
  globalIgnores(["archive/**", "dist/**", "node_modules/**"]),
]);
