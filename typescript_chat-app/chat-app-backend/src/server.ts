import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import { authenticateToken } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";
import { findUserById, getAllUsers } from "./data/users";
import { addMessage, getAllMessages } from "./data/messages";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "./types/socket";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/users", async (req: Request, res: Response) => {
  const users = await getAllUsers();
  const publicUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    isOnline: u.isOnline,
  }));
  res.json(publicUsers);
});

app.get("/api/users/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = await findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.get("/api/messages", async (req: Request, res: Response) => {
  const messages = await getAllMessages();
  res.json(messages);
});

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    const savedMessage = await addMessage(data.senderId, data.text);

    io.emit("newMessage", {
      id: savedMessage.id,
      text: savedMessage.text,
      senderId: savedMessage.senderId,
      senderName: data.senderName,
      createdAt: savedMessage.createdAt,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});