import { db } from "../../config/db";
import { PlannedPurchase } from "../../types/models";
import * as collectionService from "../collection/collection.service";

/**
 * Transfère automatiquement les achats planifiés dont la date est atteinte vers la collection
 */
export async function processExpiredPlannedPurchases(userId: string): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Récupérer les achats planifiés dont la date est arrivée
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, condition, notes, created_at
     FROM planned_purchases 
     WHERE user_id = $1 AND planned_date <= $2
     ORDER BY planned_date ASC`,
    [userId, today.toISOString()],
  );
  
  const expiredPurchases = result.rows;
  
  // Pour chaque achat planifié expiré
  for (const purchase of expiredPurchases) {
    try {
      // Ajouter la carte à la collection avec la date d'achat planifiée comme date d'acquisition
      await collectionService.addCard(
        purchase.user_id as string,
        purchase.card_id as string,
        purchase.set_id as string,
        purchase.planned_date as string,
        purchase.budget ? Number.parseFloat(purchase.budget) : null,
        purchase.condition as import("../../types/models").CardCondition,
      );
      
      // Supprimer l'achat planifié
      await db.query(
        "DELETE FROM planned_purchases WHERE id = $1",
        [purchase.id],
      );
      
      console.log(`Transferred planned purchase ${purchase.id} to collection for user ${userId}`);
    } catch (error) {
      console.error(`Failed to transfer planned purchase ${purchase.id}:`, error);
      // Continue avec les autres achats même si un échoue
    }
  }
}

export async function getPlanned(userId: string): Promise<PlannedPurchase[]> {
  // Traiter automatiquement les achats planifiés expirés
  await processExpiredPlannedPurchases(userId);
  
  const result = await db.query(
    `SELECT id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, condition, notes, created_at
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
    condition: row.condition as import("../../types/models").CardCondition,
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
  condition: import("../../types/models").CardCondition;
  notes: string | null;
}): Promise<PlannedPurchase> {
  const { userId, cardId, setId, cardName, setName, plannedDate, budget, condition, notes } = params;
  const result = await db.query(
    `INSERT INTO planned_purchases (user_id, card_id, set_id, card_name, set_name, planned_date, budget, condition, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, condition, notes, created_at`,
    [userId, cardId, setId, cardName, setName, plannedDate, budget, condition, notes],
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
    condition: row.condition as import("../../types/models").CardCondition,
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
