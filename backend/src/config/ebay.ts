import { env } from "./env";
import { cache } from "./redis";

interface EbayTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface EbayItemSummary {
  itemId: string;
  title: string;
  price: {
    value: string;
    currency: string;
  };
  itemWebUrl: string;
  condition?: string;
  buyingOptions?: string[];
}

interface EbaySearchResponse {
  total: number;
  itemSummaries?: EbayItemSummary[];
  warnings?: Array<{ message: string }>;
}

const EBAY_TOKEN_CACHE_KEY = "ebay:oauth:token";
const EBAY_API_BASE_URL = "https://api.ebay.com";
const EBAY_OAUTH_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const POKEMON_CATEGORY_ID = "183454"; // Pokémon Individual Cards

/**
 * Get eBay OAuth access token (cached for 1 hour)
 */
async function getAccessToken(): Promise<string> {
  // Check cache first
  const cached = await cache.get<string>(EBAY_TOKEN_CACHE_KEY);
  if (cached) {
    return cached;
  }

  // If no credentials configured, return empty token
  if (!env.ebayClientId || !env.ebayClientSecret) {
    console.warn("eBay credentials not configured");
    return "";
  }

  try {
    // Request new token
    const credentials = Buffer.from(
      `${env.ebayClientId}:${env.ebayClientSecret}`,
    ).toString("base64");

    const response = await fetch(EBAY_OAUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope",
    });

    if (!response.ok) {
      throw new Error(`eBay OAuth failed: ${response.statusText}`);
    }

    const data: EbayTokenResponse = await response.json();

    // Cache token for 55 minutes (expires in 60, but refresh early)
    await cache.set(EBAY_TOKEN_CACHE_KEY, data.access_token, 3300);

    return data.access_token;
  } catch (error) {
    console.error("Failed to get eBay access token:", error);
    return "";
  }
}

/**
 * Search for a Pokémon card on eBay and return average price + URL
 */
export async function searchEbayPrice(
  cardName: string,
  setName: string,
  cardNumber: string,
): Promise<{ price: number | null; url: string | null }> {
  const token = await getAccessToken();

  // If no token, generate fallback search URL
  if (!token) {
    const searchQuery = `${cardName} ${setName} ${cardNumber} Pokemon Card`;
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
    return { price: null, url };
  }

  try {
    // Build search query
    const searchQuery = `${cardName} ${setName} ${cardNumber}`;
    const params = new URLSearchParams({
      q: searchQuery,
      category_ids: POKEMON_CATEGORY_ID,
      limit: "50",
      filter: "buyingOptions:{FIXED_PRICE}", // Only Buy It Now listings
    });

    const response = await fetch(
      `${EBAY_API_BASE_URL}/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": env.ebayMarketplace,
          "X-EBAY-C-ENDUSERCTX":
            "contextualLocation=country=US,zip=10001", // Default location
        },
      },
    );

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.statusText}`);
    }

    const data: EbaySearchResponse = await response.json();

    // If no results, return search URL
    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      const fallbackUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
      return { price: null, url: fallbackUrl };
    }

    // Calculate average price from top 10 results
    const prices = data.itemSummaries
      .slice(0, 10)
      .map((item) => Number.parseFloat(item.price.value))
      .filter((p) => !Number.isNaN(p) && p > 0);

    if (prices.length === 0) {
      return {
        price: null,
        url: data.itemSummaries[0].itemWebUrl,
      };
    }

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    return {
      price: Math.round(avgPrice * 100) / 100, // Round to 2 decimals
      url: data.itemSummaries[0].itemWebUrl,
    };
  } catch (error) {
    console.error("eBay search error:", error);

    // Return fallback search URL on error
    const searchQuery = `${cardName} ${setName} ${cardNumber} Pokemon Card`;
    const fallbackUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQuery)}&_sacat=${POKEMON_CATEGORY_ID}`;
    return { price: null, url: fallbackUrl };
  }
}
