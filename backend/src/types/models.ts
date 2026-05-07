export type CardCondition = "Mint" | "NM" | "LP" | "MP" | "HP" | "Damaged";

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  releaseDate: string;
  images: {
    symbol: string;
    logo: string;
  };
}

export interface PokemonCard {
  id: string;
  name: string;
  number: string;
  rarity: string;
  types: string[];
  artist?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
  };
  cardmarket?: {
    url: string;
    prices: {
      averageSellPrice: number;
      lowPrice: number;
      trendPrice: number;
      avg1: number;
      avg7: number;
      avg30: number;
    };
    updatedAt: string;
  };
}

export interface AcquiredCard {
  id: string;
  cardName: string;
  setName: string;
  userId: string;
  cardId: string;
  setId: string;
  acquiredDate: string;
  pricePaid: number | null;
  condition: CardCondition;
  createdAt: string;
}

export interface PlannedPurchase {
  id: string;
  userId: string;
  cardId: string;
  setId: string;
  cardName: string;
  setName: string;
  plannedDate: string;
  budget: number | null;
  condition: CardCondition;
  notes: string | null;
  createdAt: string;
}

export interface PotentialSale {
  id: string;
  userId: string;
  cardId: string;
  setId: string;
  cardName: string;
  setName: string;
  salePrice: number;
  saleDate: string;
  condition: CardCondition;
  notes: string | null;
  createdAt: string;
}

export interface MarketPrice {
  cardId: string;
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
