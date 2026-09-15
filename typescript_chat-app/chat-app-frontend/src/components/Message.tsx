import type { ServerMessage } from "../socket";

interface MessageProps {
  message: ServerMessage;
  isOwnMessage: boolean;
}

function Message({ message, isOwnMessage }: MessageProps) {
  return (
    <div className={`message ${isOwnMessage ? "own" : "other"}`}>
      <span className="message-sender">{message.senderName}</span>
      <p>{message.text}</p>
    </div>
  );
}

export default Message;