import { query } from "../db";
import { User, UserParams } from "../db/models/user";

export async function getUserByEmail(email: string): Promise<User | undefined> {
    return (await query("SELECT * FROM users WHERE email = $1", [email])).rows[0];
  }

export async function getUserByUsername (username: string):  Promise<User | undefined> {
    return (await query("SELECT * FROM users WHERE username = $1", [username])).rows[0];
  }

  export async function createUserInDB(user: UserParams): Promise<User> {
    const { username, password, email, firstName, lastName, role } = user;
    const insertQuery = `
      INSERT INTO users (username, password, email, first_name, last_name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, username, email, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt", updated_at AS "updatedAt"
    `;
  
    const values: (string | number | boolean)[] = [
        username!,
        password!,
        email!,
        firstName ?? '', 
        lastName ?? '',  
        role,
      ];
    
  
    const result = await query(insertQuery, values);
    
    return result.rows[0];  // Retorna un objeto que cumple con la interfaz User
  }