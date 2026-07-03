import "dotenv/config"
import path from "node:path"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    // Direct connection — required for db pull / migrate (not the pooler URL)
    url: env("DIRECT_URL"),
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg")
      const connectionString = process.env.DIRECT_URL
      return new PrismaPg({ connectionString })
    },
  },
})