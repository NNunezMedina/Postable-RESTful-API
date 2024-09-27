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
    
    return result.rows[0];  
  }

  export async function deleteUserFromDatabase(username: string): Promise<boolean> {
    try {
      const result = await query("DELETE FROM users WHERE username = $1", [username]);
  
      if (result && typeof result.rowCount === 'number') {
        return result.rowCount > 0; 
      }
  
      return false; 
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      throw new Error("Error en la base de datos"); 
    }
  }
