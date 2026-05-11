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
import { authentifier } from "../../middleware/auth";
import {
  obtenirUtilisateurGestionnaire,
  connecterGestionnaire,
  deconnecterGestionnaire,
  inscrireGestionnaire,
} from "./authentification.controleur";

const router = Router();

/**
 * POST /api/authentification/inscription
 * Crée un nouveau compte utilisateur
 * Public (pas d'authentification requise)
 */
router.post("/inscription", inscrireGestionnaire);

/**
 * POST /api/authentification/connexion
 * Authentifie un utilisateur existant
 * Public (pas d'authentification requise)
 */
router.post("/connexion", connecterGestionnaire);

/**
 * GET /api/authentification/moi
 * Récupère les informations du profil de l'utilisateur connecté
 * Protégé par le middleware authenticate
 */
router.get("/moi", authentifier, obtenirUtilisateurGestionnaire);

/**
 * POST /api/authentification/deconnexion
 * Supprime le cookie de session
 * Public (mais utilisé par les utilisateurs connectés)
 */
router.post("/deconnexion", deconnecterGestionnaire);

export default router;
