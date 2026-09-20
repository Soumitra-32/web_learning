import { pool } from "../db";
import type { User, UserRow } from "../types/auth";

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    isOnline: row.is_online,
  };
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] ? mapRowToUser(result.rows[0]) : undefined;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] ? mapRowToUser(result.rows[0]) : undefined;
}

export async function addUser(
  name: string,
  email: string,
  hashedPassword: string
): Promise<User> {
  const result = await pool.query<UserRow>(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, hashedPassword]
  );
  return mapRowToUser(result.rows[0]);
}

export async function getAllUsers(): Promise<User[]> {
  const result = await pool.query<UserRow>(
    "SELECT * FROM users ORDER BY name ASC"
  );
  return result.rows.map(mapRowToUser);
}

export async function setUserOnlineStatus(
  id: number,
  isOnline: boolean
): Promise<void> {
  await pool.query("UPDATE users SET is_online = $1 WHERE id = $2", [
    isOnline,
    id,
  ]);
}

/** Clears stale "online" flags left behind by a crash or hard restart. */
export async function resetOnlineStatus(): Promise<void> {
  await pool.query("UPDATE users SET is_online = false WHERE is_online = true");
}