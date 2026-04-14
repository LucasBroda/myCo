import { Request, Response } from "express";
import { addPlanned, deletePlanned, getPlanned } from "./profile.service";

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
  const { cardId, setId, plannedDate, budget, notes } = req.body as {
    cardId?: string;
    setId?: string;
    plannedDate?: string;
    budget?: number | null;
    notes?: string | null;
  };

  if (!cardId || !setId || !plannedDate) {
    res
      .status(400)
      .json({ error: "cardId, setId and plannedDate are required" });
    return;
  }

  const planned = await addPlanned(
    req.user!.id,
    cardId,
    setId,
    plannedDate,
    budget ?? null,
    notes ?? null,
  );
  res.status(201).json({ data: planned });
}

export async function deletePlannedHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await deletePlanned(req.user!.id, req.params.id);
  res.json({ message: "Planned purchase deleted" });
}
