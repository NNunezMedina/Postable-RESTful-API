import express from "express";
import { describe, beforeEach, it, expect } from "vitest";
import request from "supertest";
import { configDotenv } from "dotenv";
import { truncateTable } from "../data/utils-test";
import { pool } from "../db";

console.log("Prueba NODE_ENV:", process.env["NODE_ENV"]);
if (process.env["NODE_ENV"] === "test") {
  configDotenv({ path: ".env.test" });
  console.log("Database: ", process.env["PGDATABASE"]);
} else {
  configDotenv();
}

export const app = express();
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *",
      [username, password, email]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Error al crear el usuario" });
  }
});

app.post("/login", async (req, res) => {
  const { password, email } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    if (user.password !== password) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = "mocked_token";

    return res.status(200).json({ data: { ...user, token } });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token || token !== "mocked_token") {
    return res.status(401).json({ ok: false, message: "Not authorized" });
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    "tati@email.com",
  ]);

  return res.json({
    ok: true,
    data: result.rows[0],
  });
});

interface Users {
  username: string;
  password: string;
  email: string;
}

const testUsers: Users[] = [
  { username: "Tatiana", password: "1234567", email: "tati@email.com" },
  { username: "Felipe", password: "12345678", email: "felipe@email.com" },
  { username: "Nancy", password: "12345679", email: "nancy@email.com" },
];

describe("Users API", () => {
  beforeEach(async () => {
    await truncateTable("users");

    const values = testUsers
      .map(
        (user) => `('${user.username}', '${user.password}', '${user.email}')`
      )
      .join(", ");
    const query = `INSERT INTO users (username, password, email) VALUES ${values}`;

    await pool.query(query);
  });

  it("should create a user", async () => {
    const usersData: Users = {
      username: "Kathy",
      password: "lalalala1",
      email: "kathy@mail.com",
    };
    const response = await request(app).post("/signup").send(usersData);
    expect(response.statusCode).toBe(201);
    expect(response.body.data).toHaveProperty("id");
    expect(response.body.data).toMatchObject({
      username: usersData.username,
      email: usersData.email,
    });
  });

  it("should login successfully with valid credentials", async () => {
    const response = await request(app)
      .post("/login")
      .send({
        email: "tati@email.com",
        password: "1234567",
      })
      .expect("Content-Type", /json/)
      .expect(200);

    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("username", "Tatiana");
    expect(response.body.data).toHaveProperty("token", "mocked_token");
  });

  describe("GET /me", () => {
    it("should get user profile when authenticated", async () => {
      const response = await request(app)
        .get("/me")
        .set("Authorization", "Bearer mocked_token")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);
      expect(response.body.data).toHaveProperty("username", "Tatiana");
      expect(response.body.data).toHaveProperty("email", "tati@email.com");
    });

    it("should return 401 if not authenticated", async () => {
      const response = await request(app)
        .get("/me")
        .expect("Content-Type", /json/)
        .expect(401);

      expect(response.body).toHaveProperty("ok", false);
      expect(response.body).toHaveProperty("message", "Not authorized");
    });
  });
  
  
});
