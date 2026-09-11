import { useState, useEffect } from "react";
import type { User, ChatMessage } from "./types/chat";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

const fakeMessages: ChatMessage[] = [
  { id: 1, text: "Hello!", senderId: 1, createdAt: "10:00" },
  { id: 2, text: "Hi!", senderId: 0, createdAt: "10:01" },
  { id: 3, text: "How are you?", senderId: 1, createdAt: "10:02" },
];

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(fakeMessages);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/users")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        setSelectedUser(data[0]);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="app">Loading users...</div>;
  }

  if (!selectedUser) {
    return <div className="app">No users found.</div>;
  }

  return (
    <div className="app">
      <UserList
        users={users}
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