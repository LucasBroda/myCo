/**
 * Définitions des types et interfaces TypeScript pour les modèles de données
 * 
 * Ce fichier centralise tous les types métier de l'application :
 * - Types liés aux cartes Pokémon (Card, Set)
 * - Types liés à la collection utilisateur (AcquiredCard, PlannedPurchase, PlannedSale)
 * - Types liés aux utilisateurs (User)
 * - Types liés aux statistiques et prix
 * 
 * Ces interfaces assurent la cohérence des données entre le backend et le frontend.
 */

/**
 * État de condition d'une carte
 * 
 * - Mint : Parfait état, jamais jouée
 * - NM (Near Mint) : Quasi-parfait, légères traces d'usure
 * - LP (Lightly Played) : Légèrement jouée, petites imperfections
 * - MP (Moderately Played) : Moyennement jouée, imperfections visibles
 * - HP (Heavily Played) : Très jouée, usure importante
 * - Damaged : Endommagée, plis ou déchirures
 */
export type CardCondition = "Mint" | "NM" | "LP" | "MP" | "HP" | "Damaged";

/**
 * Représente un utilisateur de l'application
 */
export interface User {
  /** Identifiant unique (UUID) */
  id: string;
  /** Adresse email (unique) */
  email: string;
  /** Date de création du compte (ISO 8601) */
  createdAt: string;
}

/**
 * Représente une édition (set) de cartes Pokémon
 * 
 * Données provenant de l'API Pokémon TCG
 */
export interface PokemonSet {
  /** Identifiant unique de l'édition */
  id: string;
  /** Nom de l'édition (ex: "Base Set", "Jungle") */
  name: string;
  /** Série à laquelle appartient l'édition */
  series: string;
  /** Nombre de cartes officiellement annoncé */
  printedTotal: number;
  /** Nombre total réel de cartes (inclut les cartes secrètes) */
  total: number;
  /** Date de sortie (format YYYY/MM/DD) */
  releaseDate: string;
  /** Images de l'édition */
  images: {
    /** URL du symbole de l'édition */
    symbol: string;
    /** URL du logo de l'édition */
    logo: string;
  };
}

/**
 * Représente une carte Pokémon individuelle
 * 
 * Données provenant de l'API Pokémon TCG avec prix optionnels de Cardmarket
 */
export interface PokemonCard {
  /** Identifiant unique de la carte */
  id: string;
  /** Nom de la carte/Pokémon */
  name: string;
  /** Numéro dans l'édition (ex: "1", "102", "H32") */
  number: string;
  /** Rareté (Common, Uncommon, Rare, Ultra Rare, etc.) */
  rarity: string;
  /** Types du Pokémon (ex: ["Fire"], ["Water", "Psychic"]) */
  types: string[];
  /** Nom de l'illustrateur (optionnel) */
  artist?: string;
  /** URLs des images de la carte */
  images: {
    /** Petite image (pour listes) */
    small: string;
    /** Grande image (pour détails) */
    large: string;
  };
  /** Informations sur l'édition */
  set: {
    /** ID de l'édition */
    id: string;
    /** Nom de l'édition */
    name: string;
  };
  /** Données de prix Cardmarket (optionnelles) */
  cardmarket?: {
    /** URL vers la page Cardmarket */
    url: string;
    /** Statistiques de prix en euros */
    prices: {
      /** Prix de vente moyen */
      averageSellPrice: number;
      /** Prix le plus bas actuellement */
      lowPrice: number;
      /** Prix tendance (moyenne pondérée) */
      trendPrice: number;
      /** Moyenne sur 1 jour */
      avg1: number;
      /** Moyenne sur 7 jours */
      avg7: number;
      /** Moyenne sur 30 jours */
      avg30: number;
    };
    /** Date de dernière mise à jour (ISO 8601) */
    updatedAt: string;
  };
}

/**
 * Représente une carte acquise par un utilisateur
 * 
 * Enregistrement dans la table `acquired_cards`
 */
export interface AcquiredCard {
  /** Identifiant unique de l'acquisition */
  id: string;
  /** Nom de la carte (dénormalisé pour performances) */
  cardName: string;
  /** Nom de l'édition (dénormalisé pour performances) */
  setName: string;
  /** ID du propriétaire */
  userId: string;
  /** ID de la carte Pokémon TCG */
  cardId: string;
  /** ID de l'édition */
  setId: string;
  /** Date d'acquisition (format YYYY-MM-DD) */
  acquiredDate: string;
  /** Prix payé en euros (optionnel) */
  pricePaid: number | null;
  /** État de la carte */
  condition: CardCondition;
  /** Date d'enregistrement en base (ISO 8601) */
  createdAt: string;
}

/**
 * Représente un achat planifié
 * 
 * Enregistrement dans la table `planned_purchases`
 */
export interface PlannedPurchase {
  /** Identifiant unique de l'achat planifié */
  id: string;
  /** ID de l'utilisateur */
  userId: string;
  /** ID de la carte à acheter */
  cardId: string;
  /** ID de l'édition */
  setId: string;
  /** Nom de la carte (dénormalisé) */
  cardName: string;
  /** Nom de l'édition (dénormalisé) */
  setName: string;
  /** Date prévue d'achat (format YYYY-MM-DD) */
  plannedDate: string;
  /** Budget maximum en euros (optionnel) */
  budget: number | null;
  /** État souhaité de la carte */
  condition: CardCondition;
  /** Notes personnelles (optionnel) */
  notes: string | null;
  /** Date d'enregistrement en base (ISO 8601) */
  createdAt: string;
}

/**
 * Représente une vente planifiée
 * 
 * Enregistrement dans la table `planned_sales`
 */
export interface PlannedSale {
  /** Identifiant unique de la vente planifiée */
  id: string;
  /** ID de l'utilisateur */
  userId: string;
  /** ID de la carte à vendre */
  cardId: string;
  /** ID de l'édition */
  setId: string;
  /** Nom de la carte (dénormalisé) */
  cardName: string;
  /** Nom de l'édition (dénormalisé) */
  setName: string;
  /** Prix de vente souhaité en euros */
  salePrice: number;
  /** Date prévue de vente (format YYYY-MM-DD) */
  saleDate: string;
  /** État de la carte */
  condition: CardCondition;
  /** Notes personnelles (optionnel) */
  notes: string | null;
  /** Indique si la vente est finalisée */
  completed: boolean;
  /** Date d'enregistrement en base (ISO 8601) */
  createdAt: string;
}

/**
 * Statistiques de ventes d'un utilisateur
 */
export interface SalesStats {
  /** Nombre total de ventes */
  totalSales: number;
  /** Valeur totale des ventes en euros */
  totalValue: number;
}

/**
 * Prix de marché pour une carte
 */
export interface MarketPrice {
  /** ID de la carte */
  cardId: string;
  /** Prix moyen Cardmarket en euros (null si indisponible) */
  cardMarketPrice: number | null;
  ebayPrice: number | null;
  cardMarketUrl: string | null;
  ebayUrl: string | null;
  percentChange30d: number | null;
  fetchedAt: string;
}

export interface MonthStat {
  month: string;
  totalSpent: number;
  cardCount: number;
}

export interface CollectionStats {
  totalCards: number;
  totalSpent: number;
  estimatedValue: number;
  byMonth: MonthStat[];
}
