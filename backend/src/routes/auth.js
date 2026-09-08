import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

const router = Router();

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "name, email and password are required" });
  }

  const exists = db
    .prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)")
    .get(email);

  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const id = uuidv4();
  const createdAt = new Date().toISOString();
  const userRole = role === "artist" ? "artist" : "client";

  // Demo only — do not store plain passwords in production
  db.prepare(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, name, email.toLowerCase(), password, userRole, createdAt);

  const user = mapUser(
    db.prepare("SELECT * FROM users WHERE id = ?").get(id)
  );

  res.status(201).json({
    user,
    token: `demo-token-${user.id}`,
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "email and password are required" });
  }

  const row = db
    .prepare(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?"
    )
    .get(email, password);

  if (!row) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    user: mapUser(row),
    token: `demo-token-${row.id}`,
  });
});

export default router;
