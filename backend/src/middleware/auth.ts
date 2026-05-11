/**
 * Middleware d'authentification JWT (JSON Web Token)
 * 
 * Ce middleware protège les routes en vérifiant qu'un token JWT valide est fourni
 * dans l'en-tête Authorization. Il décode le token et attache les informations
 * utilisateur à l'objet Request pour utilisation dans les contrôleurs.
 */

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Interface définissant la structure du payload JWT
 * 
 * Le payload contient les données utilisateur encodées dans le token.
 * Ces données sont non-sensibles car le token est lisible par tous
 * (seule la signature garantit l'authenticité).
 */
interface JwtPayload {
  id: string;    // Identifiant unique de l'utilisateur
  email: string; // Email de l'utilisateur
}

/**
 * Middleware d'authentification
 * 
 * Vérifie la présence et la validité du token JWT dans l'en-tête Authorization.
 * Si le token est valide, décode les informations utilisateur et les attache à req.user.
 * 
 * Format attendu de l'en-tête : "Bearer <token>"
 * 
 * @param req - Objet Request Express
 * @param res - Objet Response Express
 * @param next - Fonction pour passer au middleware suivant
 * @returns void (mais envoie une réponse HTTP en cas d'erreur)
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Récupère l'en-tête Authorization
  const header = req.headers.authorization;
  
  // Vérifie que l'en-tête existe et commence par "Bearer "
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  // Extrait le token (en supprimant "Bearer " du début)
  const token = header.slice(7);
  
  try {
    // Vérifie et décode le token JWT avec le secret
    const payload = jwt.verify(token, env.accessTokenSecret) as JwtPayload;
    
    // Attache les informations utilisateur à la requête
    // Cela permet aux contrôleurs d'accéder à req.user
    req.user = { id: payload.id, email: payload.email };
    
    // Passe au middleware/contrôleur suivant
    next();
  } catch {
    // Le token est invalide, expiré, ou mal signé
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
