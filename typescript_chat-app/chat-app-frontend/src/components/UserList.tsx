import type { AuthUser, ServerMessage, User } from "../types/chat";

const PREVIEW_LENGTH = 34;

interface UserListProps {
  users: User[];
  selectedUserId: number | null;
  unread: Record<number, number>;
  conversations: Record<number, ServerMessage[]>;
  currentUser: AuthUser;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
}

function previewText(
  messages: ServerMessage[] | undefined,
  currentUserId: number
): string {
  const lastMessage = messages?.[messages.length - 1];
  if (!lastMessage) return "No messages yet";

  const text =
    lastMessage.text.length > PREVIEW_LENGTH
      ? `${lastMessage.text.slice(0, PREVIEW_LENGTH)}…`
      : lastMessage.text;

  return lastMessage.senderId === currentUserId ? `You: ${text}` : text;
}

function UserList({
  users,
  selectedUserId,
  unread,
  conversations,
  currentUser,
  onSelectUser,
  onLogout,
}: UserListProps) {
  return (
    <aside className="user-list">
      <div className="current-user">
        <div>
          <strong>{currentUser.name}</strong>
          <span className="current-user-email">{currentUser.email}</span>
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>
          Log out
        </button>
      </div>

      <h3>Chats</h3>

      {users.length === 0 ? (
        <p className="user-list-empty">
          No other users yet. Register another account to start a conversation.
        </p>
      ) : (
        users.map((user) => {
          const unreadCount = unread[user.id] ?? 0;

          return (
            <button
              key={user.id}
              type="button"
              className={`user-item ${user.id === selectedUserId ? "active" : ""}`}
              onClick={() => onSelectUser(user)}
            >
              <span className={`presence ${user.isOnline ? "online" : "offline"}`}>
                {user.isOnline ? "●" : "○"}
              </span>

              <span className="user-item-body">
                <span className="user-item-top">
                  <span className="user-item-name">{user.name}</span>
                  {unreadCount > 0 && (
                    <span className="unread-badge">{unreadCount}</span>
                  )}
                </span>
                <span className="user-item-preview">
                  {previewText(conversations[user.id], currentUser.id)}
                </span>
              </span>
            </button>
          );
        })
      )}
    </aside>
  );
}

export default UserList;
