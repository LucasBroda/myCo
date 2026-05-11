/**
 * Contrôleur d'authentification
 * 
 * Gère les endpoints HTTP pour l'authentification des utilisateurs :
 * - Inscription (POST /api/authentification/inscription)
 * - Connexion (POST /api/authentification/connexion)
 * - Récupération du profil (GET /api/authentification/moi)
 * - Déconnexion (POST /api/authentification/deconnexion)
 * 
 * Le refresh token est stocké dans un cookie HttpOnly sécurisé.
 * L'access token est retourné dans le corps de la réponse JSON.
 */

import { Request, Response } from "express";
import { env } from "../../config/env";
import { obtenirUtilisateur, connecter, inscrire } from "./authentification.service";

/**
 * Nom du cookie contenant le refresh token
 */
const REFRESH_COOKIE = "refreshToken";

/**
 * Options du cookie refresh token
 * 
 * - httpOnly: true - Inaccessible depuis JavaScript côté client (protection XSS)
 * - secure: true en production - Envoyé uniquement via HTTPS
 * - sameSite: 'lax' - Protection CSRF modérée (permet GET cross-origin)
 * - maxAge: 7 jours - Durée de vie du cookie
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
};

/**
 * Handler d'inscription
 * 
 * Crée un nouveau compte utilisateur avec email et mot de passe.
 * 
 * @param req - Requête Express avec body { email, password }
 * @param res - Réponse Express
 * @returns 201 avec { accessToken, user } ou 400 en cas d'erreur validation
 * @throws 409 si l'email existe déjà (géré par le service)
 */
export async function inscrireGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  
  // Validation des champs requis
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  
  // Validation longueur minimale du mot de passe
  if (password.length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }

  // Création du compte
  const { user, tokens } = await inscrire(email, password);
  
  // Stocke le refresh token dans un cookie sécurisé
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  
  // Retourne l'access token et les infos utilisateur
  res.status(201).json({ accessToken: tokens.accessToken, user });
}

/**
 * Handler de connexion
 * 
 * Authentifie un utilisateur avec email et mot de passe.
 * 
 * @param req - Requête Express avec body { email, password }
 * @param res - Réponse Express
 * @returns 200 avec { accessToken, user } ou 400/401 en cas d'erreur
 * @throws 401 si les identifiants sont incorrects (géré par le service)
 */
export async function connecterGestionnaire(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };
  
  // Validation des champs requis
  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  // Vérification des identifiants
  const { user, tokens } = await connecter(email, password);
  
  // Stocke le refresh token dans un cookie sécurisé
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
  
  // Retourne l'access token et les infos utilisateur
  res.json({ accessToken: tokens.accessToken, user });
}

/**
 * Handler de récupération du profil
 * 
 * Retourne les informations de l'utilisateur actuellement authentifié.
 * Nécessite le middleware authenticate() qui injecte req.user.
 * 
 * @param req - Requête Express (req.user défini par le middleware)
 * @param res - Réponse Express
 * @returns 200 avec { user }
 */
export async function obtenirUtilisateurGestionnaire(req: Request, res: Response): Promise<void> {
  // req.user! est garanti d'être défini par le middleware authenticate
  const user = await obtenirUtilisateur(req.user!.id);
  res.json({ user });
}

/**
 * Handler de déconnexion
 * 
 * Supprime le cookie refresh token pour invalider la session.
 * 
 * @param _req - Requête Express (non utilisée, d'où le préfixe _)
 * @param res - Réponse Express
 * @returns 200 avec message de confirmation
 */
export function deconnecterGestionnaire(_req: Request, res: Response): void {
  // Supprime le cookie refresh token
  res.clearCookie(REFRESH_COOKIE);
  res.json({ message: "Logged out" });
}
