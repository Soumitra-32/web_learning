import { useState } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
}

function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState<string>("");

  const handleSend = () => {
    if (text.trim() === "") return;
    onSend(text);
    setText("");
  };

  return (
    <div className="message-input">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default MessageInput;