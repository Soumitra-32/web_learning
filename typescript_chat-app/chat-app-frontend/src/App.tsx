import { useState } from "react";
import type { User, ChatMessage } from "./types/chat";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

const fakeUsers: User[] = [
  { id: 1, name: "Rahim", isOnline: true },
  { id: 2, name: "Karim", isOnline: false },
  { id: 3, name: "Hasan", isOnline: false },
];

const fakeMessages: ChatMessage[] = [
  { id: 1, text: "Hello!", senderId: 1, createdAt: "10:00" },
  { id: 2, text: "Hi!", senderId: 0, createdAt: "10:01" },
  { id: 3, text: "How are you?", senderId: 1, createdAt: "10:02" },
];

function App() {
  const [selectedUser, setSelectedUser] = useState<User>(fakeUsers[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(fakeMessages);

  return (
    <div className="app">
      <UserList
        users={fakeUsers}
        selectedUser={selectedUser}
        onSelectUser={setSelectedUser}
      />
      <ChatWindow
        user={selectedUser}
        messages={messages}
        onSendMessage={(text: string) => {
          const newMessage: ChatMessage = {
            id: messages.length + 1,
            text,
            senderId: 0,
            createdAt: new Date().toLocaleTimeString(),
          };
          setMessages([...messages, newMessage]);
        }}
      />
    </div>
  );
}

export default App;