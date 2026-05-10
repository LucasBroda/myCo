import { db } from "../../config/db";
import {
  PlannedSale,
  CardCondition,
  SalesStats,
} from "../../types/models";
import * as cardsService from "../cards/cards.service";

export async function getPlannedSales(userId: string): Promise<PlannedSale[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, completed, created_at
     FROM planned_sales WHERE user_id = $1
     ORDER BY sale_date ASC, created_at DESC`,
    [userId],
  );

  // Fetch card details in parallel
  const salesWithDetailsPromises = result.rows.map(async (row) => {
    let cardName = row.card_id as string;
    let setName = "Unknown Set";

    try {
      const card = await cardsService.getCard(row.card_id as string);
      cardName = card.name;
      setName = card.set.name;
    } catch (error) {
      console.error(
        `Failed to fetch card details for ${row.card_id}:`,
        error,
      );
    }

    return {
      id: row.id as string,
      cardName,
      setName,
      userId: row.user_id as string,
      cardId: row.card_id as string,
      setId: row.set_id as string,
      salePrice: Number.parseFloat(row.sale_price),
      saleDate: row.sale_date as string,
      condition: row.condition as CardCondition,
      notes: row.notes as string | null,
      completed: row.completed as boolean,
      createdAt: row.created_at as string,
    };
  });

  return Promise.all(salesWithDetailsPromises);
}

export async function addPlannedSale(
  userId: string,
  cardId: string,
  setId: string,
  salePrice: number,
  saleDate: string,
  condition: CardCondition,
  notes: string | null,
): Promise<PlannedSale> {
  // Remove one instance of this card from the user's collection
  // Match by cardId and condition to remove the right card
  await db.query(
    `DELETE FROM acquired_cards 
     WHERE id = (
       SELECT id FROM acquired_cards 
       WHERE user_id = $1 AND card_id = $2 AND condition = $3
       LIMIT 1
     )`,
    [userId, cardId, condition],
  );

  const result = await db.query(
    `INSERT INTO planned_sales (user_id, card_id, set_id, sale_price, sale_date, condition, notes, completed)
     VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
     RETURNING id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, completed, created_at`,
    [userId, cardId, setId, salePrice, saleDate, condition, notes],
  );

  const row = result.rows[0];

  // Fetch card details to get names
  let cardName = cardId;
  let setName = "Unknown Set";
  try {
    const card = await cardsService.getCard(cardId);
    cardName = card.name;
    setName = card.set.name;
  } catch (error) {
    console.error(`Failed to fetch card details for ${cardId}:`, error);
  }

  return {
    id: row.id as string,
    cardName,
    setName,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    salePrice: Number.parseFloat(row.sale_price),
    saleDate: row.sale_date as string,
    condition: row.condition as CardCondition,
    notes: row.notes as string | null,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  };
}

export async function updatePlannedSale(
  userId: string,
  saleId: string,
  salePrice: number,
  saleDate: string,
  condition: CardCondition,
  notes: string | null,
): Promise<PlannedSale> {
  const result = await db.query(
    `UPDATE planned_sales
     SET sale_price = $3, sale_date = $4, condition = $5, notes = $6
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, completed, created_at`,
    [saleId, userId, salePrice, saleDate, condition, notes],
  );

  if (result.rows.length === 0) {
    throw new Error("Planned sale not found or unauthorized");
  }

  const row = result.rows[0];

  // Fetch card details to get names
  let cardName = row.card_id as string;
  let setName = "Unknown Set";
  try {
    const card = await cardsService.getCard(row.card_id as string);
    cardName = card.name;
    setName = card.set.name;
  } catch (error) {
    console.error(`Failed to fetch card details for ${row.card_id}:`, error);
  }

  return {
    id: row.id as string,
    cardName,
    setName,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    salePrice: Number.parseFloat(row.sale_price),
    saleDate: row.sale_date as string,
    condition: row.condition as CardCondition,
    notes: row.notes as string | null,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  };
}

export async function deletePlannedSale(
  userId: string,
  saleId: string,
): Promise<void> {
  const result = await db.query(
    `DELETE FROM planned_sales WHERE id = $1 AND user_id = $2`,
    [saleId, userId],
  );

  if (result.rowCount === 0) {
    throw new Error("Planned sale not found or unauthorized");
  }
}

export async function markSaleAsCompleted(
  userId: string,
  saleId: string,
): Promise<PlannedSale> {
  const result = await db.query(
    `UPDATE planned_sales
     SET completed = TRUE
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, completed, created_at`,
    [saleId, userId],
  );

  if (result.rows.length === 0) {
    throw new Error("Planned sale not found or unauthorized");
  }

  const row = result.rows[0];

  // Fetch card details to get names
  let cardName = row.card_id as string;
  let setName = "Unknown Set";
  try {
    const card = await cardsService.getCard(row.card_id as string);
    cardName = card.name;
    setName = card.set.name;
  } catch (error) {
    console.error(`Failed to fetch card details for ${row.card_id}:`, error);
  }

  return {
    id: row.id as string,
    cardName,
    setName,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    salePrice: Number.parseFloat(row.sale_price),
    saleDate: row.sale_date as string,
    condition: row.condition as CardCondition,
    notes: row.notes as string | null,
    completed: row.completed as boolean,
    createdAt: row.created_at as string,
  };
}

export async function getSalesStats(userId: string): Promise<SalesStats> {
  const result = await db.query(
    `SELECT 
       COUNT(*)::int AS total_sales,
       COALESCE(SUM(sale_price), 0) AS total_value
     FROM planned_sales 
     WHERE user_id = $1 AND completed = TRUE`,
    [userId],
  );

  const row = result.rows[0];
  return {
    totalSales: row.total_sales as number,
    totalValue: Number.parseFloat(row.total_value as string),
  };
}
