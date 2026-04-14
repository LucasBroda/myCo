import { NextFunction, Request, Response } from "express";

// Interface permettant d'ajouter le status d'une erreur afin de voir si l'appli est en échec ou non
interface AppError extends Error {
  status?: number;
}

// Méthode permettant de renvoyer un message dans la console si l'appli plante pour une raison x
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? 500; // Assigne la valeur 500 si l'erreur n'a pas de status de base
  const message = status === 500 ? "Internal server error" : err.message; // Change le contenu du message en fonction de si err.message en possède un ou non, dans le cas contraire on lui assigne le message 

  if (status === 500) {
    console.error("[Error]", err);
  }

  res.status(status).json({ error: message }); // Renvoie la réponse HTTP lorsqu'il y a une erreur, status + message
}
