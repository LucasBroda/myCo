/**
 * Service pour l'API de ventes côté client
 * 
 * Gère les ventes planifiées de cartes de la collection.
 * Permet de suivre les cartes que l'utilisateur souhaite vendre et leur statut.
 */

import type {
	PlannedSale,
	CardCondition,
	SalesStats,
} from '@/types/models'
import { http } from './http'

/**
 * Service de gestion des ventes
 */
export const salesService = {
	/**
	 * Récupère toutes les ventes planifiées de l'utilisateur
	 * 
	 * Inclut les ventes complétées et non complétées.
	 * 
	 * @returns Promise avec le tableau de ventes planifiées
	 */
	async getPlannedSales(): Promise<PlannedSale[]> {
		const res = await http.get<{ data: PlannedSale[] }>('/ventes')
		return res.data
	},

	/**
	 * Récupère les statistiques de ventes
	 * 
	 * Calcule le nombre total de ventes et la valeur totale générée.
	 * 
	 * @returns Promise avec les statistiques
	 */
	async getSalesStats(): Promise<SalesStats> {
		const res = await http.get<{ data: SalesStats }>('/ventes/statistiques')
		return res.data
	},

	/**
	 * Ajoute une nouvelle vente planifiée
	 * 
	 * Enrichit automatiquement avec les noms de carte et d'édition via l'API Pokémon TCG.
	 * 
	 * @param payload - Données de la vente
	 * @param payload.cardId - ID de la carte à vendre
	 * @param payload.setId - ID de l'édition
	 * @param payload.salePrice - Prix de vente souhaité (en euros)
	 * @param payload.saleDate - Date prévue de vente (format YYYY-MM-DD)
	 * @param payload.condition - État de la carte
	 * @param payload.notes - Notes optionnelles
	 * @returns Promise avec la vente créée
	 */
	async addPlannedSale(payload: {
		cardId: string
		setId: string
		salePrice: number
		saleDate: string
		condition: CardCondition
		notes?: string | null
	}): Promise<PlannedSale> {
		const res = await http.post<{ data: PlannedSale }>('/ventes', payload)
		return res.data
	},

	/**
	 * Met à jour une vente planifiée
	 * 
	 * Permet de modifier le prix, la date, l'état ou les notes.
	 * 
	 * @param id - ID de la vente planifiée
	 * @param payload - Données à mettre à jour
	 * @returns Promise avec la vente mise à jour
	 */
	async updatePlannedSale(
		id: string,
		payload: {
			salePrice: number
			saleDate: string
			condition: CardCondition
			notes?: string | null
		}
	): Promise<PlannedSale> {
		const res = await http.patch<{ data: PlannedSale }>(`/ventes/${id}`, payload)
		return res.data
	},

	/**
	 * Marque une vente comme complétée
	 * 
	 * Passe le flag `completed` à true pour indiquer que la vente a eu lieu.
	 * La vente reste dans l'historique.
	 * 
	 * @param id - ID de la vente planifiée
	 * @returns Promise avec la vente mise à jour
	 */
	async markSaleAsCompleted(id: string): Promise<PlannedSale> {
		const res = await http.patch<{ data: PlannedSale }>(`/ventes/${id}/completer`, {})
		return res.data
	},

	/**
	 * Supprime définitivement une vente planifiée
	 * 
	 * @param id - ID de la vente à supprimer
	 */
	async deletePlannedSale(id: string): Promise<void> {
		await http.delete(`/ventes/${id}`)
	},
}
