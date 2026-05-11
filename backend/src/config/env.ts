/**
 * Configuration des variables d'environnement de l'application
 * 
 * Ce fichier centralise la gestion des variables d'environnement en utilisant dotenv
 * pour charger les variables depuis un fichier .env et les rendre accessibles dans toute l'application.
 */

import { config } from "dotenv";

// Charge les variables d'environnement depuis le fichier .env
config();

/**
 * Récupère une variable d'environnement obligatoire
 * 
 * @param name - Le nom de la variable d'environnement à récupérer
 * @returns La valeur de la variable d'environnement
 * @throws Error si la variable n'est pas définie (pour éviter les erreurs runtime)
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Récupère une variable d'environnement optionnelle avec une valeur par défaut
 * 
 * @param name - Le nom de la variable d'environnement
 * @param fallback - La valeur par défaut si la variable n'est pas définie
 * @returns La valeur de la variable ou la valeur par défaut
 */
function optional(name: string, fallback: string): string {
  // Utilise l'opérateur de coalescence nulle (??) pour retourner la valeur ou le fallback
  return process.env[name] ?? fallback;
}

/**
 * Objet centralisé contenant toutes les variables d'environnement de l'application
 * 
 * Cette structure permet d'avoir un accès typé et sécurisé aux configurations,
 * avec validation au démarrage pour les variables obligatoires.
 */
export const env = {
  // Port sur lequel le serveur Express écoute
  port: Number.parseInt(optional("PORT", "5000"), 10),
  
  // URL de connexion à la base de données PostgreSQL (obligatoire)
  databaseUrl: required("DATABASE_URL"),
  
  // URL de connexion au serveur Redis pour le cache (optionnel, fallback en mémoire)
  redisUrl: optional("REDIS_URL", "redis://localhost:6379"),
  
  // Secret JWT pour les tokens d'accès (courte durée de vie)
  accessTokenSecret: required("ACCESS_TOKEN_SECRET"),
  
  // Secret JWT pour les tokens de rafraîchissement (longue durée de vie)
  refreshTokenSecret: required("REFRESH_TOKEN_SECRET"),
  
  // Clé API pour accéder à l'API Pokemon TCG
  pokemonTcgApiKey: optional("POKEMON_TCG_API_KEY", ""),
  
  // Token d'application pour l'API Cardmarket
  cardmarketAppToken: optional("CARDMARKET_APP_TOKEN", ""),
  
  // Identifiant client OAuth pour l'API eBay
  ebayClientId: optional("EBAY_CLIENT_ID", ""),
  
  // Secret client OAuth pour l'API eBay
  ebayClientSecret: optional("EBAY_CLIENT_SECRET", ""),
  
  // Marketplace eBay à utiliser (EBAY_US, EBAY_FR, etc.)
  ebayMarketplace: optional("EBAY_MARKETPLACE", "EBAY_US"),
  
  // Environnement d'exécution (development, production, test)
  nodeEnv: optional("NODE_ENV", "development"),
};
