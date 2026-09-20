export interface ServerMessage {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  /** ISO date string; the client formats it for display. */
  createdAt: string;
}

export interface UserStatusUpdate {
  userId: number;
  isOnline: boolean;
}

/** Attached to every socket by the JWT handshake middleware in server.ts. */
export interface SocketData {
  userId: number;
}

/**
 * senderId is deliberately absent: it is taken from the verified token so a
 * client can never post as somebody else.
 */
export interface ClientToServerEvents {
  sendMessage: (data: { text: string; receiverId: number }) => void;
}

export interface ServerToClientEvents {
  newMessage: (message: ServerMessage) => void;
  userStatusChanged: (update: UserStatusUpdate) => void;
}
