/**
 * Routes de gestion des ventes
 * 
 * Définit les endpoints HTTP pour gérer les ventes planifiées et statistiques.
 * Toutes les routes nécessitent une authentification.
 * 
 * Endpoints :
 * - GET /api/ventes/statistiques - Statistiques de ventes
 * - GET /api/ventes - Liste des ventes planifiées
 * - POST /api/ventes - Ajouter une vente planifiée
 * - PATCH /api/ventes/:id - Mettre à jour une vente
 * - PATCH /api/ventes/:id/completer - Marquer comme complétée
 * - DELETE /api/ventes/:id - Supprimer une vente
 */

import { Router } from "express";
import * as salesController from "./ventes.controleur";
import { authenticate } from "../../middleware/auth";

const router = Router();

/**
 * Toutes les routes nécessitent une authentification
 */
router.use(authenticate);

/**
 * GET /api/ventes/statistiques
 * Récupère les statistiques de ventes (total, moyenne, etc.)
 */
router.get("/statistiques", salesController.getSalesStats);

/**
 * GET /api/ventes
 * Récupère toutes les ventes planifiées de l'utilisateur
 */
router.get("/", salesController.getPlannedSales);

/**
 * POST /api/ventes
 * Ajoute une nouvelle vente planifiée
 * Body : { cardId, setId, salePrice, saleDate, condition, notes? }
 */
router.post("/", salesController.addPlannedSale);

/**
 * PATCH /api/ventes/:id
 * Met à jour une vente planifiée existante
 * Body : { salePrice, saleDate, condition, notes? }
 */
router.patch("/:id", salesController.updatePlannedSale);

/**
 * PATCH /api/ventes/:id/completer
 * Marque une vente comme complétée
 * Utilisé pour archiver les ventes effectuées
 */
router.patch("/:id/completer", salesController.markSaleAsCompleted);

/**
 * DELETE /api/ventes/:id
 * Supprime définitivement une vente planifiée
 * Retourne 204 No Content en cas de succès
 */
router.delete("/:id", salesController.deletePlannedSale);

export default router;
