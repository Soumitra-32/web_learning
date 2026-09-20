import type { ServerMessage } from "../types/chat";

interface MessageProps {
  message: ServerMessage;
  isOwnMessage: boolean;
}

function formatTime(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function Message({ message, isOwnMessage }: MessageProps) {
  return (
    <div className={`message ${isOwnMessage ? "own" : "other"}`}>
      <span className="message-sender">{message.senderName}</span>
      <p>{message.text}</p>
      <time className="message-time" dateTime={message.createdAt}>
        {formatTime(message.createdAt)}
      </time>
    </div>
  );
}

export default Message;
