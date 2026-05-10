import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  addPlannedHandler,
  deletePlannedHandler,
  getPlannedHandler,
} from "./profil.controleur";

const router = Router();

router.use(authenticate);

router.get("/planifies", getPlannedHandler);
router.post("/planifies", addPlannedHandler);
router.delete("/planifies/:id", deletePlannedHandler);

export default router;
