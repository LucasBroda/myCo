import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import {
  addCardHandler,
  followSetHandler,
  getCollectionHandler,
  getCollectionWithDetailsHandler,
  getFollowedSetsHandler,
  getStatsHandler,
  removeCardHandler,
  unfollowSetHandler,
} from "./collection.controller";

const router = Router();

router.use(authenticate);

router.get("/", getCollectionHandler);
router.get("/with-details", getCollectionWithDetailsHandler);
router.post("/", addCardHandler);
router.delete("/:id", removeCardHandler);
router.get("/stats", getStatsHandler);

// Followed sets routes
router.get("/followed-sets", getFollowedSetsHandler);
router.post("/followed-sets", followSetHandler);
router.delete("/followed-sets/:setId", unfollowSetHandler);

export default router;
