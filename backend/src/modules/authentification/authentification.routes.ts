/**
 * Routes d'authentification
 * 
 * Définit les endpoints HTTP pour l'authentification des utilisateurs.
 * 
 * Endpoints :
 * - POST /api/authentification/inscription - Créer un nouveau compte
 * - POST /api/authentification/connexion - Se connecter
 * - GET /api/authentification/moi - Obtenir le profil utilisateur (protégé)
 * - POST /api/authentification/deconnexion - Se déconnecter
 * 
 * La route /moi nécessite une authentification (middleware authenticate).
 */

import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
} from "./authentification.controleur";

const router = Router();

/**
 * POST /api/authentification/inscription
 * Crée un nouveau compte utilisateur
 * Public (pas d'authentification requise)
 */
router.post("/inscription", registerHandler);

/**
 * POST /api/authentification/connexion
 * Authentifie un utilisateur existant
 * Public (pas d'authentification requise)
 */
router.post("/connexion", loginHandler);

/**
 * GET /api/authentification/moi
 * Récupère les informations du profil de l'utilisateur connecté
 * Protégé par le middleware authenticate
 */
router.get("/moi", authenticate, getMeHandler);

/**
 * POST /api/authentification/deconnexion
 * Supprime le cookie de session
 * Public (mais utilisé par les utilisateurs connectés)
 */
router.post("/deconnexion", logoutHandler);

export default router;
