import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import { authenticateToken } from "./middleware/auth";
import type { AuthRequest } from "./middleware/auth";
import { findUserById } from "./data/users";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/users/me", authenticateToken, (req: AuthRequest, res: Response) => {
  const user = findUserById(req.user!.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});