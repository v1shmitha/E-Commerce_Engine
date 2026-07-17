import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Direct connection — required for db pull / migrate (not the pooler URL)
    url: env("DIRECT_URL"),
  },
})