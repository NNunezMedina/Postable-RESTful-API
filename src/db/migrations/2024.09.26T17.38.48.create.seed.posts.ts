import { faker } from "@faker-js/faker";
import { Migration } from "../scripts/dbMigrate";

export const up: Migration = async (params) => {
  const client = params.context;
  try {
    const userResult = await client.query(`SELECT id FROM users`);
    const userIds = userResult.rows.map((row) => row.id);

    for (let i = 0; i < 20; i++) {
      const content = faker.lorem.paragraphs(2);
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      await client.query(
        `
        INSERT INTO posts (user_id, content, created_at, updated_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [userId, content]
      );
    }
    console.log("Seeded 20 fake posts successfully.");
  } catch (err) {
    console.error("Error seeding posts:", err);
    throw err;
  }
};
export const down: Migration = async (params) => {
  const client = params.context;
  try {
    await client.query(`DELETE FROM posts WHERE content LIKE '%Lorem%'`);
    console.log("Deleted seeded posts.");
  } catch (err) {
    console.error("Error deleting seeded posts:", err);
    throw err;
  }
};
