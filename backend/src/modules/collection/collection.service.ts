import { db } from "../../config/db";
import {
  AcquiredCard,
  CardCondition,
  CollectionStats,
} from "../../types/models";

export async function getCollection(userId: string): Promise<AcquiredCard[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, acquired_date, price_paid, condition, created_at
     FROM acquired_cards WHERE user_id = $1
     ORDER BY acquired_date DESC, created_at DESC`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    acquiredDate: row.acquired_date as string,
    pricePaid: row.price_paid as number | null,
    condition: row.condition as CardCondition,
    createdAt: row.created_at as string,
  }));
}

export async function addCard(
  userId: string,
  cardId: string,
  setId: string,
  acquiredDate: string,
  pricePaid: number | null,
  condition: CardCondition,
): Promise<AcquiredCard> {
  const result = await db.query(
    `INSERT INTO acquired_cards (user_id, card_id, set_id, acquired_date, price_paid, condition)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, card_id, set_id, acquired_date, price_paid, condition, created_at`,
    [userId, cardId, setId, acquiredDate, pricePaid, condition],
  );
  const row = result.rows[0];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    acquiredDate: row.acquired_date as string,
    pricePaid: row.price_paid as number | null,
    condition: row.condition as CardCondition,
    createdAt: row.created_at as string,
  };
}

export async function removeCard(userId: string, id: string): Promise<void> {
  const result = await db.query(
    "DELETE FROM acquired_cards WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  if (result.rowCount === 0) {
    const err = new Error("Card not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function getStats(userId: string): Promise<CollectionStats> {
  const totalsResult = await db.query(
    `SELECT
       COUNT(*)::int              AS total_cards,
       COALESCE(SUM(price_paid), 0) AS total_spent
     FROM acquired_cards WHERE user_id = $1`,
    [userId],
  );

  const monthsResult = await db.query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', acquired_date), 'YYYY-MM') AS month,
       COALESCE(SUM(price_paid), 0)                           AS total_spent,
       COUNT(*)::int                                          AS card_count
     FROM acquired_cards
     WHERE user_id = $1
     GROUP BY 1
     ORDER BY 1`,
    [userId],
  );

  const totals = totalsResult.rows[0];
  return {
    totalCards: totals.total_cards as number,
    totalSpent: parseFloat(totals.total_spent as string),
    estimatedValue: 0, // enriched by market service when needed
    byMonth: monthsResult.rows.map((row) => ({
      month: row.month as string,
      totalSpent: parseFloat(row.total_spent as string),
      cardCount: row.card_count as number,
    })),
  };
}
