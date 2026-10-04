import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  auth: false,
  functions: {
    generateoutfit: {
      name: "generateoutfit",
      source: "./functions/generate-outfit/index.ts",
      env: {
        FOUNDRY_ENDPOINT: process.env.FOUNDRY_ENDPOINT!,
        FOUNDRY_API_KEY: process.env.FOUNDRY_API_KEY!,
        FOUNDRY_DEPLOYMENT: process.env.FOUNDRY_DEPLOYMENT!,
      },
    },
    identifyclothing: {
      name: "identifyclothing",
      source: "./functions/identify-clothing/index.ts",
      env: {
        FOUNDRY_ENDPOINT: process.env.FOUNDRY_ENDPOINT!,
        FOUNDRY_API_KEY: process.env.FOUNDRY_API_KEY!,
        FOUNDRY_DEPLOYMENT: process.env.FOUNDRY_DEPLOYMENT!,
      },
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
