import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AuthUser, ServerMessage, User, UserStatusUpdate } from "./types/chat";
import { api, ApiError } from "./api";
import { createSocket } from "./socket";
import type { ChatSocket } from "./socket";
import AuthPage from "./components/AuthPage";
import UserList from "./components/UserList";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

const TOKEN_STORAGE_KEY = "chat-app.token";
const USER_STORAGE_KEY = "chat-app.user";

interface Session {
  token: string;
  user: AuthUser;
}

function readStoredSession(): Session | null {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!token || !rawUser) return null;

    const user = JSON.parse(rawUser) as AuthUser;
    if (typeof user.id !== "number" || typeof user.name !== "string") return null;

    return { token, user };
  } catch {
    // Malformed value in localStorage: start logged out.
    return null;
  }
}

function writeStoredSession(session: Session | null): void {
  if (!session) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
}

function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403);
}

function App() {
  const [session, setSession] = useState<Session | null>(readStoredSession);
  // null means "not fetched yet", which is what drives the loading screen.
  const [users, setUsers] = useState<User[] | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Record<number, ServerMessage[]>>({});
  const [unread, setUnread] = useState<Record<number, number>>({});
  const [usersError, setUsersError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const socketRef = useRef<ChatSocket | null>(null);
  const selectedUserIdRef = useRef<number | null>(null);
  const token = session?.token ?? null;
  const currentUserId = session?.user.id ?? null;
  const contacts = useMemo(() => users ?? [], [users]);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const handleAuthenticated = useCallback((newToken: string, user: AuthUser) => {
    writeStoredSession({ token: newToken, user });
    setSession({ token: newToken, user });
  }, []);

  const handleLogout = useCallback(() => {
    writeStoredSession(null);
    setSession(null);
    setUsers(null);
    setSelectedUserId(null);
    setConversations({});
    setUnread({});
    setUsersError(null);
    setConnected(false);
  }, []);

  // Confirm the stored token is still valid, and refresh the profile.
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    api
      .me(token)
      .then((user) => {
        if (cancelled) return;
        writeStoredSession({ token, user });
        setSession((prev) => (prev && prev.token === token ? { ...prev, user } : prev));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) handleLogout();
      });

    return () => {
      cancelled = true;
    };
  }, [token, handleLogout]);

  // Contacts (the server already excludes the caller).
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    api
      .getUsers(token)
      .then((data) => {
        if (cancelled) return;
        setUsers(data);
        setSelectedUserId((prev) =>
          prev !== null && data.some((user) => user.id === prev)
            ? prev
            : data[0]?.id ?? null
        );
        setUsersError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) {
          handleLogout();
          return;
        }
        setUsers([]);
        setUsersError(err instanceof ApiError ? err.message : "Failed to load users.");
      });

    return () => {
      cancelled = true;
    };
  }, [token, handleLogout]);

  // One authenticated socket per session.
  useEffect(() => {
    if (!token || currentUserId === null) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    const handleConnectError = (err: Error) => {
      console.error("Socket connection error:", err.message);
    };

    const handleNewMessage = (message: ServerMessage) => {
      const otherUserId =
        message.senderId === currentUserId ? message.receiverId : message.senderId;

      setConversations((prev) => {
        const existing = prev[otherUserId] ?? [];
        if (existing.some((stored) => stored.id === message.id)) return prev;
        return { ...prev, [otherUserId]: [...existing, message] };
      });

      // Only count as unread when that conversation is not the open one.
      if (selectedUserIdRef.current !== otherUserId) {
        setUnread((prev) => ({ ...prev, [otherUserId]: (prev[otherUserId] ?? 0) + 1 }));
      }
    };

    const handleStatusChange = (update: UserStatusUpdate) => {
      setUsers((prev) =>
        prev === null
          ? prev
          : prev.map((user) =>
              user.id === update.userId ? { ...user, isOnline: update.isOnline } : user
            )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("newMessage", handleNewMessage);
    socket.on("userStatusChanged", handleStatusChange);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("newMessage", handleNewMessage);
      socket.off("userStatusChanged", handleStatusChange);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token, currentUserId]);

  // History for the open conversation.
  useEffect(() => {
    if (!token || selectedUserId === null) return;

    const conversationWith = selectedUserId;
    let cancelled = false;

    api
      .getConversation(token, conversationWith)
      .then((history) => {
        if (cancelled) return;
        setConversations((prev) => {
          // Merge so messages that arrived over the socket while this request
          // was in flight are never dropped.
          const merged = new Map<number, ServerMessage>();
          for (const message of history) merged.set(message.id, message);
          for (const message of prev[conversationWith] ?? []) {
            merged.set(message.id, message);
          }
          return {
            ...prev,
            [conversationWith]: [...merged.values()].sort((a, b) => a.id - b.id),
          };
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (isUnauthorized(err)) {
          handleLogout();
          return;
        }
        console.error("Failed to load conversation:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedUserId, handleLogout]);

  const handleSelectUser = useCallback((user: User) => {
    setSelectedUserId(user.id);
    setUnread((prev) => (prev[user.id] ? { ...prev, [user.id]: 0 } : prev));
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    const socket = socketRef.current;
    const receiverId = selectedUserIdRef.current;
    if (!socket || receiverId === null) return;

    socket.emit("sendMessage", { text, receiverId });
  }, []);

  const selectedUser = useMemo(
    () => contacts.find((user) => user.id === selectedUserId) ?? null,
    [contacts, selectedUserId]
  );

  if (!session) {
    return (
      <div className="auth-page">
        <AuthPage onAuthenticated={handleAuthenticated} />
      </div>
    );
  }

  if (usersError) {
    return <div className="app-status">{usersError}</div>;
  }

  if (users === null) {
    return <div className="app-status">Loading chats…</div>;
  }

  const activeMessages =
    selectedUserId === null ? [] : conversations[selectedUserId] ?? [];

  return (
    <div className="app">
      <UserList
        users={contacts}
        selectedUserId={selectedUserId}
        unread={unread}
        conversations={conversations}
        currentUser={session.user}
        onSelectUser={handleSelectUser}
        onLogout={handleLogout}
      />

      {selectedUser ? (
        <ChatWindow
          user={selectedUser}
          messages={activeMessages}
          currentUserId={session.user.id}
          onSendMessage={handleSendMessage}
          disabled={!connected}
        />
      ) : (
        <div className="chat-window chat-window-empty">
          <p>
            No other users yet. Register a second account in another browser window to
            start chatting.
          </p>
        </div>
      )}

      {!connected && <div className="connection-banner">Reconnecting…</div>}
    </div>
  );
}

export default App;
