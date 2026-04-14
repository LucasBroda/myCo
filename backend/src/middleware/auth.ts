import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// Interface définissant les propriétés nécessaires pour l'authentification
interface JwtPayload {
  id: string;
  email: string;
}

// Fonction permettant de check les valeurs des propriétés id et email afin de match avec le bon compte stocké en base
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // On récupère d'abord l'entête authorization du header de la requête HTTP
  const header = req.headers.authorization;

  // On check le format du header pour vérifier qu'il respecte le format Bearer
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }

  // Permet d'enlever "Bearer" du token
  const token = header.slice(7);

  // Vérifie si le user possède un token valide, si valide, donne accès à l'application, sinon renvoie un message d'erreur
  try {
    const payload = jwt.verify(token, env.accessTokenSecret) as JwtPayload;
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
