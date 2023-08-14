import { db } from "./db"
import { migrate } from "drizzle-orm/node-postgres/migrator"

migrate(db, { migrationsFolder: "./drizzle" })
    .then(() => {
        console.log("Migrations ran successfully")
    })
    .catch((err) => {
        console.log("Error running migrations", err)
    })
