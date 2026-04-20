import { db } from "../../config/db";
import { PlannedPurchase } from "../../types/models";

export async function getPlanned(userId: string): Promise<PlannedPurchase[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, notes, created_at
     FROM planned_purchases WHERE user_id = $1
     ORDER BY planned_date ASC`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    cardName: row.card_name as string,
    setName: row.set_name as string,
    plannedDate: row.planned_date as string,
    budget: row.budget as number | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  }));
}

export async function addPlanned(params: {
  userId: string;
  cardId: string;
  setId: string;
  cardName: string;
  setName: string;
  plannedDate: string;
  budget: number | null;
  notes: string | null;
}): Promise<PlannedPurchase> {
  const { userId, cardId, setId, cardName, setName, plannedDate, budget, notes } = params;
  const result = await db.query(
    `INSERT INTO planned_purchases (user_id, card_id, set_id, card_name, set_name, planned_date, budget, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, notes, created_at`,
    [userId, cardId, setId, cardName, setName, plannedDate, budget, notes],
  );
  const row = result.rows[0];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    cardName: row.card_name as string,
    setName: row.set_name as string,
    plannedDate: row.planned_date as string,
    budget: row.budget as number | null,
    notes: row.notes as string | null,
    createdAt: row.created_at as string,
  };
}

export async function deletePlanned(userId: string, id: string): Promise<void> {
  const result = await db.query(
    "DELETE FROM planned_purchases WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  if (result.rowCount === 0) {
    const err = new Error("Planned purchase not found") as Error & {
      status: number;
    };
    err.status = 404;
    throw err;
  }
}
