import { db } from "../../config/db";
import {
  AcquiredCard,
  CardCondition,
  CollectionStats,
} from "../../types/models";
import * as cardsService from "../cards/cards.service";

export async function getCollection(userId: string): Promise<AcquiredCard[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, acquired_date, price_paid, condition, created_at
     FROM acquired_cards WHERE user_id = $1
     ORDER BY acquired_date DESC, created_at DESC`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    // Note: cardName and setName are not stored in DB, use placeholders
    // For full details with names, use getCollectionWithDetails
    cardName: "",
    setName: "",
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    acquiredDate: row.acquired_date as string,
    // PostgreSQL returns NUMERIC as string, convert to number
    pricePaid: row.price_paid ? parseFloat(row.price_paid) : null,
    condition: row.condition as CardCondition,
    createdAt: row.created_at as string,
  }));
}

export async function getCollectionWithDetails(
  userId: string,
): Promise<AcquiredCard[]> {
  // Process expired planned purchases before fetching collection
  // This ensures any planned purchases with dates that have arrived are added to collection
  try {
    const { processExpiredPlannedPurchases } = await import("../profile/profile.service");
    await processExpiredPlannedPurchases(userId);
  } catch (error) {
    console.error("Failed to process expired planned purchases:", error);
    // Continue even if this fails
  }
  
  const acquiredCards = await getCollection(userId);

  // Fetch card details in parallel (with reasonable batching to avoid overwhelming the API)
  const cardDetailsPromises = acquiredCards.map(async (acquired) => {
    try {
      const card = await cardsService.getCard(acquired.cardId);
      return {
        ...acquired,
        cardName: card.name,
        setName: card.set.name,
      };
    } catch (error) {
      // If card details can't be fetched, use fallback
      console.error(
        `Failed to fetch card details for ${acquired.cardId}:`,
        error,
      );
      return {
        ...acquired,
        cardName: acquired.cardId,
        setName: "Unknown Set",
      };
    }
  });

  return Promise.all(cardDetailsPromises);
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
    acquiredDate: row.acquired_date as string,
    // PostgreSQL returns NUMERIC as string, convert to number
    pricePaid: row.price_paid ? parseFloat(row.price_paid) : null,
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

export async function followSet(
  userId: string,
  setId: string,
): Promise<{ setId: string; followedAt: string }> {
  const result = await db.query(
    `INSERT INTO followed_sets (user_id, set_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, set_id) DO NOTHING
     RETURNING set_id, followed_at`,
    [userId, setId],
  );
  const row = result.rows[0];
  return {
    setId: row.set_id as string,
    followedAt: row.followed_at as string,
  };
}

export async function unfollowSet(
  userId: string,
  setId: string,
): Promise<void> {
  const result = await db.query(
    "DELETE FROM followed_sets WHERE user_id = $1 AND set_id = $2",
    [userId, setId],
  );
  if (result.rowCount === 0) {
    const err = new Error("Set not followed") as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function getFollowedSets(userId: string): Promise<string[]> {
  const result = await db.query(
    "SELECT set_id FROM followed_sets WHERE user_id = $1 ORDER BY followed_at DESC",
    [userId],
  );
  return result.rows.map((row) => row.set_id as string);
}

export async function getStats(userId: string): Promise<CollectionStats> {
  // Process expired planned purchases to ensure stats are up-to-date
  try {
    const { processExpiredPlannedPurchases } = await import("../profile/profile.service");
    await processExpiredPlannedPurchases(userId);
  } catch (error) {
    console.error("Failed to process expired planned purchases:", error);
    // Continue even if this fails
  }
  
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

  // Calculate estimated value based on current market prices
  let estimatedValue = 0;
  const acquiredCards = await getCollection(userId);
  
  // Fetch market prices for all cards in parallel
  const pricePromises = acquiredCards.map(async (acquired) => {
    try {
      const card = await cardsService.getCard(acquired.cardId);
      // Use average sell price, fallback to trend price, or 0 if unavailable
      const marketPrice = card.cardmarket?.prices?.averageSellPrice 
        || card.cardmarket?.prices?.trendPrice 
        || 0;
      return marketPrice;
    } catch (error) {
      console.error(`Failed to fetch price for card ${acquired.cardId}:`, error);
      return 0;
    }
  });

  const prices = await Promise.all(pricePromises);
  estimatedValue = prices.reduce((sum, price) => sum + price, 0);

  const totals = totalsResult.rows[0];
  return {
    totalCards: totals.total_cards as number,
    totalSpent: parseFloat(totals.total_spent as string),
    estimatedValue: estimatedValue,
    byMonth: monthsResult.rows.map((row) => ({
      month: row.month as string,
      totalSpent: parseFloat(row.total_spent as string),
      cardCount: row.card_count as number,
    })),
  };
}
