/**
 * Service pour l'API de collection côté client
 * 
 * Gère toutes les interactions avec la collection de cartes de l'utilisateur :
 * - CRUD des cartes acquises
 * - Suivi des éditions favorites
 * - Statistiques de collection
 * 
 * Nécessite une authentification pour toutes les requêtes.
 */

import type {
	AcquiredCard,
	CardCondition,
	CollectionStats,
} from '@/types/models'
import { http } from './http'

/**
 * Service de gestion de la collection utilisateur
 */
export const collectionService = {
	/**
	 * Récupère la collection complète de l'utilisateur (version légère)
	 * 
	 * Ne contient que les IDs, pas les noms des cartes/éditions.
	 * Utilisé pour le chargement initial rapide.
	 * 
	 * @returns Promise avec le tableau de cartes acquises
	 */
	async getCollection(): Promise<AcquiredCard[]> {
		const res = await http.get<{ data: AcquiredCard[] }>('/collection')
		return res.data
	},

	/**
	 * Récupère la collection avec détails complets
	 * 
	 * Enrichit chaque carte avec son nom et le nom de l'édition via l'API Pokémon TCG.
	 * Plus lent mais fournit toutes les informations nécessaires à l'affichage.
	 * 
	 * Effectue également un nettoyage automatique des achats planifiés expirés.
	 * 
	 * @returns Promise avec le tableau de cartes acquises enrichies
	 */
	async getCollectionWithDetails(): Promise<AcquiredCard[]> {
		const res = await http.get<{ data: AcquiredCard[] }>(
			'/collection/avec-details'
		)
		return res.data
	},

	/**
	 * Ajoute une carte à la collection
	 * 
	 * Récupère automatiquement les noms de la carte et de l'édition
	 * via l'API Pokémon TCG pour les stocker en base (dénormalisation).
	 * 
	 * @param payload - Données de la carte à ajouter
	 * @param payload.cardId - ID de la carte Pokémon TCG
	 * @param payload.setId - ID de l'édition
	 * @param payload.acquiredDate - Date d'acquisition (format YYYY-MM-DD)
	 * @param payload.pricePaid - Prix payé en euros (null si non renseigné)
	 * @param payload.condition - État de la carte (Mint, NM, LP, etc.)
	 * @returns Promise avec la carte ajoutée
	 */
	async addCard(payload: {
		cardId: string
		setId: string
		acquiredDate: string
		pricePaid: number | null
		condition: CardCondition
	}): Promise<AcquiredCard> {
		const res = await http.post<{ data: AcquiredCard }>('/collection', payload)
		return res.data
	},

	/**
	 * Retire une carte de la collection
	 * 
	 * Supprime définitivement l'entrée de la base de données.
	 * 
	 * @param id - ID de la carte acquise (acquired_cards.id, pas le cardId)
	 * @throws Error 404 si la carte n'existe pas ou n'appartient pas à l'utilisateur
	 */
	async removeCard(id: string): Promise<void> {
		await http.delete(`/collection/${id}`)
	},

	/**
	 * Récupère les statistiques de la collection
	 * 
	 * Calcule des métriques agrégées comme le nombre total de cartes,
	 * la valeur totale, les cartes par édition, etc.
	 * 
	 * @returns Promise avec les statistiques
	 */
	async getStats(): Promise<CollectionStats> {
		const res = await http.get<{ data: CollectionStats }>('/collection/statistiques')
		return res.data
	},

	/**
	 * Récupère la liste des éditions suivies par l'utilisateur
	 * 
	 * Les éditions suivies apparaissent en priorité dans l'interface.
	 * 
	 * @returns Promise avec le tableau des IDs d'éditions suivies
	 */
	async getFollowedSets(): Promise<string[]> {
		const res = await http.get<{ data: string[] }>('/collection/collections-suivies')
		return res.data
	},

	/**
	 * Ajoute une édition aux éditions suivies
	 * 
	 * Idempotent : appeler plusieurs fois avec le même setId n'a aucun effet.
	 * Utilise ON CONFLICT DO NOTHING côté backend.
	 * 
	 * @param setId - ID de l'édition à suivre
	 */
	async followSet(setId: string): Promise<void> {
		await http.post('/collection/collections-suivies', { setId })
	},

	/**
	 * Retire une édition des éditions suivies
	 * 
	 * @param setId - ID de l'édition à ne plus suivre
	 * @throws Error 404 si l'édition n'était pas suivie
	 */
	async unfollowSet(setId: string): Promise<void> {
		await http.delete(`/collection/collections-suivies/${setId}`)
	},
}
