/**
 * Contrôleur de gestion de collection
 * 
 * Gère les endpoints HTTP pour la collection de cartes de l'utilisateur :
 * - GET /api/collection - Liste légère de la collection
 * - GET /api/collection/avec-details - Collection enrichie avec noms
 * - POST /api/collection - Ajouter une carte
 * - DELETE /api/collection/:id - Retirer une carte
 * - GET /api/collection/statistiques - Statistiques de collection
 * - GET /api/collection/collections-suivies - Éditions suivies
 * - POST /api/collection/collections-suivies - Suivre une édition
 * - DELETE /api/collection/collections-suivies/:setId - Ne plus suivre une édition
 * 
 * Tous les endpoints nécessitent une authentification (middleware authenticate).
 */

import { Request, Response } from "express";
import { CardCondition } from "../../types/models";
import {
  ajouterCarte,
  suivreEdition,
  obtenirCollection,
  obtenirCollectionAvecDetails,
  obtenirEditionsSuivies,
  obtenirStatistiques,
  supprimerCarte,
  nePlusSuivreEdition,
} from "./collection.service";

/**
 * Liste des conditions valides pour une carte
 * Utilisé pour la validation des requêtes
 */
const VALID_CONDITIONS: CardCondition[] = [
  "Mint",
  "NM",
  "LP",
  "MP",
  "HP",
  "Damaged",
];

/**
 * Handler pour récupérer la collection (version légère)
 * 
 * Retourne uniquement les IDs des cartes, sans enrichissement.
 * Plus rapide mais moins d'informations.
 * 
 * @param req - Requête Express (req.user défini par authenticate)
 * @param res - Réponse Express
 * @returns 200 avec { data: AcquiredCard[] }
 */
export async function obtenirCollectionGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const cards = await obtenirCollection(req.user!.id);
  res.json({ data: cards });
}

/**
 * Handler pour récupérer la collection avec détails
 * 
 * Enrichit chaque carte avec son nom et le nom de l'édition via l'API Pokémon TCG.
 * Nettoie également les achats planifiés expirés.
 * Plus lent mais contient toutes les informations nécessaires à l'affichage.
 * 
 * @param req - Requête Express
 * @param res - Réponse Express
 * @returns 200 avec { data: AcquiredCard[] } enrichies
 */
export async function obtenirCollectionAvecDetailsGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const cards = await obtenirCollectionAvecDetails(req.user!.id);
  res.json({ data: cards });
}

/**
 * Handler pour ajouter une carte à la collection
 * 
 * Valide les champs requis et la condition.
 * Récupère automatiquement les noms de carte et d'édition pour les stocker.
 * 
 * @param req - Requête Express avec body { cardId, setId, acquiredDate, pricePaid?, condition }
 * @param res - Réponse Express
 * @returns 201 avec { data: AcquiredCard } ou 400 en cas d'erreur validation
 */
export async function ajouterCarteGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const { cardId, setId, acquiredDate, pricePaid, condition } = req.body as {
    cardId?: string;
    setId?: string;
    acquiredDate?: string;
    pricePaid?: number | null;
    condition?: CardCondition;
  };

  // Validation des champs requis
  if (!cardId || !setId || !acquiredDate || !condition) {
    res
      .status(400)
      .json({
        error: "cardId, setId, acquiredDate and condition are required",
      });
    return;
  }
  
  // Validation de la condition
  if (!VALID_CONDITIONS.includes(condition)) {
    res
      .status(400)
      .json({
        error: `condition must be one of: ${VALID_CONDITIONS.join(", ")}`,
      });
    return;
  }

  // Ajout de la carte (enrichissement automatique avec noms)
  const card = await ajouterCarte(
    req.user!.id,
    cardId,
    setId,
    acquiredDate,
    pricePaid ?? null,
    condition,
  );
  res.status(201).json({ data: card });
}

/**
 * Handler pour retirer une carte de la collection
 * 
 * Vérifie que la carte appartient bien à l'utilisateur (sécurité).
 * 
 * @param req - Requête Express avec params.id
 * @param res - Réponse Express
 * @returns 200 avec message de confirmation ou 404 si carte non trouvée
 */
export async function supprimerCarteGestionnaire(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await supprimerCarte(req.user!.id, req.params.id);
  res.json({ message: "Card removed from collection" });
}

/**
 * Handler pour récupérer les statistiques de collection
 * 
 * Calcule des métriques agrégées (nombre total, valeur, etc.).
 * 
 * @param req - Requête Express
 * @param res - Réponse Express
 * @returns 200 avec { data: CollectionStats }
 */
export async function obtenirStatistiquesGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const stats = await obtenirStatistiques(req.user!.id);
  res.json({ data: stats });
}

/**
 * Handler pour suivre une édition
 * 
 * Ajoute l'édition aux favoris de l'utilisateur.
 * Idempotent grâce à ON CONFLICT DO NOTHING côté service.
 * 
 * @param req - Requête Express avec body { setId }
 * @param res - Réponse Express
 * @returns 201 avec { data: { setId, followedAt } } ou 400 si setId manquant
 */
export async function suivreEditionGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const { setId } = req.body as { setId?: string };

  // Validation du champ requis
  if (!setId) {
    res.status(400).json({ error: "setId is required" });
    return;
  }

  const result = await suivreEdition(req.user!.id, setId);
  res.status(201).json({ data: result });
}

/**
 * Handler pour ne plus suivre une édition
 * 
 * Retire l'édition des favoris de l'utilisateur.
 * 
 * @param req - Requête Express avec params.setId
 * @param res - Réponse Express
 * @returns 200 avec message de confirmation ou 404 si non suivie
 */
export async function nePlusSuivreEditionGestionnaire(
  req: Request<{ setId: string }>,
  res: Response,
): Promise<void> {
  await nePlusSuivreEdition(req.user!.id, req.params.setId);
  res.json({ message: "Set unfollowed" });
}

/**
 * Handler pour récupérer les éditions suivies
 * 
 * Retourne la liste des IDs d'éditions suivies par l'utilisateur,
 * triés par date de suivi décroissante.
 * 
 * @param req - Requête Express
 * @param res - Réponse Express
 * @returns 200 avec { data: string[] }
 */
export async function obtenirEditionsSuiviesGestionnaire(
  req: Request,
  res: Response,
): Promise<void> {
  const setIds = await obtenirEditionsSuivies(req.user!.id);
  res.json({ data: setIds });
}
