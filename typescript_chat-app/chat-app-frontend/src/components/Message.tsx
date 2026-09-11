import type { ChatMessage } from "../types/chat";

interface MessageProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

function Message({ message, isOwnMessage }: MessageProps) {
  return (
    <div className={`message ${isOwnMessage ? "own" : "other"}`}>
      <p>{message.text}</p>
    </div>
  );
}

export default Message;