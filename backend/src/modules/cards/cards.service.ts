import { env } from "../../config/env";
import { cache } from "../../config/redis";
import { PokemonCard, PokemonSet } from "../../types/models";

const BASE_URL = "https://api.pokemontcg.io/v2";

const TTL = {
  sets: 86400,
  set: 86400,
  card: 43200,
};

function headers(): Record<string, string> {
  return env.pokemonTcgApiKey ? { "X-Api-Key": env.pokemonTcgApiKey } : {};
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    const err = new Error(`Pokémon TCG API error: ${res.status}`) as Error & {
      status: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export async function getSets(): Promise<PokemonSet[]> {
  const cacheKey = "cache:sets:all";
  const cached = await cache.get<PokemonSet[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJson<{ data: PokemonSet[] }>(
    `${BASE_URL}/sets?orderBy=-releaseDate&pageSize=250`,
  );
  await cache.set(cacheKey, data.data, TTL.sets);
  return data.data;
}

export async function getSet(setId: string): Promise<{
  set: PokemonSet;
  cards: PokemonCard[];
}> {
  const cacheKey = `cache:set:${setId}`;
  const cached = await cache.get<{ set: PokemonSet; cards: PokemonCard[] }>(
    cacheKey,
  );
  if (cached) return cached;

  const [setData, cardsData] = await Promise.all([
    fetchJson<{ data: PokemonSet }>(`${BASE_URL}/sets/${setId}`),
    fetchJson<{ data: PokemonCard[] }>(
      `${BASE_URL}/cards?q=set.id:${setId}&pageSize=250&orderBy=number`,
    ),
  ]);

  const result = { set: setData.data, cards: cardsData.data };
  await cache.set(cacheKey, result, TTL.set);
  return result;
}

export async function getCard(cardId: string): Promise<PokemonCard> {
  const cacheKey = `cache:card:${cardId}`;
  const cached = await cache.get<PokemonCard>(cacheKey);
  if (cached) return cached;

  const data = await fetchJson<{ data: PokemonCard }>(
    `${BASE_URL}/cards/${cardId}`,
  );
  await cache.set(cacheKey, data.data, TTL.card);
  return data.data;
}

export async function searchCards(
  query: string,
  setId?: string,
): Promise<PokemonCard[]> {
  // Recherche multi-critères : nom, numéro, collection, artiste
  let q = `(name:"*${query}*" OR number:"*${query}*" OR set.name:"*${query}*" OR artist:"*${query}*")`;
  if (setId) q += ` set.id:${setId}`;

  const cacheKey = `cache:search:${q}`;
  const cached = await cache.get<PokemonCard[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJson<{ data: PokemonCard[] }>(
    `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=50`,
  );
  await cache.set(cacheKey, data.data, 1800);
  return data.data;
}
