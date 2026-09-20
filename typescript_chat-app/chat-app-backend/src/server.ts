import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import type { DefaultEventsMap } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { authenticateToken, verifyToken } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";
import {
  findUserById,
  getAllUsers,
  resetOnlineStatus,
  setUserOnlineStatus,
} from "./data/users";
import { addMessage, getConversation } from "./data/messages";
import type { PublicUser } from "./types/chat";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types/socket";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MAX_MESSAGE_LENGTH = 2000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

// Everyone except the caller; passwords are never exposed.
app.get("/api/users", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await getAllUsers();
    const publicUsers: PublicUser[] = users
      .filter((user) => user.id !== req.user!.id)
      .map((user) => ({ id: user.id, name: user.name, isOnline: user.isOnline }));
    res.json(publicUsers);
  } catch (err) {
    console.error("Failed to load users:", err);
    res.status(500).json({ error: "Failed to load users" });
  }
});

app.get("/api/users/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (err) {
    console.error("Failed to load current user:", err);
    res.status(500).json({ error: "Failed to load current user" });
  }
});

// GET /api/messages/:userId -> the private conversation with that user.
app.get(
  "/api/messages/:userId",
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    const otherUserId = Number(req.params.userId);

    if (!Number.isInteger(otherUserId) || otherUserId <= 0) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    try {
      const messages = await getConversation(req.user!.id, otherUserId);
      res.json(messages);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      res.status(500).json({ error: "Failed to load conversation" });
    }
  }
);

const httpServer = createServer(app);

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  DefaultEventsMap,
  SocketData
>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const userRoom = (userId: number) => `user:${userId}`;

// No socket may connect without a valid JWT, and the userId it identifies as
// comes from the token instead of a trust-me "identify" event.
io.use((socket, next) => {
  const token: unknown = socket.handshake.auth?.token;

  if (typeof token !== "string" || token.length === 0) {
    next(new Error("Authentication required"));
    return;
  }

  try {
    socket.data.userId = verifyToken(token).id;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  socket.join(userRoom(userId));
  console.log(`User connected: ${userId} (socket ${socket.id})`);

  void setUserOnlineStatus(userId, true)
    .then(() => io.emit("userStatusChanged", { userId, isOnline: true }))
    .catch((err: unknown) => console.error("Failed to set online status:", err));

  socket.on("sendMessage", async (data) => {
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    const receiverId = Number(data?.receiverId);

    if (text.length === 0 || text.length > MAX_MESSAGE_LENGTH) return;
    if (!Number.isInteger(receiverId) || receiverId === userId) return;

    try {
      const receiver = await findUserById(receiverId);
      if (!receiver) return;

      // Only the sender and the receiver ever receive this message.
      const savedMessage = await addMessage(userId, receiverId, text);
      io.to(userRoom(userId))
        .to(userRoom(receiverId))
        .emit("newMessage", savedMessage);
    } catch (err) {
      console.error("Failed to save message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId} (socket ${socket.id})`);

    void io
      .in(userRoom(userId))
      .fetchSockets()
      .then(async (remainingSockets) => {
        // Stay online while the user still has another tab open.
        if (remainingSockets.length > 0) return;

        await setUserOnlineStatus(userId, false);
        io.emit("userStatusChanged", { userId, isOnline: false });
      })
      .catch((err: unknown) => console.error("Failed to set offline status:", err));
  });
});

// Clear stale "online" flags left behind by a crash or hard restart.
resetOnlineStatus().catch((err: unknown) =>
  console.error("Failed to reset online status:", err)
);

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
