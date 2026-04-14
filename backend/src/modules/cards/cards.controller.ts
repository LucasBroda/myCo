import { Request, Response } from "express";
import { getCard, getSet, getSets, searchCards } from "./cards.service";

export async function getSetsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const sets = await getSets();
  res.json({ data: sets });
}

export async function getSetHandler(
  req: Request<{ setId: string }>,
  res: Response,
): Promise<void> {
  const { setId } = req.params;
  const result = await getSet(setId);
  res.json(result);
}

export async function getCardHandler(
  req: Request<{ cardId: string }>,
  res: Response,
): Promise<void> {
  const { cardId } = req.params;
  const card = await getCard(cardId);
  res.json({ data: card });
}

export async function searchHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, set } = req.query as { q?: string; set?: string };
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }
  const cards = await searchCards(q.trim(), set);
  res.json({ data: cards });
}
