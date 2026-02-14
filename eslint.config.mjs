import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tailwindcss from "eslint-plugin-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      tailwindcss,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Tailwind CSS plugin rules
      ...tailwindcss.configs.recommended.rules,
    },
    "tailwindcss/no-custom-classname": [
      "warn",
      {
        whitelist: ["code-annotation"],
      },
    ],
  },
  globalIgnores(["dist/**", "node_modules/**"]),
]);

export default eslintConfig;
