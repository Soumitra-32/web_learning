import { useState } from "react";
import type { KeyboardEvent } from "react";

const MAX_MESSAGE_LENGTH = 2000;

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [text, setText] = useState<string>("");

  const handleSend = () => {
    if (disabled) return;

    const trimmed = text.trim();
    if (trimmed === "") return;

    onSend(trimmed.slice(0, MAX_MESSAGE_LENGTH));
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input">
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Reconnecting…" : "Type a message..."}
        disabled={disabled}
        maxLength={MAX_MESSAGE_LENGTH}
      />
      <button type="button" onClick={handleSend} disabled={disabled || text.trim() === ""}>
        Send
      </button>
    </div>
  );
}

export default MessageInput;
