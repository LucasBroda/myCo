/**
 * Routes pour l'API Pokémon TCG
 * 
 * Définit les endpoints HTTP pour accéder aux données de cartes Pokémon.
 * Toutes les routes nécessitent une authentification (router.use(authenticate)).
 * 
 * Endpoints :
 * - GET /api/cartes/collections - Liste de toutes les éditions
 * - GET /api/cartes/collections/:setId - Détails d'une édition avec ses cartes
 * - GET /api/cartes/recherche?q=xxx&set=yyy - Recherche de cartes
 * - GET /api/cartes/:cardId - Détails d'une carte spécifique
 * 
 * Les données proviennent de l'API Pokémon TCG avec cache Redis.
 */

import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getCardHandler,
  getSetHandler,
  getSetsHandler,
  searchHandler,
} from "./cartes.controleur";

const router = Router();

/**
 * Toutes les routes de ce module nécessitent une authentification
 * Le middleware authenticate vérifie le JWT et injecte req.user
 */
router.use(authenticate);

/**
 * GET /api/cartes/collections
 * Retourne toutes les éditions disponibles (jusqu'à 250, caché 24h)
 */
router.get("/collections", getSetsHandler);

/**
 * GET /api/cartes/collections/:setId
 * Retourne les détails d'une édition et toutes ses cartes
 * Utilise Promise.all pour optimiser les requêtes parallèles
 */
router.get("/collections/:setId", getSetHandler);

/**
 * GET /api/cartes/recherche?q=xxx&set=yyy
 * Recherche de cartes par nom avec filtre optionnel par édition
 * Minimum 2 caractères requis pour la recherche
 */
router.get("/recherche", searchHandler);

/**
 * GET /api/cartes/:cardId
 * Retourne les détails complets d'une carte spécifique
 * Inclut images, prix Cardmarket si disponibles, etc.
 */
router.get("/:cardId", getCardHandler);

export default router;
