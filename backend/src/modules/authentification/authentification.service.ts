/**
 * Service d'authentification
 * 
 * Gère la logique métier pour l'inscription, la connexion et la récupération
 * des informations utilisateur. Utilise bcrypt pour le hachage des mots de passe
 * et JWT pour la génération des tokens d'authentification.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../../config/db";
import { env } from "../../config/env";
import { User } from "../../types/models";

/**
 * Interface représentant une paire de tokens JWT
 */
interface AuthTokens {
  accessToken: string;  // Token d'accès (courte durée - 15 min)
  refreshToken: string; // Token de rafraîchissement (longue durée - 7 jours)
}

/**
 * Génère une paire de tokens JWT pour un utilisateur
 * 
 * Le système à deux tokens permet :
 * - accessToken : utilisé pour les requêtes API (expiration courte pour sécurité)
 * - refreshToken : utilisé pour obtenir un nouveau accessToken sans re-connexion
 * 
 * @param userId - Identifiant unique de l'utilisateur
 * @param email - Email de l'utilisateur
 * @returns Objet contenant les deux tokens
 */
function signTokens(userId: string, email: string): AuthTokens {
  // Token d'accès avec expiration courte (15 minutes)
  const accessToken = jwt.sign({ id: userId, email }, env.accessTokenSecret, {
    expiresIn: "15m",
  });
  
  // Token de rafraîchissement avec expiration longue (7 jours)
  const refreshToken = jwt.sign({ id: userId, email }, env.refreshTokenSecret, {
    expiresIn: "7d",
  });
  
  return { accessToken, refreshToken };
}

/**
 * Inscrit un nouvel utilisateur dans le système
 * 
 * Processus :
 * 1. Vérifie que l'email n'est pas déjà utilisé
 * 2. Hache le mot de passe avec bcrypt (12 rounds de salage)
 * 3. Insère l'utilisateur en base de données
 * 4. Génère les tokens JWT
 * 
 * Note de sécurité : Le mot de passe n'est jamais stocké en clair,
 * uniquement son hash bcrypt avec sel aléatoire.
 * 
 * @param email - Email de l'utilisateur (identifiant unique)
 * @param password - Mot de passe en clair (sera haché)
 * @returns Promise avec les données utilisateur et les tokens
 * @throws Error 409 si l'email est déjà utilisé
 */
export async function register(
  email: string,
  password: string,
): Promise<{ user: Omit<User, "createdAt">; tokens: AuthTokens }> {
  // Vérifie si l'email existe déjà
  const existing = await db.query("SELECT id FROM users WHERE email = $1", [
    email,
  ]);
  
  if (existing.rows.length > 0) {
    // Lance une erreur 409 Conflict si l'email est déjà pris
    const err = new Error("Email already in use") as Error & { status: number };
    err.status = 409;
    throw err;
  }

  // Hache le mot de passe avec bcrypt (12 rounds = bon compromis sécurité/performance)
  // Chaque hash inclut un sel aléatoire automatiquement généré
  const hash = await bcrypt.hash(password, 12);
  
  // Insère le nouvel utilisateur dans la base de données
  const result = await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, hash],
  );

  const user = result.rows[0] as { id: string; email: string };
  
  // Génère les tokens JWT pour connexion automatique après inscription
  const tokens = signTokens(user.id, user.email);
  
  return { user, tokens };
}

/**
 * Connecte un utilisateur existant
 * 
 * Processus :
 * 1. Recherche l'utilisateur par email
 * 2. Vérifie le mot de passe avec bcrypt.compare (comparaison sécurisée)
 * 3. Génère de nouveaux tokens JWT
 * 
 * Note de sécurité : bcrypt.compare() utilise un algorithme à temps constant
 * pour éviter les attaques par timing.
 * 
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe en clair
 * @returns Promise avec les données utilisateur et les nouveaux tokens
 * @throws Error 401 si l'email ou le mot de passe est invalide
 */
export async function login(
  email: string,
  password: string,
): Promise<{ user: Omit<User, "createdAt">; tokens: AuthTokens }> {
  // Récupère l'utilisateur avec son hash de mot de passe
  const result = await db.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email],
  );

  const row = result.rows[0] as
    | { id: string; email: string; password: string }
    | undefined;
    
  // Si l'utilisateur n'existe pas, retourne une erreur générique
  if (!row) {
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // Compare le mot de passe fourni avec le hash stocké
  // bcrypt extrait automatiquement le sel du hash pour la comparaison
  const valid = await bcrypt.compare(password, row.password);
  
  if (!valid) {
    // Même message d'erreur que si l'utilisateur n'existe pas (sécurité)
    // Cela évite de révéler quels emails sont enregistrés
    const err = new Error("Invalid credentials") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  // Génère de nouveaux tokens pour cette session
  const tokens = signTokens(row.id, row.email);
  
  return { user: { id: row.id, email: row.email }, tokens };
}

/**
 * Récupère les informations du profil de l'utilisateur connecté
 * 
 * Utilisé pour obtenir les données complètes de l'utilisateur à partir
 * de son ID (extrait du token JWT par le middleware authenticate).
 * 
 * @param userId - Identifiant de l'utilisateur
 * @returns Promise avec les données utilisateur complètes
 * @throws Error 404 si l'utilisateur n'existe pas (cas rare : utilisateur supprimé)
 */
export async function getMe(userId: string): Promise<User> {
  const result = await db.query(
    "SELECT id, email, created_at FROM users WHERE id = $1",
    [userId],
  );
  
  const row = result.rows[0] as
    | { id: string; email: string; created_at: string }
    | undefined;
    
  if (!row) {
    // L'utilisateur n'existe pas (ne devrait pas arriver si le token est valide)
    const err = new Error("User not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  
  // Retourne l'objet User avec la casse appropriée (createdAt au lieu de created_at)
  return { id: row.id, email: row.email, createdAt: row.created_at };
}
