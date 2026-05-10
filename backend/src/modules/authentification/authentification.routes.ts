import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
} from "./authentification.controleur";

const router = Router();

router.post("/inscription", registerHandler);
router.post("/connexion", loginHandler);
router.get("/moi", authenticate, getMeHandler);
router.post("/deconnexion", logoutHandler);

export default router;
