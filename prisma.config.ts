import { defineConfig } from "prisma/config";
import { loadEnvFile } from "process";

// Load environment variables from .env file (supported in Node 20.6.0+)
try {
  loadEnvFile();
} catch (error) {
  // Ignore if .env file is missing
}

export default defineConfig({
  schema: "./db/schema.prisma",
});
