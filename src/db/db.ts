import * as schema from "./schema"
import { DATABASE_URL } from "../env"
import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"
export * from "./schema"

const pool = new Pool({
    connectionString: DATABASE_URL,
})

export const db = drizzle(pool, { schema })
