import { config } from "dotenv";

config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number.parseInt(optional("PORT", "5000"), 10),
  databaseUrl: required("DATABASE_URL"),
  redisUrl: optional("REDIS_URL", "redis://localhost:6379"),
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),
  pokemonTcgApiKey: optional("POKEMON_TCG_API_KEY", ""),
  cardmarketAppToken: optional("CARDMARKET_APP_TOKEN", ""),
  ebayClientId: optional("EBAY_CLIENT_ID", ""),
  ebayClientSecret: optional("EBAY_CLIENT_SECRET", ""),
  ebayMarketplace: optional("EBAY_MARKETPLACE", "EBAY_US"),
  nodeEnv: optional("NODE_ENV", "development"),
};
