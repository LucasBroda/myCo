/**
 * Configuration de la connexion à la base de données PostgreSQL
 * 
 * Ce fichier configure un pool de connexions pour optimiser les performances
 * et la gestion des connexions à la base de données.
 */

import { Pool } from "pg";
import { env } from "./env";

/**
 * Pool de connexions PostgreSQL
 * 
 * Un pool de connexions permet de réutiliser les connexions existantes plutôt que
 * d'en créer de nouvelles à chaque requête, ce qui améliore significativement les performances.
 * 
 * Configuration :
 * - max: 10 connexions maximum simultanées (évite de surcharger la DB)
 * - idleTimeoutMillis: ferme les connexions inactives après 30 secondes
 * - connectionTimeoutMillis: timeout de 2 secondes pour établir une nouvelle connexion
 */
export const db = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Gestionnaire d'erreurs du pool
 * 
 * Capture les erreurs inattendues du pool de connexions (ex: perte de connexion réseau)
 * pour éviter que l'application ne crash et permettre un logging approprié.
 */
db.on("error", (err) => {
  console.error("Unexpected DB pool error", err);
});
