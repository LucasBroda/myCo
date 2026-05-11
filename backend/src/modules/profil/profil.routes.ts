/**
 * Routes du profil utilisateur
 * 
 * Définit les endpoints HTTP pour gérer les achats planifiés (wishlist).
 * Toutes les routes nécessitent une authentification.
 * 
 * Endpoints :
 * - GET /api/profil/planifies - Liste des achats planifiés
 * - POST /api/profil/planifies - Ajouter un achat planifié
 * - DELETE /api/profil/planifies/:id - Supprimer un achat planifié
 * 
 * Les achats planifiés permettent de créer une wishlist avec
 * dates cibles et budgets pour les futures acquisitions.
 */

import { Router } from "express";
import { authentifier } from "../../middleware/auth";
import {
  ajouterAchatPlanifieGestionnaire,
  supprimerAchatPlanifieGestionnaire,
  obtenirAchatsPlanifiesGestionnaire,
} from "./profil.controleur";

const router = Router();

/**
 * Toutes les routes nécessitent une authentification
 */
router.use(authentifier);

/**
 * GET /api/profil/planifies
 * Récupère tous les achats planifiés de l'utilisateur
 * Triés par date planifiée croissante
 */
router.get("/planifies", obtenirAchatsPlanifiesGestionnaire);

/**
 * POST /api/profil/planifies
 * Ajoute un nouvel achat planifié à la wishlist
 * Body : {
 *   cardId, setId, cardName, setName, plannedDate,
 *   budget?, condition?, notes?
 * }
 * Les noms sont stockés pour éviter des appels API répétés
 */
router.post("/planifies", ajouterAchatPlanifieGestionnaire);

/**
 * DELETE /api/profil/planifies/:id
 * Supprime un achat planifié de la wishlist
 * Vérifie que l'achat appartient bien à l'utilisateur
 */
router.delete("/planifies/:id", supprimerAchatPlanifieGestionnaire);

export default router;
