import { query } from "..";
import path from "node:path";
import fs from "node:fs";
import { JSONStorage, Umzug } from "umzug";

const migrator = new Umzug({
  migrations: { glob: path.join(__dirname, "..", "migrations", "*.ts") },
  context: { query },
  storage: new JSONStorage({
    path: path.join(__dirname, "..", "migrations", "migrations.json"),
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
