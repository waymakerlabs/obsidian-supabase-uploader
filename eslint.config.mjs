import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "obsidianmd/ui/sentence-case": ["warn", {
        brands: ["Supabase", "RLS"],
        acronyms: ["URL", "API"]
      }]
    }
  }
];
