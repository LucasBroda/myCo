/**
 * Service de marché
 * 
 * Fournit les fonctionnalités de marché en combinant :
 * - Prix Cardmarket (issus de l'API Pokémon TCG)
 * - Prix eBay (via l'API eBay Browse)
 * 
 * Calcule les opportunités d'achat et les tendances de prix.
 * Cache les données pendant 30 minutes pour optimiser les performances.
 */

import { cache } from "../../config/redis";
import { searchEbayPrice } from "../../config/ebay";
import { MarketPrice, PokemonCard } from "../../types/models";
import { obtenirCarte, rechercherCartes } from "../cartes/cartes.service";

/**
 * Durée de cache pour les données de marché : 30 minutes
 * Plus court que les cartes car les prix fluctuent plus rapidement
 */
const TTL_MARKET = 1800; // 30 minutes en secondes

/**
 * Récupère le prix Cardmarket d'une carte
 * 
 * Les données Cardmarket sont directement incluses dans l'objet carte
 * retourné par l'API Pokémon TCG (card.cardmarket).
 * 
 * @param card - Carte Pokémon avec données Cardmarket optionnelles
 * @returns Prix moyen de vente et URL Cardmarket (null si indisponible)
 */
async function getCardMarketPrice(
  card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  // Prix moyen de vente sur Cardmarket
  const price = card.cardmarket?.prices?.averageSellPrice ?? null;
  // URL directe vers la carte sur Cardmarket
  const url = card.cardmarket?.url ?? null;
  return { price, url };
}

/**
 * Récupère le prix eBay d'une carte
 * 
 * Utilise l'API eBay Browse pour rechercher la carte et calculer
 * le prix moyen des 10 meilleurs Buy It Now.
 * 
 * @param card - Carte Pokémon
 * @returns Prix moyen eBay et URL de recherche (null si indisponible)
 */
async function getEbayPrice(
  card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  return searchEbayPrice(card.name, card.set.name, card.number);
}

/**
 * Compare les prix d'une carte sur Cardmarket et eBay
 * 
 * Calcule également la tendance de prix sur 30 jours Cardmarket.
 * Les données sont cachées pendant 30 minutes.
 * 
 * @param cardId - ID de la carte à comparer
 * @returns Objet MarketPrice avec prix, URLs et tendance
 */
export async function comparerCarte(cardId: string): Promise<MarketPrice> {
  const cacheKey = `cache:market:compare:${cardId}`;
  const cached = await cache.get<MarketPrice>(cacheKey);
  if (cached) return cached;

  // Récupération parallèle de la carte et des prix
  const card = await obtenirCarte(cardId);
  const [cm, ebay] = await Promise.all([
    getCardMarketPrice(card),
    getEbayPrice(card),
  ]);

  // Calcul de la tendance sur 30 jours (pourcentage de variation)
  let percentChange30d: number | null = null;
  if (card.cardmarket?.prices) {
    // Prix actuel (trend ou average)
    const currentPrice = card.cardmarket.prices.trendPrice || card.cardmarket.prices.averageSellPrice;
    const avg30 = card.cardmarket.prices.avg30; // Moyenne sur 30 jours
    
    if (currentPrice && avg30 && avg30 > 0) {
      // Calcul du pourcentage : ((actuel - moyenne) / moyenne) * 100
      percentChange30d = ((currentPrice - avg30) / avg30) * 100;
    }
  }

  const result: MarketPrice = {
    cardId,
    cardMarketPrice: cm.price,
    ebayPrice: ebay.price,
    cardMarketUrl: cm.url,
    ebayUrl: ebay.url,
    percentChange30d,
    fetchedAt: new Date().toISOString(),
  };

  // Cache pendant 30 minutes
  await cache.set(cacheKey, result, TTL_MARKET);
  return result;
}

/**
 * Recherche de cartes avec enrichissement des données de marché
 * 
 * Pour chaque carte trouvée, ajoute les informations de prix Cardmarket et eBay.
 * 
 * @param query - Terme de recherche
 * @param setId - ID de l'édition (optionnel)
 * @returns Tableau de cartes avec données de marché enrichies
 */
export async function rechercherMarche(
  query: string,
  setId?: string,
): Promise<Array<PokemonCard & { market: MarketPrice }>> {
  // Recherche des cartes correspondantes
  const cards = await rechercherCartes(query, setId);

  // Enrichissement parallèle avec les données de marché
  const results = await Promise.all(
    cards.map(async (card) => {
      const market = await comparerCarte(card.id);
      return { ...card, market };
    }),
  );

  return results;
}

/**
 * Calcule le pourcentage de remise entre le prix bas et le prix moyen Cardmarket
 * 
 * Utilisé pour identifier les bonnes affaires sur Cardmarket.
 * Retourne 0 si la remise est inférieure à 10% (pas assez intéressant).
 * 
 * @param cmPrices - Objet prix Cardmarket avec lowPrice et averageSellPrice
 * @returns Pourcentage de remise arrondi (minimum 10% pour être retourné)
 */
function getCardMarketLowPriceDiscount(
  cmPrices:
    | { averageSellPrice: number; lowPrice: number; trendPrice: number }
    | undefined,
): number {
  if (!cmPrices?.lowPrice || !cmPrices?.averageSellPrice) return 0;

  const { lowPrice, averageSellPrice } = cmPrices;
  
  // Pas de remise si le prix bas est supérieur ou égal à la moyenne
  if (lowPrice >= averageSellPrice) return 0;

  // Calcul du pourcentage de remise
  const discount = ((averageSellPrice - lowPrice) / averageSellPrice) * 100;
  
  // Retourne la remise uniquement si elle est >= 10%
  return discount >= 10 ? Math.round(discount) : 0;
}

/**
 * Calcule le score de tendance de prix
 */
function getTrendingPriceDiscount(
  cmPrices:
    | { averageSellPrice: number; lowPrice: number; trendPrice: number }
    | undefined,
): number {
  if (!cmPrices?.trendPrice || !cmPrices?.averageSellPrice) return 0;

  const { trendPrice, averageSellPrice } = cmPrices;
  if (averageSellPrice >= trendPrice) return 0;

  const discount = ((trendPrice - averageSellPrice) / trendPrice) * 100;
  return discount >= 8 ? Math.round(discount) : 0;
}

/**
 * Calculate deal score comparing eBay vs CardMarket
 */
function getMarketplaceDiscount(market: MarketPrice): number {
  const { ebayPrice, cardMarketPrice } = market;
  if (!ebayPrice || !cardMarketPrice || ebayPrice <= 0 || cardMarketPrice <= 0)
    return 0;

  // eBay is significantly cheaper
  if (ebayPrice < cardMarketPrice * 0.85) {
    return Math.round(((cardMarketPrice - ebayPrice) / cardMarketPrice) * 100);
  }

  // CardMarket is significantly cheaper
  if (cardMarketPrice < ebayPrice * 0.85) {
    return Math.round(((ebayPrice - cardMarketPrice) / ebayPrice) * 100);
  }

  return 0;
}

/**
 * Calculate deal score for a card based on multiple pricing factors
 * Returns a percentage discount score where higher is better
 */
function calculateDealScore(card: PokemonCard, market: MarketPrice): number {
  const cmPrices = card.cardmarket?.prices;

  // Try each pricing strategy in priority order
  const lowPriceDiscount = getCardMarketLowPriceDiscount(cmPrices);
  if (lowPriceDiscount > 0) return lowPriceDiscount;

  const trendDiscount = getTrendingPriceDiscount(cmPrices);
  if (trendDiscount > 0) return trendDiscount;

  return getMarketplaceDiscount(market);
}

export async function obtenirBonnesAffaires(): Promise<
  Array<PokemonCard & { market: MarketPrice; discountPercent: number }>
> {
  const cacheKey = "cache:market:deals";
  const cached =
    await cache.get<
      Array<PokemonCard & { market: MarketPrice; discountPercent: number }>
    >(cacheKey);
  if (cached) return cached;

  // Search for popular Pokemon across different categories to find varied deals
  const searchQueries = [
    "Charizard",
    "Pikachu",
    "Mewtwo",
    "Lugia",
    "Rayquaza",
    "Umbreon",
  ];

  // Fetch cards from multiple searches in parallel
  const allCardsArrays = await Promise.all(
    searchQueries.map((query) => rechercherCartes(query)),
  );

  // Flatten and deduplicate cards by ID
  const uniqueCards = Array.from(
    new Map(
      allCardsArrays.flat().map((card) => [card.id, card]),
    ).values(),
  );

  // Limit to 100 cards to avoid too many API calls
  const cardsToAnalyze = uniqueCards.slice(0, 100);

  // Fetch market prices for all cards
  const withPrices = await Promise.all(
    cardsToAnalyze.map(async (card) => {
      const market = await comparerCarte(card.id);
      return { ...card, market };
    }),
  );

  // Calculate deal scores and filter
  const deals = withPrices
    .map((c) => {
      const discountPercent = calculateDealScore(c, c.market);
      return { ...c, discountPercent };
    })
    .filter(
      (c) =>
        c.discountPercent >= 10 && // At least 10% discount to be considered a deal
        (c.market.cardMarketPrice !== null || c.market.ebayPrice !== null), // Must have at least one price
    )
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 20);

  await cache.set(cacheKey, deals, TTL_MARKET);
  return deals;
}
