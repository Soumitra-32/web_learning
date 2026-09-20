import { pool } from "../db";

export interface MessageRow {
  id: number;
  sender_id: number;
  receiver_id: number;
  text: string;
  created_at: Date | string;
  sender_name: string;
}

export interface StoredMessage {
  id: number;
  senderId: number;
  receiverId: number;
  senderName: string;
  text: string;
  createdAt: string;
}

function toIsoString(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function mapRowToMessage(row: MessageRow): StoredMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    senderName: row.sender_name,
    text: row.text,
    createdAt: toIsoString(row.created_at),
  };
}

export async function addMessage(
  senderId: number,
  receiverId: number,
  text: string
): Promise<StoredMessage> {
  const result = await pool.query<MessageRow>(
    `INSERT INTO messages (sender_id, receiver_id, text) VALUES ($1, $2, $3)
     RETURNING id, sender_id, receiver_id, text, created_at,
       (SELECT name FROM users WHERE id = $1) AS sender_name`,
    [senderId, receiverId, text]
  );
  return mapRowToMessage(result.rows[0]);
}

/**
 * The private history between two users, oldest message first.
 * Only these two people can ever be part of the result.
 */
export async function getConversation(
  userId: number,
  otherUserId: number
): Promise<StoredMessage[]> {
  const result = await pool.query<MessageRow>(
    `SELECT messages.id, messages.sender_id, messages.receiver_id,
            messages.text, messages.created_at,
            users.name AS sender_name
     FROM messages
     JOIN users ON messages.sender_id = users.id
     WHERE (messages.sender_id = $1 AND messages.receiver_id = $2)
        OR (messages.sender_id = $2 AND messages.receiver_id = $1)
     ORDER BY messages.created_at ASC, messages.id ASC`,
    [userId, otherUserId]
  );
  return result.rows.map(mapRowToMessage);
}
