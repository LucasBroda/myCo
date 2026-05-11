/**
 * Contrôleur du marché
 * 
 * Gère les endpoints HTTP pour les fonctionnalités de marché :
 * - GET /api/marche/recherche?q=xxx&set=yyy - Recherche avec prix eBay
 * - GET /api/marche/bonnes-affaires - Meilleures opportunités d'achat
 * - GET /api/marche/comparer/:cardId - Comparaison de prix pour une carte
 * 
 * Intègre les prix eBay (moyenne des 10 meilleurs Buy It Now) avec
 * les données de l'API Pokémon TCG.
 */

import { Request, Response } from "express";
import { compareCard, getDeals, searchMarket } from "./marche.service";

/**
 * Handler pour la recherche de cartes avec prix eBay
 * 
 * Recherche des cartes et enrichit chaque résultat avec le prix eBay moyen.
 * Similaire à searchCards mais avec données de marché.
 * 
 * Query params :
 * - q (requis) : terme de recherche (minimum 2 caractères)
 * - set (optionnel) : ID de l'édition pour filtrer
 * 
 * @param req - Requête Express avec query { q, set }
 * @param res - Réponse Express
 * @returns 200 avec { data: MarketCard[] } ou 400 si query invalide
 * @example
 * GET /api/marche/recherche?q=Charizard&set=base1
 */
export async function searchHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, set } = req.query as { q?: string; set?: string };
  
  // Validation : minimum 2 caractères pour la recherche
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }
  
  const results = await searchMarket(q.trim(), set);
  res.json({ data: results });
}

/**
 * Handler pour obtenir les meilleures affaires
 * 
 * Retourne les cartes avec le plus grand écart négatif entre
 * le prix Cardmarket et le prix eBay (opportunités d'achat).
 * 
 * @param _req - Requête Express (non utilisée)
 * @param res - Réponse Express
 * @returns 200 avec { data: DealCard[] } triées par remise décroissante
 */
export async function getDealsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const deals = await getDeals();
  res.json({ data: deals });
}

/**
 * Handler pour comparer les prix d'une carte
 * 
 * Retourne les prix Cardmarket et eBay pour une carte spécifique
 * avec calcul de la différence (opportunité ou surévaluation).
 * 
 * @param req - Requête Express avec params.cardId
 * @param res - Réponse Express
 * @returns 200 avec { data: MarketComparison }
 */
export async function compareHandler(
  req: Request<{ cardId: string }>,
  res: Response,
): Promise<void> {
  const { cardId } = req.params;
  const comparison = await compareCard(cardId);
  res.json({ data: comparison });
}
