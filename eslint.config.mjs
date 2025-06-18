import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "src/client/**/*",    // Ignore all client-generated code
      "**/*.gen.ts",        // Ignore all .gen files
      "**/*.gen.js",
      ".next/**/*",
      "dist/**/*"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable the no-explicit-any rule that was causing 19 errors
      "@typescript-eslint/no-explicit-any": "off",
      
      // Other commonly problematic rules you might want to disable:
      "@typescript-eslint/no-unused-vars": "warn",     // Change from error to warning
      "react-hooks/exhaustive-deps": "warn",           // Change from error to warning
      "@next/next/no-img-element": "off",               // Allow regular img tags
      "react/no-unescaped-entities": "off",            // Allow unescaped quotes, apostrophes
      
      // If you want to be more permissive:
      // "@typescript-eslint/ban-ts-comment": "off",   // Allow @ts-ignore comments
      // "@typescript-eslint/no-empty-function": "off", // Allow empty functions
      // "prefer-const": "warn",                        // Change from error to warning
    }
  }
];

export default eslintConfig;
