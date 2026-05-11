/**
 * Contrôleur de gestion des ventes
 * 
 * Gère les endpoints HTTP pour les ventes planifiées et les statistiques :
 * - GET /api/ventes/planifiees - Liste des ventes planifiées
 * - POST /api/ventes/planifiees - Ajouter une vente planifiée
 * - PATCH /api/ventes/planifiees/:id - Mettre à jour une vente
 * - DELETE /api/ventes/planifiees/:id - Supprimer une vente
 * 
 * Tous les endpoints incluent une gestion d'erreurs explicite avec try/catch.
 */

import type { Request, Response } from "express";
import * as salesService from "./ventes.service";
import type { CardCondition } from "../../types/models";

/**
 * Handler pour récupérer les ventes planifiées
 * 
 * Retourne toutes les ventes planifiées de l'utilisateur authentifié.
 * 
 * @param req - Requête Express (req.user défini par authenticate)
 * @param res - Réponse Express
 * @returns 200 avec { data: PlannedSale[] } ou 500 en cas d'erreur
 */
export async function getPlannedSales(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const sales = await salesService.obtenirVentesPlanifiees(userId);
    res.json({ data: sales });
  } catch (error) {
    console.error("Error fetching planned sales:", error);
    res.status(500).json({ error: "Failed to fetch planned sales" });
  }
}

/**
 * Handler pour ajouter une vente planifiée
 * 
 * Crée une nouvelle vente planifiée pour une carte de la collection.
 * 
 * @param req - Requête Express avec body {
 *   cardId, setId, salePrice, saleDate, condition, notes?
 * }
 * @param res - Réponse Express
 * @returns 201 avec { data: PlannedSale } ou 400/500 en cas d'erreur
 */
export async function addPlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { cardId, setId, salePrice, saleDate, condition, notes } = req.body;

    // Validation des champs requis
    if (!cardId || !setId || !salePrice || !saleDate || !condition) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Conversion du prix en nombre flottant
    const sale = await salesService.ajouterVentePlanifiee(
      userId,
      cardId,
      setId,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.status(201).json({ data: sale });
  } catch (error) {
    console.error("Error adding planned sale:", error);
    res.status(500).json({ error: "Failed to add planned sale" });
  }
}

/**
 * Handler pour mettre à jour une vente planifiée
 * 
 * Modifie les détails d'une vente existante (prix, date, condition, notes).
 * 
 * @param req - Requête Express avec params.id et body {
 *   salePrice, saleDate, condition, notes?
 * }
 * @param res - Réponse Express
 * @returns 200 avec { data: PlannedSale }, 400 si invalide, 404 si non trouvée, ou 500 en cas d'erreur
 */
export async function updatePlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { salePrice, saleDate, condition, notes } = req.body;

    // Validation de l'ID
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    // Validation des champs requis
    if (!salePrice || !saleDate || !condition) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const sale = await salesService.modifierVentePlanifiee(
      userId,
      id,
      Number.parseFloat(salePrice),
      saleDate,
      condition as CardCondition,
      notes || null,
    );

    res.json({ data: sale });
  } catch (error) {
    console.error("Error updating planned sale:", error);
    // Gestion d'erreur spécifique si la vente n'existe pas
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update planned sale" });
  }
}

/**
 * Handler pour supprimer une vente planifiée
 * 
 * Retire définitivement une vente de la liste.
 * 
 * @param req - Requête Express avec params.id
 * @param res - Réponse Express
 * @returns 204 (no content) si succès, 400 si ID invalide, 404 si non trouvée, ou 500 en cas d'erreur
 */
export async function deletePlannedSale(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Validation de l'ID
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    await salesService.supprimerVentePlanifiee(userId, id);
    res.status(204).send(); // 204 No Content (succès sans corps de réponse)
  } catch (error) {
    console.error("Error deleting planned sale:", error);
    // Gestion d'erreur spécifique si la vente n'existe pas
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete planned sale" });
  }
}

export async function markSaleAsCompleted(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Invalid sale ID" });
      return;
    }

    const sale = await salesService.marquerVenteCommeTerminee(userId, id);
    res.json({ data: sale });
  } catch (error) {
    console.error("Error marking sale as completed:", error);
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to mark sale as completed" });
  }
}

export async function getSalesStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const stats = await salesService.obtenirStatistiquesVentes(userId);
    res.json({ data: stats });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({ error: "Failed to fetch sales stats" });
  }
}
