export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  isOnline: boolean;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  is_online: boolean;
  created_at: Date;
}

export interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: number;
  email: string;
}