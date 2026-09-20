/** A chat contact as returned by GET /api/users. */
export interface User {
  id: number;
  name: string;
  isOnline: boolean;
}

/** The logged-in account as returned by /api/auth/login and /api/users/me. */
export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface ServerMessage {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  receiverId: number;
  /** ISO date string; format it for display in the UI. */
  createdAt: string;
}

export interface UserStatusUpdate {
  userId: number;
  isOnline: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

/** senderId is not sent: the server reads it from the verified token. */
export interface ClientToServerEvents {
  sendMessage: (data: { text: string; receiverId: number }) => void;
}

export interface ServerToClientEvents {
  newMessage: (message: ServerMessage) => void;
  userStatusChanged: (update: UserStatusUpdate) => void;
}
