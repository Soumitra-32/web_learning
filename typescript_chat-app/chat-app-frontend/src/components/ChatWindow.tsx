import { useEffect, useRef } from "react";
import type { ServerMessage, User } from "../types/chat";
import Message from "./Message";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  user: User;
  messages: ServerMessage[];
  currentUserId: number;
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

function ChatWindow({
  user,
  messages,
  currentUserId,
  onSendMessage,
  disabled,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Keep the newest message in view, also when switching contact.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, user.id]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>{user.name}</h3>
        <span className={`status ${user.isOnline ? "online" : "offline"}`}>
          {user.isOnline ? "Online" : "Offline"}
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">No messages yet — say hi 👋</p>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={onSendMessage} disabled={disabled} />
    </div>
  );
}

export default ChatWindow;
