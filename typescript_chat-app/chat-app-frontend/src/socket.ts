import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { API_URL } from "./api";
import type { ClientToServerEvents, ServerToClientEvents } from "./types/chat";

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * Creates a socket that authenticates with the caller's JWT during the
 * handshake. A new socket is created per login, so a token can never leak
 * into a session that has already been logged out.
 */
export function createSocket(token: string): ChatSocket {
  return io(API_URL, {
    auth: { token },
  });
}
