/**
 * Configuration et utilitaires pour l'intégration de l'API eBay
 * 
 * Ce module gère l'authentification OAuth avec eBay et fournit des fonctions
 * pour rechercher des cartes Pokémon et récupérer les prix moyens du marché.
 */

import { env } from "./env";
import { cache } from "./redis";

/**
 * Réponse de l'API OAuth eBay lors de la récupération d'un token d'accès
 */
interface EbayTokenResponse {
  access_token: string;  // Token JWT à utiliser dans les requêtes API
  expires_in: number;    // Durée de vie du token en secondes (généralement 7200 = 2h)
  token_type: string;    // Type de token (toujours "Bearer")
}

/**
 * Résumé d'un article eBay retourné par l'API Browse
 */
interface EbayItemSummary {
  itemId: string;       // Identifiant unique de l'article
  title: string;        // Titre de l'annonce
  price: {
    value: string;      // Prix sous forme de chaîne (ex: "25.99")
    currency: string;   // Code devise ISO (ex: "USD", "EUR")
  };
  itemWebUrl: string;   // URL de l'article sur eBay.com
  condition?: string;   // État de la carte (ex: "New", "Used")
  buyingOptions?: string[]; // Options d'achat (ex: ["FIXED_PRICE", "AUCTION"])
}

/**
 * Réponse de l'API eBay Browse pour une recherche d'articles
 */
interface EbaySearchResponse {
  total: number;                         // Nombre total de résultats trouvés
  itemSummaries?: EbayItemSummary[];    // Tableau des articles (limité par le paramètre limit)
  warnings?: Array<{ message: string }>; // Avertissements éventuels de l'API
}

// Clé de cache Redis pour le token OAuth eBay
const EBAY_TOKEN_CACHE_KEY = "ebay:oauth:token";

// URL de base de l'API eBay
const EBAY_API_BASE_URL = "https://api.ebay.com";

// URL d'authentification OAuth 2.0 eBay
const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";

// ID de catégorie eBay pour les cartes Pokémon individuelles
const POKEMON_CATEGORY_ID = "183454";

/**
 * Récupère un token d'accès OAuth eBay (avec mise en cache d'1 heure)
 * 
 * Cette fonction implémente le flux OAuth 2.0 Client Credentials Grant.
 * Le token est mis en cache dans Redis pour éviter de faire trop de requêtes d'authentification.
 * 
 * Flux OAuth :
 * 1. Vérifie si un token valide existe en cache
 * 2. Si non, encode les credentials en Base64
 * 3. Fait une requête POST à l'API OAuth avec les credentials
 * 4. Met en cache le token reçu pour 55 minutes (sur 60 de validité)
 * 
 * @returns Promise résolue avec le token d'accès, ou chaîne vide si non configuré/erreur
 */
async function getAccessToken(): Promise<string> {
  // Vérifie d'abord le cache
  const cached = await cache.get<string>(EBAY_TOKEN_CACHE_KEY);
  if (cached) {
    return cached;
  }

  // Si les identifiants eBay ne sont pas configurés, retourne un token vide
  if (!env.ebayClientId || !env.ebayClientSecret) {
    console.warn("eBay credentials not configured");
    return "";
  }

  try {
    // Encode les credentials au format Base64 pour l'en-tête Authorization
    // Format: "clientId:clientSecret" -> Base64
    const credentials = Buffer.from(
      `${env.ebayClientId}:${env.ebayClientSecret}`,
    ).toString("base64");

    // Requête OAuth avec le grant type "client_credentials"
    const response = await fetch(EBAY_OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`, // Basic Auth avec credentials Base64
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    });

    if (!response.ok) {
      throw new Error(`eBay OAuth failed: ${response.statusText}`);
    }

    const data = (await response.json()) as EbayTokenResponse;

    // Met en cache le token pour 55 minutes (expiration à 60 min, mais on rafraîchit avant)
    // Cela évite les problèmes de tokens expirés lors de l'utilisation
    await cache.set(EBAY_TOKEN_CACHE_KEY, data.access_token, 3300);

    return data.access_token;
  } catch (error) {
    console.error("Failed to get eBay access token:", error);
    return "";
  }
}

/**
 * Recherche une carte Pokémon sur eBay et retourne le prix moyen + l'URL
 * 
 * Cette fonction :
 * 1. Authentifie avec OAuth eBay
 * 2. Recherche la carte avec les critères fournis
 * 3. Calcule le prix moyen des 10 premiers résultats "Buy It Now"
 * 4. Retourne le prix et l'URL du premier résultat
 * 
 * Si eBay n'est pas configuré ou qu'une erreur survient, retourne une URL
 * de recherche manuelle sans prix.
 * 
 * @param cardName - Nom de la carte (ex: "Charizard")
 * @param setName - Nom de l'édition (ex: "Base Set")
 * @param cardNumber - Numéro de la carte dans l'édition (ex: "4")
 * @returns Promise avec le prix moyen (ou null) et l'URL de recherche/article
 */
export async function searchEbayPrice(
  cardName: string,
  setName: string,
  cardNumber: string,
): Promise<{ price: number | null; url: string | null }> {
  const token = await getAccessToken();

  // Si pas de token, génère une URL de recherche manuelle comme fallback
  if (!token) {
    const searchQuery = `${cardName} ${setName} ${cardNumber} Pokemon Card`;
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
    return { price: null, url };
  }

  try {
    // Construit la requête de recherche
    const searchQuery = `${cardName} ${setName} ${cardNumber}`;
    const params = new URLSearchParams({
      q: searchQuery,
      category_ids: POKEMON_CATEGORY_ID,
      limit: "50", // Demande jusqu'à 50 résultats pour avoir plus de données
      filter: "buyingOptions:{FIXED_PRICE}", // Uniquement les annonces "Achat immédiat" (pas d'enchères)
    });

    // Appel à l'API Browse d'eBay
    const response = await fetch(
      `${EBAY_API_BASE_URL}/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": env.ebayMarketplace, // Marketplace (US, FR, etc.)
          "X-EBAY-C-ENDUSERCTX":
            "contextualLocation=country=US,zip=10001", // Localisation par défaut pour les prix
        },
      },
    );

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.statusText}`);
    }

    const data = (await response.json()) as EbaySearchResponse;

    // Si aucun résultat, retourne une URL de recherche manuelle
    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      const fallbackUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
      return { price: null, url: fallbackUrl };
    }

    // Calcule le prix moyen des 10 premiers résultats
    const prices = data.itemSummaries
      .slice(0, 10) // Prend les 10 premiers
      .map((item) => Number.parseFloat(item.price.value)) // Convertit les prix en nombres
      .filter((p) => !Number.isNaN(p) && p > 0); // Filtre les prix invalides

    // Si aucun prix valide, retourne l'URL du premier article sans prix
    if (prices.length === 0) {
      return {
        price: null,
        url: data.itemSummaries[0].itemWebUrl,
      };
    }

    // Calcule la moyenne arithmétique des prix
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      price: Math.round(avgPrice * 100) / 100, // Arrondit à 2 décimales
      url: data.itemSummaries[0].itemWebUrl,   // URL du premier résultat
    };
  } catch (error) {
    console.error("eBay search error:", error);

    // En cas d'erreur, retourne une URL de recherche manuelle comme fallback
    const searchQuery = `${cardName} ${setName} ${cardNumber} Pokemon Card`;
    const fallbackUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
    return { price: null, url: fallbackUrl };
  }
}
