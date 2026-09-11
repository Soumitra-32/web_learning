export interface User {
  id: number;
  name: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: number;
  text: string;
  senderId: number;
  createdAt: string;
}