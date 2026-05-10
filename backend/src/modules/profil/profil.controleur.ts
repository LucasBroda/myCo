import { Request, Response } from "express";
import { addPlanned, deletePlanned, getPlanned } from "./profil.service";

export async function getPlannedHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const planned = await getPlanned(req.user!.id);
  res.json({ data: planned });
}

export async function addPlannedHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { cardId, setId, cardName, setName, plannedDate, budget, condition, notes } = req.body as {
    cardId?: string;
    setId?: string;
    cardName?: string;
    setName?: string;
    plannedDate?: string;
    budget?: number | null;
    condition?: import("../../types/models").CardCondition;
    notes?: string | null;
  };

  if (!cardId || !setId || !cardName || !setName || !plannedDate) {
    res
      .status(400)
      .json({ error: "cardId, setId, cardName, setName and plannedDate are required" });
    return;
  }

  const planned = await addPlanned({
    userId: req.user!.id,
    cardId,
    setId,
    cardName,
    setName,
    plannedDate,
    budget: budget ?? null,
    condition: condition ?? 'NM',
    notes: notes ?? null,
  });
  res.status(201).json({ data: planned });
}

export async function deletePlannedHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await deletePlanned(req.user!.id, req.params.id);
  res.json({ message: "Planned purchase deleted" });
}
