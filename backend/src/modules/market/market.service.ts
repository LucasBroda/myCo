import { cache } from "../../config/redis";
import { MarketPrice, PokemonCard } from "../../types/models";
import { getCard, searchCards } from "../cards/cards.service";

const TTL_MARKET = 1800; // 30 minutes

/**
 * Fetch CardMarket price for a card via Pokémon TCG API data
 * The Pokémon TCG API includes cardmarket.prices on card objects.
 */
async function getCardMarketPrice(
  card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  const price = card.cardmarket?.prices?.averageSellPrice ?? null;
  const url = card.cardmarket
    ? `https://www.cardmarket.com/en/Pokemon/Products/Singles/${encodeURIComponent(card.set.name)}/${encodeURIComponent(card.name)}`
    : null;
  return { price, url };
}

/**
 * eBay price is not available via official API without credentials.
 * Placeholder returns null — integrate with eBay Finding API when APP_ID is available.
 */
async function getEbayPrice(
  _card: PokemonCard,
): Promise<{ price: number | null; url: string | null }> {
  return { price: null, url: null };
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

  const result: MarketPrice = {
    cardId,
    cardMarketPrice: cm.price,
    ebayPrice: ebay.price,
    cardMarketUrl: cm.url,
    ebayUrl: ebay.url,
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

export async function getDeals(): Promise<
  Array<PokemonCard & { market: MarketPrice; discountPercent: number }>
> {
  const cacheKey = "cache:market:deals";
  const cached =
    await cache.get<
      Array<PokemonCard & { market: MarketPrice; discountPercent: number }>
    >(cacheKey);
  if (cached) return cached;

  // Fetch recently released sets (first 2 pages, most recent cards)
  const cards = await searchCards("Charizard");
  const withPrices = await Promise.all(
    cards.map(async (card) => {
      const market = await compareCard(card.id);
      return { ...card, market };
    }),
  );

  const deals = withPrices
    .filter(
      (c) => c.market.cardMarketPrice !== null && c.market.cardMarketPrice > 0,
    )
    .map((c) => {
      const avgPrice =
        c.cardmarket?.prices?.trendPrice ?? c.market.cardMarketPrice!;
      const currentPrice = c.market.cardMarketPrice!;
      const discountPercent = Math.round(
        ((avgPrice - currentPrice) / avgPrice) * 100,
      );
      return { ...c, discountPercent };
    })
    .filter((c) => c.discountPercent > 5)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 20);

  await cache.set(cacheKey, deals, TTL_MARKET);
  return deals;
}
