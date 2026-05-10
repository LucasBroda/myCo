import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getMeHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
} from "./authentification.controleur";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", authenticate, getMeHandler);
router.post("/logout", logoutHandler);

export default router;
