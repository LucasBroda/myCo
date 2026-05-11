/**\n * Service de profil utilisateur\n * \n * G\u00e8re les achats planifi\u00e9s (wishlist) avec transfert automatique vers la collection.\n * \n * Fonctionnalit\u00e9 cl\u00e9 : lorsque la date planifi\u00e9e est atteinte, l'achat est automatiquement\n * transf\u00e9r\u00e9 vers la collection comme si la carte avait \u00e9t\u00e9 acquise.\n */\n\nimport { db } from \"../../config/db\";\nimport { PlannedPurchase } from \"../../types/models\";\nimport * as collectionService from \"../collection/collection.service\";\n\n/**\n * Traite les achats planifi\u00e9s expir\u00e9s (transfert automatique)\n * \n * Pour chaque achat dont la date planifi\u00e9e est atteinte ou d\u00e9pass\u00e9e :\n * 1. Ajoute la carte \u00e0 la collection avec la date planifi\u00e9e comme date d'acquisition\n * 2. Utilise le budget comme prix pay\u00e9\n * 3. Supprime l'achat planifi\u00e9\n * \n * Appel\u00e9 automatiquement lors de getPlanned() pour maintenir la coh\u00e9rence.\n * \n * @param userId - ID de l'utilisateur\n * @throws Ne propage pas les erreurs pour continuer le traitement des autres achats\n */\nexport async function processExpiredPlannedPurchases(userId: string): Promise<void> {\n  const today = new Date();\n  today.setHours(0, 0, 0, 0); // Minuit pour comparer uniquement les dates\n  \n  // R\u00e9cup\u00e8re tous les achats dont la date est \u00e9chue\n  const result = await db.query(\n    `SELECT id, user_id, card_id, set_id, card_name, set_name, planned_date, budget, condition, notes, created_at\n     FROM planned_purchases \n     WHERE user_id = $1 AND planned_date <= $2\n     ORDER BY planned_date ASC`,\n    [userId, today.toISOString()],\n  );\n  \n  const expiredPurchases = result.rows;\n  \n  // Traite chaque achat expir\u00e9\n  for (const purchase of expiredPurchases) {\n    try {\n      // Ajoute la carte \u00e0 la collection\n      // Date d'acquisition = date planifi\u00e9e\n      // Prix pay\u00e9 = budget planifi\u00e9\n      await collectionService.addCard(\n        purchase.user_id as string,\n        purchase.card_id as string,\n        purchase.set_id as string,\n        purchase.planned_date as string,\n        purchase.budget ? Number.parseFloat(purchase.budget) : null,\n        purchase.condition as import(\"../../types/models\").CardCondition,\n      );\n      \n      // Supprime l'achat planifi\u00e9 maintenant qu'il est dans la collection\n      await db.query(\n        \"DELETE FROM planned_purchases WHERE id = $1\",\n        [purchase.id],\n      );\n      \n      console.log(`Transferred planned purchase ${purchase.id} to collection for user ${userId}`);\n    } catch (error) {\n      console.error(`Failed to transfer planned purchase ${purchase.id}:`, error);\n      // Continue avec les autres achats m\u00eame si un \u00e9choue\n      // Permet un traitement partiel plut\u00f4t qu'un \u00e9chec total\n    }\n  }\n}

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
