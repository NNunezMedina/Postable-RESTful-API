import { configDotenv } from "dotenv";
import { Client, Pool } from "pg";

if (process.env["NODE_ENV"] === "test") {
  configDotenv({ path: ".env.test" });
  console.log("Using .env.test configuration.");
  console.log("Database for migrations:", process.env["PGDATABASE"]);
  
} else {
  configDotenv();
  console.log("Using .env configuration.");
}

export const pool = new Pool({
  host: process.env["PGHOST"],
  port: Number(process.env["PGPORT"]),
  database: process.env["PGDATABASE"],
  user: process.env["PGUSER"],
  password: process.env["PGPASSWORD"],
});

console.log("Connecting to database:", process.env["PGDATABASE"]);

export const query = (text: string, params?: (string | number | boolean)[]) => {
    return pool.query(text, params);
  };

export const adminClient = new Client({
  host: process.env["PGHOST"],
  port: Number(process.env["PGPORT"]),
  database: process.env["PGDATABASE"],
  user: process.env["PGUSER"],
  password: process.env["PGPASSWORD"],
});
