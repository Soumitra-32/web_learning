

import { io, Socket } from "socket.io-client";

interface ServerMessage {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

interface ClientToServerEvents {
  sendMessage: (data: { text: string; senderId: number; senderName: string }) => void;
}

interface ServerToClientEvents {
  newMessage: (message: ServerMessage) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  "http://localhost:3001"
);

export type { ServerMessage };