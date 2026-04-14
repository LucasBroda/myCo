import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
} from "./auth.controller";

// Création du router via une fonction Express, permet de grouper l'ensemble des routes
const router = Router();

// Permet de créer les différentes routes du module auth, lie l'appel spécifique d'une route avec l'exécution d'une méthode précise du controleur
router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", authenticate, getMeHandler); // Cette route est utilisée par le front pour savoir si le user est toujours connecté, et le redirige en fonction du retour de cette route
router.post("/logout", logoutHandler);

// Permet d'exporter l'ensemble des routes pour être ensuite exploité dans app.js
export default router;
