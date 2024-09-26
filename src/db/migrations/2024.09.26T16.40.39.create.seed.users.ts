import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { Migration } from "../scripts/dbMigrate";

export const up: Migration = async (params) => {
  const client = params.context;

  try {
    for (let i = 0; i < 10; i++) {
      const username = faker.internet.userName();
      const password = await bcrypt.hash("password123", 10);
      const email = faker.internet.email();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const role = "user";
      await client.query(
        `
        INSERT INTO users (username, password, email, first_name, last_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [username, password, email, firstName, lastName, role]
      );
    }
    console.log("Seeded 10 fake users successfully.");
  } catch (err) {
    console.error("Error seeding users:", err);
    throw err;
  }
};

export const down: Migration = async (params) => {
  const client = params.context;

  try {
    await client.query(`DELETE FROM users WHERE email LIKE '%@%'`);
    console.log("Deleted seeded users.");
  } catch (err) {
    console.error("Error deleting seeded users:", err);
    throw err;
  }
};
