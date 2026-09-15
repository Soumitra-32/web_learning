export interface ServerMessage {
  id: number;
  text: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

export interface ClientToServerEvents {
  sendMessage: (data: {
    text: string;
    senderId: number;
    senderName: string;
  }) => void;
}

export interface ServerToClientEvents {
  newMessage: (message: ServerMessage) => void;
}
