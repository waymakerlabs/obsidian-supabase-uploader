import obsidianmd from "eslint-plugin-obsidianmd";

export default [
  ...obsidianmd.configs.recommended,
  {
    rules: {
      "obsidianmd/ui/sentence-case": ["warn", {
        brands: ["Supabase", "RLS"],
        acronyms: ["URL", "API"]
      }]
    }
  }
];
