import { Request, Response } from "express";
import { env } from "../../config/env";
import { getMe, login, register } from "./auth.service";

// Cookie stocké dans le navigateur contenant le token du user
const REFRESH_COOKIE = "refreshToken";
// Options du cookie
const COOKIE_OPTIONS = {
  httpOnly: true, // -> Cookie uniquement lu par le serveur HTTP (protection contre les attaques XSS)
  secure: env.nodeEnv === "production", // Accepte l'envoie via HTTP ou HTTPS
  sameSite: "lax" as const, // Permet de contrôler l'envoie du cookie, lax permet d'envoyer le cookie lors de la navigation, c'est à dire lors d'un clic sur un lien
  maxAge: 7 * 24 * 60 * 60 * 1000, // Permet de définir la durée de vie d'un cookie
};

// Permet de contrôler l'enregistrement d'un nouveau user
export async function registerHandler(
  req: Request,
  res: Response,
): Promise<void> {
  // Récupère l'email et le mdp de la requête
  const { email, password } = req.body as { email?: string; password?: string };
  // Contrôle de saisie des deux éléments
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  // Permet de rendre la saisie d'un mdp à plus de 8 caractères obligatoire
  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  // Stocke et renvoie le token créé pour le nouveau user après avoir saisie son email et son mdp en appellant le service auth.service
  const { user, tokens } = await register(email, password);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.status(201).json({ accessToken: tokens.accessToken, user });
}

// Permet de gérer le login à l'application 
export async function loginHandler(req: Request, res: Response): Promise<void> {
  // Récupère l'email et le mdp de la requête
  const { email, password } = req.body as { email?: string; password?: string };
  // Contrôle de saisie
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // Appelle la méthode login du service pour vérifier que les données correspondent à un compte existant
  const { user, tokens } = await login(email, password);
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken: tokens.accessToken, user });
}

// Permet de récupérer le profil de l'utilisateur connecté
export async function getMeHandler(req: Request, res: Response): Promise<void> {
  const user = await getMe(req.user!.id);
  res.json({ user });
}

// Permet de gérer la déconnexion
export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie(REFRESH_COOKIE); // Supprime le cookie contenant le token
  res.json({ message: "Logged out" }); // Message de deconnexion
}
