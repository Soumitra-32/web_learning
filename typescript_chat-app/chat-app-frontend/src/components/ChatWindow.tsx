import type { User, ChatMessage } from "../types/chat";
import Message from "./Message";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

function ChatWindow({ user, messages, onSendMessage }: ChatWindowProps) {
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{user.name}</h3>
        <span>{user.isOnline ? "Online" : "Offline"}</span>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} isOwnMessage={msg.senderId === 0} />
        ))}
      </div>
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}

export default ChatWindow;