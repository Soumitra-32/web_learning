import { pool } from "../db";

export interface MessageRow {
  id: number;
  sender_id: number;
  text: string;
  created_at: Date;
}

export interface StoredMessage {
  id: number;
  senderId: number;
  text: string;
  createdAt: string;
}

function mapRowToMessage(row: MessageRow): StoredMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    text: row.text,
    createdAt: row.created_at.toLocaleTimeString(),
  };
}

export async function addMessage(
  senderId: number,
  text: string,
): Promise<StoredMessage> {
  const result = await pool.query<MessageRow>(
    "INSERT INTO messages (sender_id, text) VALUES ($1, $2) RETURNING *",
    [senderId, text],
  );
  return mapRowToMessage(result.rows[0]);
}

export async function getAllMessages(): Promise<StoredMessage[]> {
  const result = await pool.query<MessageRow>(
    "SELECT * FROM messages ORDER BY created_at ASC",
  );
  return result.rows.map(mapRowToMessage);
}
