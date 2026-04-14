import { Request, Response } from "express";
import { env } from "../../config/env";
import { getMe, login, register } from "./auth.service";

const REFRESH_COOKIE = "refreshToken";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  const { user, tokens } = await register(email, password);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ accessToken: tokens.accessToken, user });
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const { user, tokens } = await login(email, password);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken: tokens.accessToken, user });
}

export async function getMeHandler(req: Request, res: Response): Promise<void> {
  const user = await getMe(req.user!.id);
  res.json({ user });
}

export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: "Logged out" });
}
