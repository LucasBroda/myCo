import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  addPlannedHandler,
  deletePlannedHandler,
  getPlannedHandler,
} from "./profile.controller";

const router = Router();

router.use(authenticate);

router.get("/planned", getPlannedHandler);
router.post("/planned", addPlannedHandler);
router.delete("/planned/:id", deletePlannedHandler);

export default router;
