import app from "./app";
import { env } from "./config/env";

// Permet de démarrer le serveur sur le port définie dans le fichier env.ts
// Nécessaire niveau config car permet de communiquer avec l'API
app.listen(env.port, () => {
  console.log(`[server] Running on http://localhost:${env.port}`);
});
