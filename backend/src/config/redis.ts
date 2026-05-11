/**
 * Configuration du système de cache avec Redis et fallback en mémoire
 * 
 * Ce module fournit une couche d'abstraction pour le cache qui peut basculer automatiquement
 * entre Redis (distribué) et un cache en mémoire (local) si Redis est indisponible.
 * Cette approche garantit la résilience de l'application.
 */

import Redis from "ioredis";
import { env } from "./env";

/**
 * Interface représentant une entrée dans le cache mémoire
 */
interface CacheEntry {
  data: unknown; // Données stockées (type générique)
  expiresAt: number; // Timestamp d'expiration en millisecondes
}

/**
 * Cache de secours en mémoire locale (RAM)
 * 
 * Utilisé comme fallback si Redis n'est pas disponible.
 * Attention : ce cache est local à chaque instance du serveur et n'est pas partagé
 * entre plusieurs instances (contrairement à Redis qui est distribué).
 */
const memoryCache = new Map<string, CacheEntry>();

/**
 * Récupère une valeur du cache mémoire
 * 
 * @template T - Type de la donnée à récupérer
 * @param key - Clé d'identification de la donnée en cache
 * @returns La donnée si elle existe et n'a pas expiré, null sinon
 */
function memGet<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  
  // Vérifie si l'entrée a expiré
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key); // Nettoie l'entrée expirée
    return null;
  }
  return entry.data as T;
}

/**
 * Stocke une valeur dans le cache mémoire avec un TTL (Time To Live)
 * 
 * @param key - Clé d'identification de la donnée
 * @param value - Donnée à mettre en cache
 * @param ttlSeconds - Durée de vie en secondes avant expiration
 */
function memSet(key: string, value: unknown, ttlSeconds: number): void {
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000, // Convertit les secondes en millisecondes
  });
}

// Client Redis (null si non initialisé)
let redisClient: Redis | null = null;

// Flag indiquant si Redis est actuellement disponible et connecté
let useRedis = false;

/**
 * Initialise et retourne le client Redis (pattern Singleton)
 * 
 * Cette fonction crée un client Redis une seule fois et le réutilise pour toutes les opérations.
 * Elle configure également les gestionnaires d'événements pour gérer la disponibilité de Redis.
 * 
 * @returns L'instance du client Redis
 */
function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      lazyConnect: true, // Ne se connecte pas immédiatement (connexion à la demande)
      maxRetriesPerRequest: 1, // Une seule tentative par requête pour éviter les blocages
    });
    
    // En cas d'erreur Redis, bascule sur le cache mémoire
    redisClient.on("error", () => {
      useRedis = false;
    });
    
    // Quand Redis se connecte, active l'utilisation de Redis
    redisClient.on("connect", () => {
      useRedis = true;
    });
    
    // Tente de se connecter (en mode asynchrone)
    redisClient.connect().catch(() => {
      useRedis = false; // Si la connexion échoue, utilise le cache mémoire
    });
  }
  return redisClient;
}

/**
 * API publique du système de cache
 * 
 * Fournit une interface unifiée pour les opérations de cache,
 * avec basculement automatique entre Redis et le cache mémoire.
 */
export const cache = {
  /**
   * Récupère une valeur du cache
   * 
   * Tente d'abord de récupérer depuis Redis, puis depuis le cache mémoire en cas d'échec.
   * Cette stratégie de fallback garantit la disponibilité du service.
   * 
   * @template T - Type de la donnée attendue
   * @param key - Clé de la donnée
   * @returns Promise résolue avec la donnée ou null
   */
  async get<T>(key: string): Promise<T | null> {
    if (useRedis) {
      try {
        const raw = await getRedis().get(key);
        // Désérialise les données JSON stockées dans Redis
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        // En cas d'erreur Redis, bascule sur le cache mémoire
        return memGet<T>(key);
      }
    }
    return memGet<T>(key);
  },

  /**
   * Stocke une valeur dans le cache avec un TTL
   * 
   * @param key - Clé d'identification
   * @param value - Valeur à stocker (sera sérialisée en JSON pour Redis)
   * @param ttlSeconds - Durée de vie en secondes
   * @returns Promise résolue quand le stockage est terminé
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (useRedis) {
      try {
        // setex = SET avec EXpiration (commande atomique Redis)
        await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch {
        // Bascule vers le cache mémoire en cas d'erreur
      }
    }
    memSet(key, value, ttlSeconds);
  },

  /**
   * Supprime une valeur du cache
   * 
   * @param key - Clé de la donnée à supprimer
   * @returns Promise résolue quand la suppression est terminée
   */
  async del(key: string): Promise<void> {
    // Supprime du cache mémoire
    memoryCache.delete(key);
    
    // Tente de supprimer de Redis (si disponible)
    if (useRedis) {
      try {
        await getRedis().del(key);
      } catch {
        // Ignore les erreurs de suppression Redis
      }
    }
  },
};
