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
} from "./collection.controleur";

const router = Router();

router.use(authenticate);

router.get("/", getCollectionHandler);
router.get("/avec-details", getCollectionWithDetailsHandler);
router.post("/", addCardHandler);
router.delete("/:id", removeCardHandler);
router.get("/statistiques", getStatsHandler);

// Followed sets routes
router.get("/collections-suivies", getFollowedSetsHandler);
router.post("/collections-suivies", followSetHandler);
router.delete("/collections-suivies/:setId", unfollowSetHandler);

export default router;
