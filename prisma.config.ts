// prisma.config.ts
// ──────────────────────────────────────────────────────────────
// This file is REQUIRED for Prisma 7+ when using the new config system
// It replaces the old url = env("...") inside schema.prisma
// ──────────────────────────────────────────────────────────────

import "dotenv/config"; // Automatically loads your .env file
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // Path to your Prisma schema file
  schema: "prisma/schema.prisma",

  // Where Prisma should store migration files
  migrations: {
    path: "prisma/migrations",
  },

  // Datasource configuration – this is where DATABASE_URL is read from .env
  datasource: {
    url: env("DATABASE_URL"),           // ← this is correct and required

    // Optional: if you have a separate direct connection (e.g. for migrations vs pooled)
    // directUrl: env("DIRECT_URL"),

    // Optional: if you're using Prisma Accelerate
    // accelerateUrl: env("PRISMA_ACCELERATE_URL"),
  },

  // Optional: you can add more settings here later (generator, etc.)
  // But for now this is minimal and sufficient
});