/**
 * Déclarations TypeScript pour étendre les types Express
 * 
 * Ce fichier de déclaration (declaration file) augmente les types de la bibliothèque
 * Express pour ajouter des propriétés personnalisées.
 * 
 * TypeScript utilise le "declaration merging" pour fusionner ces définitions avec
 * celles d'Express, permettant un typage fort sur nos extensions.
 */

import { Request } from "express";

/**
 * Extension du namespace global Express
 * 
 * Ajoute la propriété `user` à l'interface Request pour stocker les informations
 * de l'utilisateur authentifié (injectées par le middleware `authenticate`).
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * Informations de l'utilisateur authentifié
       * 
       * Propriété optionnelle car elle n'existe que sur les routes protégées
       * (après passage par le middleware authenticate).
       */
      user?: {
        /** ID de l'utilisateur (UUID) */
        id: string;
        /** Email de l'utilisateur */
        email: string;
      };
    }
  }
}

/**
 * Type helper pour les routes protégées
 * 
 * Garantit que `user` est toujours défini (non optionnel).
 * Utilisé dans les contrôleurs après le middleware authenticate.
 * 
 * @example
 * ```typescript
 * export async function protectedRoute(req: AuthenticatedRequest, res: Response) {
 *   // req.user est garanti d'être défini, pas besoin de vérification
 *   const userId = req.user.id
 * }
 * ```
 */
export type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
  };
};
