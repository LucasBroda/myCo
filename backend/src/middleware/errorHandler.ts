/**
 * Middleware de gestion centralisée des erreurs
 * 
 * Ce middleware capture toutes les erreurs non gérées dans l'application Express
 * et les transforme en réponses HTTP appropriées. Il doit être enregistré en dernier
 * dans la chaîne de middleware Express.
 */

import { NextFunction, Request, Response } from "express";

/**
 * Interface étendant Error pour inclure un code de statut HTTP
 * 
 * Permet aux erreurs métier de spécifier leur propre code HTTP
 * (ex: 404 pour "non trouvé", 400 pour "requête invalide").
 */
interface AppError extends Error {
  status?: number; // Code de statut HTTP optionnel
}

/**
 * Middleware de gestion des erreurs Express
 * 
 * Transform les erreurs en réponses JSON standardisées.
 * Les erreurs 500 (erreurs serveur) sont loguées complètement,
 * tandis que les autres erreurs (erreurs client) ne loguent que le message.
 * 
 * @param err - L'erreur capturée
 * @param _req - Objet Request (préfixé _ car non utilisé)
 * @param res - Objet Response pour envoyer la réponse
 * @param _next - NextFunction (préfixé _ car non utilisé)
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Utilise le statut de l'erreur ou 500 par défaut (erreur serveur interne)
  const status = err.status ?? 500;
  
  // Pour les erreurs 500, cache le message détaillé au client (sécurité)
  const message = status === 500 ? "Internal server error" : err.message;

  // Logue les erreurs serveur pour le débogage
  if (status === 500) {
    console.error("[Error]", err);
  }

  // Envoie la réponse JSON au client
  res.status(status).json({ error: message });
}
