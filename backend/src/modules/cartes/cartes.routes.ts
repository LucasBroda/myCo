import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  getCardHandler,
  getSetHandler,
  getSetsHandler,
  searchHandler,
} from "./cartes.controleur";

const router = Router();

router.use(authenticate);

router.get("/sets", getSetsHandler);
router.get("/sets/:setId", getSetHandler);
router.get("/search", searchHandler);
router.get("/:cardId", getCardHandler);

export default router;
