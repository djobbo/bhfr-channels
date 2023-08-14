import { DATABASE_URL } from "./src/env"
import type { Config } from "drizzle-kit"

export default {
    schema: "./src/db/schema/index.ts",
    out: "./drizzle",
    driver: "pg",
    dbCredentials: {
        connectionString: DATABASE_URL,
    },
} satisfies Config
