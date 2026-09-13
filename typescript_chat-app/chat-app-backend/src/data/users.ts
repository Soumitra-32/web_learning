import type { User } from "../types/auth";

export const users: User[] = [];

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function findUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}

export function addUser(user: User): void {
  users.push(user);
}