/**
 * Contrôleur du profil utilisateur
 * 
 * Gère les endpoints HTTP pour les achats planifiés :
 * - GET /api/profil/achats-planifies - Liste des achats planifiés
 * - POST /api/profil/achats-planifies - Ajouter un achat planifié
 * - DELETE /api/profil/achats-planifies/:id - Supprimer un achat planifié
 * 
 * Les achats planifiés permettent de créer une wishlist avec dates et budgets.
 * Tous les endpoints nécessitent une authentification.
 */

import { Request, Response } from "express";
import { addPlanned, deletePlanned, getPlanned } from "./profil.service";

/**
 * Handler pour récupérer les achats planifiés
 * 
 * Retourne tous les achats planifiés de l'utilisateur authentifié,
 * triés par date planifiée croissante.
 * 
 * @param req - Requête Express (req.user défini par authenticate)
 * @param res - Réponse Express
 * @returns 200 avec { data: PlannedPurchase[] }
 */
export async function getPlannedHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const planned = await getPlanned(req.user!.id);
  res.json({ data: planned });
}

/**
 * Handler pour ajouter un achat planifié
 * 
 * Crée un nouvel achat planifié dans la wishlist.
 * Stocke les noms de carte et d'édition (dénormalisation) pour éviter
 * des appels API répétés.
 * 
 * @param req - Requête Express avec body {
 *   cardId, setId, cardName, setName, plannedDate,
 *   budget?, condition?, notes?
 * }
 * @param res - Réponse Express
 * @returns 201 avec { data: PlannedPurchase } ou 400 si champs manquants
 */
export async function addPlannedHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { cardId, setId, cardName, setName, plannedDate, budget, condition, notes } = req.body as {
    cardId?: string;
    setId?: string;
    cardName?: string;
    setName?: string;
    plannedDate?: string;
    budget?: number | null;
    condition?: import("../../types/models").CardCondition;
    notes?: string | null;
  };

  // Validation des champs requis (incluant les noms pour dénormalisation)
  if (!cardId || !setId || !cardName || !setName || !plannedDate) {
    res
      .status(400)
      .json({ error: "cardId, setId, cardName, setName and plannedDate are required" });
    return;
  }

  // Création avec valeurs par défaut : condition='NM', budget et notes nullable
  const planned = await addPlanned({
    userId: req.user!.id,
    cardId,
    setId,
    cardName,
    setName,
    plannedDate,
    budget: budget ?? null,
    condition: condition ?? 'NM', // NM (Near Mint) par défaut
    notes: notes ?? null,
  });
  res.status(201).json({ data: planned });
}

/**
 * Handler pour supprimer un achat planifié
 * 
 * Retire l'achat planifié de la wishlist.
 * Vérifie que l'achat appartient bien à l'utilisateur (sécurité).
 * 
 * @param req - Requête Express avec params.id
 * @param res - Réponse Express
 * @returns 200 avec message de confirmation ou 404 si non trouvé
 */
export async function deletePlannedHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await deletePlanned(req.user!.id, req.params.id);
  res.json({ message: "Planned purchase deleted" });
}
