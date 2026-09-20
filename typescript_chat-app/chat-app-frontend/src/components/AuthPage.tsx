import { useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api";
import type { AuthUser } from "../types/chat";

interface AuthPageProps {
  onAuthenticated: (token: string, user: AuthUser) => void;
}

type Mode = "login" | "register";

function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";

  const handleModeChange = (nextMode: Mode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (isRegister && trimmedName.length === 0) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedEmail.length === 0 || password.length === 0) {
      setError("Email and password are required.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Registering does not return a token, so log in right after.
      if (isRegister) {
        await api.register(trimmedName, trimmedEmail, password);
      }

      const session = await api.login(trimmedEmail, password);
      onAuthenticated(session.token, session.user);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h1>Chat app</h1>
      <p className="auth-subtitle">
        {isRegister
          ? "Create an account to start chatting."
          : "Log in to continue your conversations."}
      </p>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${isRegister ? "" : "active"}`}
          onClick={() => handleModeChange("login")}
        >
          Log in
        </button>
        <button
          type="button"
          className={`auth-tab ${isRegister ? "active" : ""}`}
          onClick={() => handleModeChange("register")}
        >
          Register
        </button>
      </div>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {isRegister && (
          <div className="auth-field">
            <label htmlFor="auth-name">Name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="Your name"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            autoComplete="email"
            placeholder="you@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            autoComplete={isRegister ? "new-password" : "current-password"}
            placeholder="••••••••"
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Please wait…" : isRegister ? "Create account" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default AuthPage;
