/**
 * Routes de gestion de collection
 * 
 * Définit les endpoints HTTP pour gérer la collection de cartes de l'utilisateur.
 * Toutes les routes nécessitent une authentification.
 * 
 * Endpoints principaux :
 * - GET /api/collection - Collection légère (IDs uniquement)
 * - GET /api/collection/avec-details - Collection enrichie avec noms
 * - POST /api/collection - Ajouter une carte
 * - DELETE /api/collection/:id - Retirer une carte
 * - GET /api/collection/statistiques - Stats de collection
 * 
 * Endpoints éditions suivies :
 * - GET /api/collection/collections-suivies - Liste des éditions suivies
 * - POST /api/collection/collections-suivies - Suivre une édition
 * - DELETE /api/collection/collections-suivies/:setId - Ne plus suivre
 */

import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  addCardHandler,
  followSetHandler,
  getCollectionHandler,
  getCollectionWithDetailsHandler,
  getFollowedSetsHandler,
  getStatsHandler,
  removeCardHandler,
  unfollowSetHandler,
} from "./collection.controleur";

const router = Router();

/**
 * Toutes les routes nécessitent une authentification
 */
router.use(authenticate);

/**
 * GET /api/collection
 * Récupère la collection légère (sans enrichissement)
 * Plus rapide mais moins d'informations
 */
router.get("/", getCollectionHandler);

/**
 * GET /api/collection/avec-details
 * Récupère la collection enrichie avec noms de cartes et d'éditions
 * Plus lent mais contient toutes les informations pour l'affichage
 */
router.get("/avec-details", getCollectionWithDetailsHandler);

/**
 * POST /api/collection
 * Ajoute une carte à la collection
 * Body : { cardId, setId, acquiredDate, pricePaid?, condition }
 */
router.post("/", addCardHandler);

/**
 * DELETE /api/collection/:id
 * Retire une carte de la collection
 * Vérifie que la carte appartient bien à l'utilisateur
 */
router.delete("/:id", removeCardHandler);

/**
 * GET /api/collection/statistiques
 * Récupère les statistiques agrégées de collection
 */
router.get("/statistiques", getStatsHandler);

/**
 * Routes pour les éditions suivies (favoris)
 */

/**
 * GET /api/collection/collections-suivies
 * Liste des IDs d'éditions suivies par l'utilisateur
 */
router.get("/collections-suivies", getFollowedSetsHandler);

/**
 * POST /api/collection/collections-suivies
 * Ajoute une édition aux favoris
 * Body : { setId }
 * Idempotent (pas d'erreur si déjà suivi)
 */
router.post("/collections-suivies", followSetHandler);

/**
 * DELETE /api/collection/collections-suivies/:setId
 * Retire une édition des favoris
 */
router.delete("/collections-suivies/:setId", unfollowSetHandler);

export default router;
