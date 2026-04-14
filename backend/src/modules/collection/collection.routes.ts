import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  addCardHandler,
  getCollectionHandler,
  getStatsHandler,
  removeCardHandler,
} from "./collection.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCollectionHandler);
router.post("/", addCardHandler);
router.delete("/:id", removeCardHandler);
router.get("/stats", getStatsHandler);

export default router;
