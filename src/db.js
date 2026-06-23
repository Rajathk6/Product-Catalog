// src/db.js

import pkg from "pg";

const { Pool, types } = pkg;

// OID 1184 = TIMESTAMPTZ
types.setTypeParser(1184, (value) => value);

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});