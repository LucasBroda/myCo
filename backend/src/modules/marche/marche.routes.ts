/**
 * Routes du marché
 * 
 * Définit les endpoints HTTP pour les fonctionnalités de marché avec intégration eBay.
 * Toutes les routes nécessitent une authentification.
 * 
 * Endpoints :
 * - GET /api/marche/recherche?q=xxx&set=yyy - Recherche avec prix eBay
 * - GET /api/marche/offres - Meilleures opportunités d'achat
 * - GET /api/marche/comparer/:cardId - Comparaison de prix pour une carte
 * 
 * Les prix eBay sont calculés à partir de la moyenne des 10 meilleurs
 * Buy It Now dans la catégorie Pokémon (183454).
 */

import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  compareHandler,
  getDealsHandler,
  searchHandler,
} from "./marche.controleur";

const router = Router();

/**
 * Toutes les routes nécessitent une authentification
 */
router.use(authenticate);

/**
 * GET /api/marche/recherche?q=xxx&set=yyy
 * Recherche de cartes avec enrichissement des prix eBay
 * Similaire à /api/cartes/recherche mais inclut les données de marché
 */
router.get("/recherche", searchHandler);

/**
 * GET /api/marche/offres
 * Retourne les cartes avec les meilleurs écarts négatifs
 * entre prix Cardmarket et prix eBay (opportunités d'achat)
 */
router.get("/offres", getDealsHandler);

/**
 * GET /api/marche/comparer/:cardId
 * Compare les prix Cardmarket et eBay pour une carte spécifique
 * Utile pour évaluer si le prix eBay est intéressant
 */
router.get("/comparer/:cardId", compareHandler);

export default router;
