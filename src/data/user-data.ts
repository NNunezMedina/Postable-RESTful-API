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

  export async function deleteUserFromDatabase(userId: number): Promise<boolean> {
    try {
      const result = await query("DELETE FROM users WHERE id = $1", [userId]);
  
      if (result && typeof result.rowCount === 'number') {
        return result.rowCount > 0; 
      }
  
      return false; 
    } catch (error) {
      console.error("Error at eliminating user", error);
      throw new Error("Error in database"); 
    }
  }

  export const UserData = {
    async updateUser(userId: number, updates: Partial<User>): Promise<User | null> {
      try {
        const mappedUpdates: Partial<Record<string, any>> = {
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
        };
  
        const keys = Object.keys(mappedUpdates).filter(key => mappedUpdates[key] !== undefined);
        const values = keys.map(key => mappedUpdates[key]);

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
        const result = await query(
          `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`,
          [...values, userId]
        );
  
        return result.rows[0] || null; 
      } catch (error) {
        console.error("Error al actualizar el usuario en la base de datos:", error);
        throw new Error("Error al actualizar el usuario.");
      }
    },
  };

  export async function getUserById(userId: number) {
    try {
      const result = await query(
        `SELECT id, username, email, first_name AS "firstName", last_name AS "lastName", role, created_at AS "createdAt", updated_at AS "updatedAt" 
       FROM users WHERE id = $1`,
        [userId]
      );
  
      return result.rows[0] || null; 
    } catch (error) {
      console.error("Error getting user from database:", error);
      throw new Error("Error getting user.");
    }
  }
  
