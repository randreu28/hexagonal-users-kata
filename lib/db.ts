import { Database } from "./types";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const dialect = new PostgresDialect({
  pool: new Pool({
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
    max: parseInt(process.env.POSTGRES_MAX || "10"),
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
