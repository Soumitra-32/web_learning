import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { RegisterRequestBody, LoginRequestBody, User } from "../types/auth";
import { findUserByEmail, addUser, users } from "../data/users";
import { JWT_SECRET } from "../middleware/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as RegisterRequestBody;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required" });
    return;
  }

  const existingUser = findUserByEmail(email);
  if (existingUser) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    isOnline: false,
  };

  addUser(newUser);

  res.status(201).json({
    message: "User registered successfully",
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginRequestBody;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = findUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({
    message: "Login successful",
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

export default router;