import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { User } from "../../types/models";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function signTokens(userId: string, email: string): AuthTokens {
  const accessToken = jwt.sign({ id: userId, email }, env.accessTokenSecret, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId, email }, env.refreshTokenSecret, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export async function register(
  email: string,
  password: string,
): Promise<{ user: Omit<User, "createdAt">; tokens: AuthTokens }> {
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  if (existing.rows.length > 0) {
    const err = new Error("Email already in use") as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const hash = await bcrypt.hash(password, 12);
  const result = await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, hash],
  );

  const user = result.rows[0] as { id: string; email: string };
  const tokens = signTokens(user.id, user.email);
  return { user, tokens };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: Omit<User, "createdAt">; tokens: AuthTokens }> {
  const result = await db.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email],
  );

  const row = result.rows[0] as
    | { id: string; email: string; password: string }
    | undefined;
  if (!row) {
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, row.password);
  if (!valid) {
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const tokens = signTokens(row.id, row.email);
  return { user: { id: row.id, email: row.email }, tokens };
}

export async function getMe(userId: string): Promise<User> {
  const result = await db.query(
    "SELECT id, email, created_at FROM users WHERE id = $1",
    [userId],
  );
  const row = result.rows[0] as
    | { id: string; email: string; created_at: string }
    | undefined;
  if (!row) {
    const err = new Error("User not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  return { id: row.id, email: row.email, createdAt: row.created_at };
}
