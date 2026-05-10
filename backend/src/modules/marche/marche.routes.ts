import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  compareHandler,
  getDealsHandler,
  searchHandler,
} from "./marche.controleur";

const router = Router();

router.use(authenticate);

router.get("/recherche", searchHandler);
router.get("/offres", getDealsHandler);
router.get("/comparer/:cardId", compareHandler);

export default router;
