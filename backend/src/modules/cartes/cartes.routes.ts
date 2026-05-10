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

router.get("/collections", getSetsHandler);
router.get("/collections/:setId", getSetHandler);
router.get("/recherche", searchHandler);
router.get("/:cardId", getCardHandler);

export default router;
