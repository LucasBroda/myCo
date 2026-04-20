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
  const { cardName, setName, plannedDate, budget, notes } = req.body as {
    cardName?: string;
    setName?: string;
    plannedDate?: string;
    budget?: number | null;
    notes?: string | null;
  };

  if (!cardName || !setName || !plannedDate) {
    res
      .status(400)
      .json({ error: "cardName, setName and plannedDate are required" });
    return;
  }

  const planned = await addPlanned(
    req.user!.id,
    cardName,
    setName,
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
