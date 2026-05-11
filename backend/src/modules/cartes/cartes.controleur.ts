/**
 * Contrôleur pour l'API Pokémon TCG
 * 
 * Gère les endpoints HTTP pour récupérer les données de cartes :
 * - GET /api/cartes/collections - Liste toutes les éditions
 * - GET /api/cartes/collections/:setId - Détails d'une édition avec ses cartes
 * - GET /api/cartes/:cardId - Détails d'une carte
 * - GET /api/cartes/recherche?q=xxx&set=yyy - Recherche de cartes
 * 
 * Toutes les données proviennent de l'API Pokémon TCG via le service cartes.service.ts
 * qui implémente un cache Redis pour optimiser les performances.
 */

import { Request, Response } from "express";
import { getCard, getSet, getSets, searchCards } from "./cartes.service";

/**
 * Handler pour récupérer toutes les éditions
 * 
 * Retourne jusqu'à 250 éditions triées par date de sortie décroissante.
 * Les données sont cachées pendant 24h.
 * 
 * @param _req - Requête Express (non utilisée)
 * @param res - Réponse Express
 * @returns 200 avec { data: PokemonSet[] }
 */
export async function getSetsHandler(
  _req: Request,
  res: Response,
): Promise<void> {
  const sets = await getSets();
  res.json({ data: sets });
}

/**
 * Handler pour récupérer une édition et toutes ses cartes
 * 
 * Utilise Promise.all côté service pour optimiser les requêtes parallèles.
 * Les données sont cachées pendant 24h (set) et 12h (cartes).
 * 
 * @param req - Requête Express avec params.setId
 * @param res - Réponse Express
 * @returns 200 avec { set: PokemonSet, cards: PokemonCard[] }
 */
export async function getSetHandler(
  req: Request<{ setId: string }>,
  res: Response,
): Promise<void> {
  const { setId } = req.params;
  const result = await getSet(setId);
  res.json(result);
}

/**
 * Handler pour récupérer les détails d'une carte
 * 
 * Retourne toutes les informations de la carte (images, prix Cardmarket si disponibles, etc.).
 * Les données sont cachées pendant 12h.
 * 
 * @param req - Requête Express avec params.cardId
 * @param res - Réponse Express
 * @returns 200 avec { data: PokemonCard }
 */
export async function getCardHandler(
  req: Request<{ cardId: string }>,
  res: Response,
): Promise<void> {
  const { cardId } = req.params;
  const card = await getCard(cardId);
  res.json({ data: card });
}

/**
 * Handler pour la recherche de cartes
 * 
 * Recherche par nom de carte ou Pokémon avec possibilité de filtrer par édition.
 * Utilise des wildcards (*) pour les recherches partielles.
 * 
 * Query params :
 * - q (requis) : terme de recherche (minimum 2 caractères)
 * - set (optionnel) : ID de l'édition pour filtrer
 * 
 * @param req - Requête Express avec query { q, set }
 * @param res - Réponse Express
 * @returns 200 avec { data: PokemonCard[] } ou 400 si query invalide
 * @example
 * GET /api/cartes/recherche?q=Pikachu
 * GET /api/cartes/recherche?q=Charizard&set=base1
 */
export async function searchHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { q, set } = req.query as { q?: string; set?: string };
  
  // Validation : la recherche doit contenir au moins 2 caractères
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }
  
  // Recherche avec trim pour enlever les espaces inutiles
  const cards = await searchCards(q.trim(), set);
  res.json({ data: cards });
}
