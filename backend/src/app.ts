/**
 * Configuration de l'application Express
 * 
 * Ce fichier configure tous les middleware et routes de l'application.
 * Il exporte l'instance Express pour utilisation dans server.ts ou les tests.
 */

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import "express-async-errors"; // Permet aux erreurs async/await d'être capturées automatiquement
import helmet from "helmet";

import { gestionnaireErreurs } from "./middleware/errorHandler";
import authRoutes from "./modules/authentification/authentification.routes";
import cardsRoutes from "./modules/cartes/cartes.routes";
import collectionRoutes from "./modules/collection/collection.routes";
import marketRoutes from "./modules/marche/marche.routes";
import profileRoutes from "./modules/profil/profil.routes";
import salesRoutes from "./modules/ventes/ventes.routes";

// Crée l'instance Express
const app = express();

/**
 * Middleware de sécurité
 * 
 * helmet() ajoute plusieurs en-têtes HTTP de sécurité pour protéger contre
 * les vulnérabilités courantes (XSS, clickjacking, etc.)
 */
app.use(helmet());

/**
 * Configuration CORS (Cross-Origin Resource Sharing)
 * 
 * Permet au frontend (port 3000) de communiquer avec le backend (port 5000).
 * credentials: true autorise l'envoi de cookies entre domaines.
 */
app.use(
  cors({
    origin: "http://localhost:3000", // URL du frontend
    credentials: true,              // Autorise les cookies
  }),
);

/**
 * Middleware de parsing
 * 
 * express.json() parse les corps de requête JSON
 * cookieParser() parse les cookies des en-têtes HTTP
 */
app.use(express.json());
app.use(cookieParser());

/**
 * Route de santé / health check
 * 
 * Endpoint simple pour vérifier que le serveur est opérationnel.
 * Utile pour les load balancers et le monitoring.
 */
app.get("/api/sante", (_req, res) => {
  res.json({ status: "ok" });
});

/**
 * Enregistrement des routes de l'application
 * 
 * Chaque module de l'application est monté sur son propre préfixe d'URL.
 * Cela permet une organisation modulaire et une séparation des responsabilités.
 */
app.use("/api/authentification", authRoutes);
app.use("/api/cartes", cardsRoutes);
app.use("/api/collection", collectionRoutes);
app.use("/api/profil", profileRoutes);
app.use("/api/marche", marketRoutes);
app.use("/api/ventes", salesRoutes);

/**
 * Middleware de gestion d'erreurs
 * 
 * Doit être enregistré en dernier pour capturer toutes les erreurs
 * non gérées dans les routes et middleware précédents.
 */
app.use(gestionnaireErreurs);

export default app;
