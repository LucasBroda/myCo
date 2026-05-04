import { cache } from "../../config/redis";
import { searchEbayPrice } from "../../config/ebay";
import { MarketPrice, PokemonCard } from "../../types/models";
import { getCard, searchCards } from "../cards/cards.service";

const TTL_MARKET = 1800; // 30 minutes

/**
 * Fetch CardMarket price for a card via Pokémon TCG API data
 * The Pokémon TCG API includes cardmarket.prices and url on card objects.
 */
async function getCardMarketPrice(
  card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  const price = card.cardmarket?.prices?.averageSellPrice ?? null;
  // Use the URL provided by the API directly
  const url = card.cardmarket?.url ?? null;
  return { price, url };
}

/**
 * Fetch eBay price for a card using eBay Browse API
 * Returns average price from top listings and a direct search URL
 */
async function getEbayPrice(
  card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  return searchEbayPrice(card.name, card.set.name, card.number);
}

export async function compareCard(cardId: string): Promise<MarketPrice> {
  const cacheKey = `cache:market:compare:${cardId}`;
  const cached = await cache.get<MarketPrice>(cacheKey);
  if (cached) return cached;

  const card = await getCard(cardId);
  const [cm, ebay] = await Promise.all([
    getCardMarketPrice(card),
    getEbayPrice(card),
  ]);

  // Calculer la tendance sur 30 jours
  let percentChange30d: number | null = null;
  if (card.cardmarket?.prices) {
    const currentPrice = card.cardmarket.prices.trendPrice || card.cardmarket.prices.averageSellPrice;
    const avg30 = card.cardmarket.prices.avg30;
    if (currentPrice && avg30 && avg30 > 0) {
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

  await cache.set(cacheKey, result, TTL_MARKET);
  return result;
}

export async function searchMarket(
  query: string,
  setId?: string,
): Promise<Array<PokemonCard & { market: MarketPrice }>> {
  const cards = await searchCards(query, setId);

  const results = await Promise.all(
    cards.map(async (card) => {
      const market = await compareCard(card.id);
      return { ...card, market };
    }),
  );

  return results;
}

/**
 * Calculate deal score for CardMarket low price vs average
 */
function getCardMarketLowPriceDiscount(
  cmPrices:
    | { averageSellPrice: number; lowPrice: number; trendPrice: number }
    | undefined,
): number {
  if (!cmPrices?.lowPrice || !cmPrices?.averageSellPrice) return 0;

  const { lowPrice, averageSellPrice } = cmPrices;
  if (lowPrice >= averageSellPrice) return 0;

  const discount = ((averageSellPrice - lowPrice) / averageSellPrice) * 100;
  return discount >= 10 ? Math.round(discount) : 0;
}

/**
 * Calculate deal score for trending price
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

export async function getDeals(): Promise<
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
    searchQueries.map((query) => searchCards(query)),
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
      const market = await compareCard(card.id);
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
