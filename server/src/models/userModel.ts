// server/src/models/userModel.ts
import { query } from '../config/db';

export interface User {
  id?: number;
  email: string;
  password_hash: string;
  created_at?: Date;
}

export const UserModel = {
  // Find if email already exists
  findByEmail: async (email: string): Promise<User | null> => {
    const text = 'SELECT * FROM users WHERE email = $1';
    const res = await query(text, [email]);
    return res.rows.length > 0 ? res.rows[0] : null;
  },

  // Insert new user into database
  create: async (email: string, passwordHash: string): Promise<User> => {
    const text = `
      INSERT INTO users (email, password_hash) 
      VALUES ($1, $2) 
      RETURNING id, email, created_at
    `;
    const res = await query(text, [email, passwordHash]);
    return res.rows[0];
  }
};