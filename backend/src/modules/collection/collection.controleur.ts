import { Request, Response } from "express";
import { CardCondition } from "../../types/models";
import {
  addCard,
  followSet,
  getCollection,
  getCollectionWithDetails,
  getFollowedSets,
  getStats,
  removeCard,
  unfollowSet,
} from "./collection.service";

const VALID_CONDITIONS: CardCondition[] = [
  "Mint",
  "NM",
  "LP",
  "MP",
  "HP",
  "Damaged",
];

export async function getCollectionHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const cards = await getCollection(req.user!.id);
  res.json({ data: cards });
}

export async function getCollectionWithDetailsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const cards = await getCollectionWithDetails(req.user!.id);
  res.json({ data: cards });
}

export async function addCardHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { cardId, setId, acquiredDate, pricePaid, condition } = req.body as {
    cardId?: string;
    setId?: string;
    acquiredDate?: string;
    pricePaid?: number | null;
    condition?: CardCondition;
  };

  if (!cardId || !setId || !acquiredDate || !condition) {
    res
      .status(400)
      .json({
        error: "cardId, setId, acquiredDate and condition are required",
      });
    return;
  }
  if (!VALID_CONDITIONS.includes(condition)) {
    res
      .status(400)
      .json({
        error: `condition must be one of: ${VALID_CONDITIONS.join(", ")}`,
      });
    return;
  }

  const card = await addCard(
    req.user!.id,
    cardId,
    setId,
    acquiredDate,
    pricePaid ?? null,
    condition,
  );
  res.status(201).json({ data: card });
}

export async function removeCardHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await removeCard(req.user!.id, req.params.id);
  res.json({ message: "Card removed from collection" });
}

export async function getStatsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const stats = await getStats(req.user!.id);
  res.json({ data: stats });
}

export async function followSetHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { setId } = req.body as { setId?: string };

  if (!setId) {
    res.status(400).json({ error: "setId is required" });
    return;
  }

  const result = await followSet(req.user!.id, setId);
  res.status(201).json({ data: result });
}

export async function unfollowSetHandler(
  req: Request<{ setId: string }>,
  res: Response,
): Promise<void> {
  await unfollowSet(req.user!.id, req.params.setId);
  res.json({ message: "Set unfollowed" });
}

export async function getFollowedSetsHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const setIds = await getFollowedSets(req.user!.id);
  res.json({ data: setIds });
}
