import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import type { User } from "./types/chat";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const fakeUsers: User[] = [
  { id: 1, name: "Rahim", isOnline: true },
  { id: 2, name: "Karim", isOnline: false },
  { id: 3, name: "Hasan", isOnline: false },
];

app.get("/api/users", (req: Request, res: Response) => {
  res.json(fakeUsers);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});