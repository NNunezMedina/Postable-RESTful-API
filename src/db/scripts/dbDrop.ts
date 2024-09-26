import "dotenv/config";
import { adminClient } from "..";

const dbName = process.env["PGDATABASE"];

adminClient.connect();

adminClient.query(`DROP DATABASE IF EXISTS "${dbName}"`, (err) => {
  if (err) {
    console.error("Error at eliminating the database", err.stack);
  } else {
    console.log(`Database "${dbName}" eliminated successfully`);
  }
  adminClient.end();
});
