import { db } from "../../config/db";
import {
  PotentialSale,
  CardCondition,
} from "../../types/models";
import * as cardsService from "../cards/cards.service";

export async function getPotentialSales(userId: string): Promise<PotentialSale[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, created_at
     FROM potential_sales WHERE user_id = $1
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
      createdAt: row.created_at as string,
    };
  });

  return Promise.all(salesWithDetailsPromises);
}

export async function addPotentialSale(
  userId: string,
  cardId: string,
  setId: string,
  salePrice: number,
  saleDate: string,
  condition: CardCondition,
  notes: string | null,
): Promise<PotentialSale> {
  const result = await db.query(
    `INSERT INTO potential_sales (user_id, card_id, set_id, sale_price, sale_date, condition, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, created_at`,
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
    createdAt: row.created_at as string,
  };
}

export async function updatePotentialSale(
  userId: string,
  saleId: string,
  salePrice: number,
  saleDate: string,
  condition: CardCondition,
  notes: string | null,
): Promise<PotentialSale> {
  const result = await db.query(
    `UPDATE potential_sales
     SET sale_price = $3, sale_date = $4, condition = $5, notes = $6
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, card_id, set_id, sale_price, sale_date, condition, notes, created_at`,
    [saleId, userId, salePrice, saleDate, condition, notes],
  );

  if (result.rows.length === 0) {
    throw new Error("Potential sale not found or unauthorized");
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
    createdAt: row.created_at as string,
  };
}

export async function deletePotentialSale(
  userId: string,
  saleId: string,
): Promise<void> {
  const result = await db.query(
    `DELETE FROM potential_sales WHERE id = $1 AND user_id = $2`,
    [saleId, userId],
  );

  if (result.rowCount === 0) {
    throw new Error("Potential sale not found or unauthorized");
  }
}
