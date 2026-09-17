import { useState, useEffect } from "react";
import type { User } from "./types/chat";
import { socket } from "./socket";
import type { ServerMessage } from "./socket";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

const CURRENT_USER_ID = 0;
const CURRENT_USER_NAME = "You";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ServerMessage[]>([]);
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

  useEffect(() => {
    fetch("http://localhost:3001/api/messages")
      .then((res) => res.json())
      .then((data: ServerMessage[]) => {
        setMessages(data);
      })
      .catch((err) => console.error("Failed to fetch messages:", err));
  }, []);

  useEffect(() => {
    function handleNewMessage(message: ServerMessage) {
      setMessages((prev) => [...prev, message]);
    }

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
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
        currentUserId={CURRENT_USER_ID}
        onSendMessage={(text: string) => {
          socket.emit("sendMessage", {
            text,
            senderId: CURRENT_USER_ID,
            senderName: CURRENT_USER_NAME,
          });
        }}
      />
    </div>
  );
}

export default App;