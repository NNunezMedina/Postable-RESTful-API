import { query } from "..";
import path from "node:path";
import fs from "node:fs";
import { JSONStorage, Umzug } from "umzug";
import {configDotenv } from 'dotenv';

console.log("Database for migrations:", process.env["PGDATABASE"]);
if (process.env["NODE_ENV"] === "test") {
  configDotenv({ path: ".env.test" });
  console.log("Database: ", process.env["PGDATABASE"]);
} else {
  configDotenv();
}

console.log("Database for migrations:", process.env["PGDATABASE"]);

const migrationsFileName =
  process.env["NODE_ENV"] === "test"
    ? "migrations.test.json"
    : "migrations.json";
    console.log("NODE_ENV:", process.env["NODE_ENV"]);
    console.log(migrationsFileName);

const migrator = new Umzug({
  migrations: { glob: path.join(__dirname, "..", "migrations", "*.ts") },
  context: { query },
  storage: new JSONStorage({
    path: path.join(__dirname, "..", "migrations", migrationsFileName),
  }),
  logger: console,
  create: {
    folder: path.join(__dirname, "..", "migrations"),
    template: (filepath) => [
      [
        filepath,
        fs
          .readFileSync(
            path.join(__dirname, "..", "template/migration-template.ts")
          )
          .toString(),
      ],
    ],
  },
});

export type Migration = typeof migrator._types.migration;

migrator.runAsCLI();
