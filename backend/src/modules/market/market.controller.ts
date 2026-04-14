import { Request, Response } from "express";
import { compareCard, getDeals, searchMarket } from "./market.service";

export async function searchHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, set } = req.query as { q?: string; set?: string };
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }
  const results = await searchMarket(q.trim(), set);
  res.json({ data: results });
}

export async function getDealsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const deals = await getDeals();
  res.json({ data: deals });
}

export async function compareHandler(
  req: Request<{ cardId: string }>,
  res: Response,
): Promise<void> {
  const { cardId } = req.params;
  const comparison = await compareCard(cardId);
  res.json({ data: comparison });
}
