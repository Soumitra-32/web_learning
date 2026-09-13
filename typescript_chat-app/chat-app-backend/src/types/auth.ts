export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  isOnline: boolean;
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