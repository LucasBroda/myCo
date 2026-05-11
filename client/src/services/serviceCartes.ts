/**
 * Service pour l'API Pokémon TCG côté client
 * 
 * Fournit des méthodes pour récupérer les données de cartes et d'éditions
 * depuis l'API backend qui elle-même interroge l'API Pokémon TCG officielle.
 * 
 * Toutes les requêtes bénéficient du cache Redis côté backend (24h pour les sets, 12h pour les cartes).
 */

import type { PokemonCard, PokemonSet } from '@/types/models'
import { http } from './http'

/**
 * Service de gestion des cartes Pokémon
 */
export const cardsService = {
	/**
	 * Récupère toutes les éditions disponibles
	 * 
	 * Retourne jusqu'à 250 éditions triées par date de sortie décroissante.
	 * Les données sont mises en cache côté backend pendant 24h.
	 * 
	 * @returns Promise avec le tableau de toutes les éditions
	 */
	async getSets(): Promise<PokemonSet[]> {
		const res = await http.get<{ data: PokemonSet[] }>('/cartes/collections')
		return res.data
	},

	/**
	 * Récupère une édition et toutes ses cartes
	 * 
	 * Utilise Promise.all côté backend pour optimiser les requêtes parallèles.
	 * 
	 * @param setId - Identifiant de l'édition
	 * @returns Promise avec l'édition et son tableau de cartes
	 */
	async getSet(
		setId: string
	): Promise<{ set: PokemonSet; cards: PokemonCard[] }> {
		return http.get<{ set: PokemonSet; cards: PokemonCard[] }>(
			`/cartes/collections/${setId}`
		)
	},

	/**
	 * Récupère les détails d'une carte spécifique
	 * 
	 * Inclut les informations complètes (images, prix Cardmarket si disponibles, etc.)
	 * 
	 * @param cardId - Identifiant unique de la carte
	 * @returns Promise avec les données complètes de la carte
	 */
	async getCard(cardId: string): Promise<PokemonCard> {
		const res = await http.get<{ data: PokemonCard }>(`/cartes/${cardId}`)
		return res.data
	},

	/**
	 * Recherche des cartes par critères
	 * 
	 * Utilise des wildcards (*) pour les recherches partielles côté backend.
	 * Les critères de recherche sont combinés avec OR (n'importe quel critère correspond).
	 * 
	 * @param query - Terme de recherche (nom de carte ou Pokémon)
	 * @param setId - Optionnel : filtrer par édition spécifique
	 * @returns Promise avec le tableau de cartes correspondantes
	 * @example
	 * ```typescript
	 * // Recherche "Pikachu" dans toutes les éditions
	 * await cardsService.search('Pikachu')
	 * 
	 * // Recherche "Charizard" uniquement dans l'édition Base Set
	 * await cardsService.search('Charizard', 'base1')
	 * ```
	 */
	async search(query: string, setId?: string): Promise<PokemonCard[]> {
		const params = new URLSearchParams({ q: query })
		if (setId) params.set('set', setId)
		const res = await http.get<{ data: PokemonCard[] }>(
			`/cartes/recherche?${params}`
		)
		return res.data
	},
}
