/**
 * Service de gestion des cartes Pokémon
 * 
 * Intègre l'API Pokémon TCG pour récupérer les informations sur les cartes et éditions.
 * Utilise un système de cache pour optimiser les performances et réduire les appels API.
 */

import { env } from "../../config/env";
import { cache } from "../../config/redis";
import { PokemonCard, PokemonSet } from "../../types/models";

// URL de base de l'API Pokémon TCG (version 2)
const BASE_URL = "https://api.pokemontcg.io/v2";

/**
 * Durées de vie (TTL - Time To Live) du cache en secondes
 * 
 * - sets: 24h (les éditions changent rarement)
 * - set: 24h (les détails d'édition sont stables)
 * - card: 12h (les infos de carte peuvent évoluer plus fréquemment)
 */
const TTL = {
  sets: 86400,  // 24 heures
  set: 86400,   // 24 heures
  card: 43200,  // 12 heures
};

/**
 * Génère les en-têtes HTTP pour les requêtes API
 * 
 * Ajoute la clé API si disponible (permet des limites de taux plus élevées).
 * 
 * @returns Objet contenant les en-têtes HTTP
 */
function headers(): Record<string, string> {
  return env.pokemonTcgApiKey ? { "X-Api-Key": env.pokemonTcgApiKey } : {};
}

/**
 * Effectue une requête fetch et parse le JSON
 * 
 * Fonction utilitaire qui gère les erreurs HTTP et convertit la réponse en JSON.
 * 
 * @template T - Type de la réponse attendue
 * @param url - URL complète à appeler
 * @returns Promise résolue avec les données JSON
 * @throws Error avec le code de statut HTTP si la requête échoue
 */
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

/**
 * Récupère toutes les éditions Pokémon TCG
 * 
 * Retourne la liste complète des éditions (sets) triées par date de sortie décroissante.
 * Le résultat est mis en cache pour 24h pour éviter les appels répétés.
 * 
 * @returns Promise résolue avec le tableau des éditions
 */
export async function obtenirEditions(): Promise<PokemonSet[]> {
  const cacheKey = "cache:sets:all";
  const cached = await cache.get<PokemonSet[]>(cacheKey);
  if (cached) return cached;

  // Appel API avec tri par date de sortie et limite de 250 résultats
  const data = await fetchJson<{ data: PokemonSet[] }>(
    `${BASE_URL}/sets?orderBy=-releaseDate&pageSize=250`,
  );
  
  // Met en cache pour 24 heures
  await cache.set(cacheKey, data.data, TTL.sets);
  return data.data;
}

/**
 * Récupère les détails d'une édition et toutes ses cartes
 * 
 * Effectue deux requêtes en parallèle (Promise.all) pour optimiser les performances :
 * 1. Informations de l'édition (nom, logo, date de sortie, etc.)
 * 2. Liste de toutes les cartes de l'édition triées par numéro
 * 
 * @param setId - Identifiant unique de l'édition (ex: "base1")
 * @returns Promise avec l'objet édition et le tableau de ses cartes
 */
export async function obtenirEdition(setId: string): Promise<{
  set: PokemonSet;
  cards: PokemonCard[];
}> {
  const cacheKey = `cache:set:${setId}`;
  const cached = await cache.get<{ set: PokemonSet; cards: PokemonCard[] }>(
    cacheKey,
  );
  if (cached) return cached;

  // Requêtes parallèles pour optimiser le temps de réponse
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

/**
 * Récupère les détails complets d'une carte spécifique
 * 
 * @param cardId - Identifiant unique de la carte (ex: "base1-4")
 * @returns Promise résolue avec l'objet carte complet (image, HP, attaques, etc.)
 */
export async function obtenirCarte(cardId: string): Promise<PokemonCard> {
  const cacheKey = `cache:card:${cardId}`;
  const cached = await cache.get<PokemonCard>(cacheKey);
  if (cached) return cached;

  const data = await fetchJson<{ data: PokemonCard }>(
    `${BASE_URL}/cards/${cardId}`,
  );
  await cache.set(cacheKey, data.data, TTL.card);
  return data.data;
}

/**
 * Recherche de cartes par mots-clés multi-critères
 * 
 * Effectue une recherche dans plusieurs champs :
 * - Nom de la carte (name)
 * - Numéro de la carte (number)
 * - Nom de l'édition (set.name)
 * - Nom de l'artiste (artist)
 * 
 * Les wildcards (*) permettent une recherche partielle (ex: "Char*" trouve "Charizard").
 * 
 * @param query - Terme de recherche (ex: "Charizard")
 * @param setId - (Optionnel) Limite la recherche à une édition spécifique
 * @returns Promise avec le tableau des cartes correspondantes (max 50)
 */
export async function rechercherCartes(
  query: string,
  setId?: string,
): Promise<PokemonCard[]> {
  // Construit une requête OR multi-critères
  let q = `(name:"*${query}*" OR number:"*${query}*" OR set.name:"*${query}*" OR artist:"*${query}*")`;
  
  // Ajoute un filtre sur l'édition si fourni
  if (setId) q += ` set.id:${setId}`;

  const cacheKey = `cache:search:${q}`;
  const cached = await cache.get<PokemonCard[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJson<{ data: PokemonCard[] }>(
    `${BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=50`,
  );
  
  // Cache court (30 minutes) car les résultats de recherche peuvent varier
  await cache.set(cacheKey, data.data, 1800);
  return data.data;
}
