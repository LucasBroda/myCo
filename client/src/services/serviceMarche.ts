/**
 * Service pour l'API de marché côté client
 * 
 * Permet de rechercher des cartes avec leurs prix du marché et de trouver les meilleures offres.
 * Intègre les données de prix depuis l'API eBay via le backend.
 */

import type { MarketPrice, PokemonCard } from '@/types/models'
import { http } from './http'

/**
 * Carte avec informations de prix de marché
 */
interface MarketCard extends PokemonCard {
	/** Données de prix du marché (eBay) */
	market: MarketPrice
}

/**
 * Carte avec calcul de remise
 * Utilisée pour identifier les bonnes affaires
 */
interface DealCard extends MarketCard {
	/** Pourcentage de remise par rapport au prix moyen */
	discountPercent: number
}

/**
 * Service de gestion du marché
 */
export const marketService = {
	/**
	 * Recherche des cartes avec leurs prix de marché
	 * 
	 * Combine les données de l'API Pokémon TCG avec les prix moyens eBay.
	 * 
	 * @param query - Terme de recherche (nom de carte)
	 * @param setId - Optionnel : filtrer par édition spécifique
	 * @returns Promise avec le tableau de cartes enrichies de leurs prix
	 */
	async search(query: string, setId?: string): Promise<MarketCard[]> {
		const params = new URLSearchParams({ q: query })
		if (setId) params.set('set', setId)
		const res = await http.get<{ data: MarketCard[] }>(
			`/marche/recherche?${params}`
		)
		return res.data
	},

	/**
	 * Récupère les meilleures offres du moment
	 * 
	 * Identifie les cartes avec les remises les plus importantes par rapport
	 * aux prix moyens du marché. Utile pour trouver des bonnes affaires.
	 * 
	 * @returns Promise avec le tableau de cartes en promotion
	 */
	async getDeals(): Promise<DealCard[]> {
		const res = await http.get<{ data: DealCard[] }>('/marche/offres')
		return res.data
	},

	/**
	 * Compare le prix d'une carte spécifique
	 * 
	 * Récupère le prix moyen actuel depuis eBay (top 10 listings "Buy It Now").
	 * 
	 * @param cardId - Identifiant de la carte
	 * @returns Promise avec les données de prix
	 */
	async compare(cardId: string): Promise<MarketPrice> {
		const res = await http.get<{ data: MarketPrice }>(
			`/marche/comparer/${cardId}`
		)
		return res.data
	},
}
