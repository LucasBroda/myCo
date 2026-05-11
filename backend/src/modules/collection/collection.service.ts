/**
 * Service de gestion de la collection de cartes de l'utilisateur
 * 
 * Gère les opérations CRUD sur la collection personnelle de chaque utilisateur :
 * - Ajout/suppression de cartes
 * - Suivi d'éditions
 * - Statistiques de collection
 */

import { db } from "../../config/db";
import {
  AcquiredCard,
  CardCondition,
  CollectionStats,
} from "../../types/models";
import * as cardsService from "../cartes/cartes.service";

/**
 * Récupère la collection de cartes d'un utilisateur (sans détails)
 * 
 * Version légère qui ne charge que les données stockées en base.
 * Les noms de cartes et d'éditions sont vides et doivent être chargés séparément.
 * Utiliser getCollectionWithDetails() pour obtenir les informations complètes.
 * 
 * @param userId - Identifiant de l'utilisateur
 * @returns Promise avec le tableau des cartes acquises (tri chronologique inverse)
 */
export async function getCollection(userId: string): Promise<AcquiredCard[]> {
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, acquired_date, price_paid, condition, created_at
     FROM acquired_cards WHERE user_id = $1
     ORDER BY acquired_date DESC, created_at DESC`,
    [userId],
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    // Note : cardName et setName ne sont pas stockés en DB, on utilise des placeholders
    // Pour les détails complets avec les noms, utiliser getCollectionWithDetails
    cardName: "",
    setName: "",
    userId: row.user_id as string,
    cardId: row.card_id as string,
    setId: row.set_id as string,
    acquiredDate: row.acquired_date as string,
    // PostgreSQL retourne NUMERIC en tant que chaîne, on convertit en nombre
    pricePaid: row.price_paid ? Number.parseFloat(row.price_paid) : null,
    condition: row.condition as CardCondition,
    createdAt: row.created_at as string,
  }));
}

/**
 * Récupère la collection avec tous les détails des cartes
 * 
 * Cette fonction :
 * 1. Traite d'abord les achats planifiés arrivés à échéance
 * 2. Récupère les cartes de la collection
 * 3. Charge en parallèle les détails de chaque carte (nom, édition, etc.)
 * 
 * Les requêtes API sont parallélisées avec Promise.all pour optimiser les performances.
 * En cas d'échec de récupération d'une carte, utilise des valeurs de fallback.
 * 
 * @param userId - Identifiant de l'utilisateur
 * @returns Promise avec le tableau des cartes avec détails complets
 */
export async function getCollectionWithDetails(
  userId: string,
): Promise<AcquiredCard[]> {
  // Traite les achats planifiés avant de récupérer la collection
  // Cela garantit que les achats dont la date est arrivée sont ajoutés à la collection
  try {
    const { processExpiredPlannedPurchases } = await import("../profil/profil.service");
    await processExpiredPlannedPurchases(userId);
  } catch (error) {
    console.error("Failed to process expired planned purchases:", error);
    // Continue même si cela échoue (pas bloquant)
  }
  
  const acquiredCards = await getCollection(userId);

  // Récupère les détails des cartes en parallèle
  // (avec un batching raisonnable pour ne pas surcharger l'API)
  const cardDetailsPromises = acquiredCards.map(async (acquired) => {
    try {
      const card = await cardsService.getCard(acquired.cardId);
      return {
        ...acquired,
        cardName: card.name,
        setName: card.set.name,
      };
    } catch (error) {
      // Si les détails de la carte ne peuvent pas être récupérés, utilise un fallback
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

/**
 * Ajoute une carte à la collection de l'utilisateur
 * 
 * Crée une nouvelle entrée dans la table acquired_cards avec toutes les métadonnées :
 * - Date d'acquisition
 * - Prix payé
 * - État de la carte (Mint, Near Mint, etc.)
 * 
 * @param userId - Identifiant de l'utilisateur
 * @param cardId - Identifiant de la carte
 * @param setId - Identifiant de l'édition
 * @param acquiredDate - Date d'acquisition (format ISO)
 * @param pricePaid - Prix payé (ou null si non renseigné)
 * @param condition - État de la carte
 * @returns Promise avec la carte ajoutée incluant les détails
 */
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
  
  // Récupère les détails de la carte pour obtenir les noms
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
    // PostgreSQL retourne NUMERIC en tant que chaîne, on convertit en nombre
    pricePaid: row.price_paid ? Number.parseFloat(row.price_paid) : null,
    condition: row.condition as CardCondition,
    createdAt: row.created_at as string,
  };
}

/**
 * Supprime une carte de la collection
 * 
 * Vérifie que la carte appartient bien à l'utilisateur avant suppression (sécurité).
 * 
 * @param userId - Identifiant de l'utilisateur
 * @param id - Identifiant de la carte acquise à supprimer
 * @throws Error 404 si la carte n'existe pas ou n'appartient pas à l'utilisateur
 */
export async function removeCard(userId: string, id: string): Promise<void> {
  const result = await db.query(
    "DELETE FROM acquired_cards WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  
  // rowCount = 0 signifie qu'aucune ligne n'a été supprimée
  if (result.rowCount === 0) {
    const err = new Error("Card not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

/**
 * Ajoute une édition aux éditions suivies par l'utilisateur
 * 
 * Utilise ON CONFLICT DO NOTHING pour éviter les doublons (édition déjà suivie).
 * Cela rend la requête idempotente (peut être appelée plusieurs fois sans effet indésirable).
 * 
 * @param userId - Identifiant de l'utilisateur
 * @param setId - Identifiant de l'édition à suivre
 * @returns Promise avec l'ID de l'édition et la date de suivi
 */
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

/**
 * Retire une édition des éditions suivies
 * 
 * @param userId - Identifiant de l'utilisateur
 * @param setId - Identifiant de l'édition à ne plus suivre
 * @throws Error 404 si l'édition n'était pas suivie
 */
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

/**
 * Récupère la liste des éditions suivies par l'utilisateur
 * 
 * Retourne uniquement les IDs des éditions, triés par date de suivi décroissante
 * (les plus récemment suivies en premier).
 * 
 * @param userId - Identifiant de l'utilisateur
 * @returns Promise avec le tableau des IDs d'éditions suivies
 */
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
    const { processExpiredPlannedPurchases } = await import("../profil/profil.service");
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
    totalSpent: Number.parseFloat(totals.total_spent as string),
    estimatedValue: estimatedValue,
    byMonth: monthsResult.rows.map((row) => ({
      month: row.month as string,
      totalSpent: Number.parseFloat(row.total_spent as string),
      cardCount: row.card_count as number,
    })),
  };
}
