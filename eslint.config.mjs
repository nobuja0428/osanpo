import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  globalIgnores([
    ".next/**",
    "out/**",
    "node_modules/**",
    "_audit_osanpo_source/**",
    "_audit_osanpo_main/**",
    "public/**",
    "*.js",
    "*.mjs",
    "*.html",
  ]),
]);
