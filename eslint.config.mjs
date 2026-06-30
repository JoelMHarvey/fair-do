import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // setState-in-effect is a heuristic that false-positives on legitimate mount-time
  // browser-capability detection (PWA install, push support, localStorage). Keep it
  // visible as a warning rather than a hard error.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      // Literal apostrophes/quotes in JSX text render correctly; this rule is
      // pure stylistic noise across our marketing/UI copy.
      "react/no-unescaped-entities": "off",
    },
  },
  // Playwright fixtures use a `use` callback that the React hooks rule
  // mistakes for the React `use` hook.
  {
    files: ["tests/e2e/**"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design-skill scratch assets (not application code) and generated SW.
    ".claude/**",
    "public/sw.js",
  ]),
]);

export default eslintConfig;
