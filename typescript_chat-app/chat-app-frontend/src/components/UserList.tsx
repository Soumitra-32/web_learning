import type { User } from "../types/chat";

interface UserListProps {
  users: User[];
  selectedUser: User;
  onSelectUser: (user: User) => void;
}

function UserList({ users, selectedUser, onSelectUser }: UserListProps) {
  return (
    <div className="user-list">
      <h3>Users</h3>
      {users.map((user) => (
        <div
          key={user.id}
          className={`user-item ${user.id === selectedUser.id ? "active" : ""}`}
          onClick={() => onSelectUser(user)}
        >
          {user.isOnline ? "●" : "○"} {user.name}
        </div>
      ))}
    </div>
  );
}

export default UserList;