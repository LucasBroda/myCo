import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  compareHandler,
  getDealsHandler,
  searchHandler,
} from "./market.controller";

const router = Router();

router.use(authenticate);

router.get("/search", searchHandler);
router.get("/deals", getDealsHandler);
router.get("/compare/:cardId", compareHandler);

export default router;
