import type { User } from "../types/chat";
import type { ServerMessage } from "../socket";
import Message from "./Message";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  user: User;
  messages: ServerMessage[];
  currentUserId: number;
  onSendMessage: (text: string) => void;
}

function ChatWindow({ user, messages, currentUserId, onSendMessage }: ChatWindowProps) {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{user.name}</h3>
        <span>{user.isOnline ? "Online" : "Offline"}</span>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            message={msg}
            isOwnMessage={msg.senderId === currentUserId}
          />
        ))}
      </div>
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}

export default ChatWindow;