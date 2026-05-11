/**
 * Point d'entrée du serveur
 * 
 * Ce fichier démarre le serveur HTTP Express et le met en écoute sur le port configuré.
 * Il importe l'application configurée depuis app.ts.
 */

import app from "./app";
import { env } from "./config/env";

/**
 * Démarre le serveur HTTP
 * 
 * Lance le serveur Express sur le port spécifié dans les variables d'environnement.
 * Le callback affiche un message de confirmation une fois le serveur prêt.
 */
app.listen(env.port, () => {
  console.log(`[server] Running on http://localhost:${env.port}`);
});
