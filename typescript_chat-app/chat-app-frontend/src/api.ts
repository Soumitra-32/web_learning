import type {
  AuthResponse,
  AuthUser,
  RegisterResponse,
  ServerMessage,
  User,
} from "./types/chat";

export const API_URL = "http://localhost:3001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  token?: string;
  body?: Record<string, string>;
}

function parseJson(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "error" in data) {
    const value = (data as { error?: unknown }).error;
    if (typeof value === "string") return value;
  }
  return `Request failed (${status})`;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;
  const headers: Record<string, string> = {};

  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  const data = parseJson(await response.text());

  if (!response.ok) {
    throw new ApiError(errorMessage(data, response.status), response.status);
  }

  return data as T;
}

export const api = {
  register(name: string, email: string, password: string) {
    return request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
  },

  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
  },

  me(token: string) {
    return request<AuthUser>("/api/users/me", { token });
  },

  getUsers(token: string) {
    return request<User[]>("/api/users", { token });
  },

  getConversation(token: string, userId: number) {
    return request<ServerMessage[]>(`/api/messages/${userId}`, { token });
  },
};
