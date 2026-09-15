import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth";
import { authenticateToken } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";
import { findUserById, users } from "./data/users";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  ServerMessage,
} from "./types/socket";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/users", (req: Request, res: Response) => {
  const publicUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    isOnline: u.isOnline,
  }));
  res.json(publicUsers);
});

app.get("/api/users/me", authenticateToken, (req: AuthRequest, res: Response) => {
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

let messageIdCounter = 1;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", (data) => {
    const message: ServerMessage = {
      id: messageIdCounter++,
      text: data.text,
      senderId: data.senderId,
      senderName: data.senderName,
      createdAt: new Date().toLocaleTimeString(),
    };

    io.emit("newMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});