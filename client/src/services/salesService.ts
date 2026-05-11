/**
 * Service alternatif pour l'API de ventes (endpoints en anglais)
 * 
 * REMARQUE : Ce fichier semble être un doublon de serviceVentes.ts avec des endpoints différents.
 * serviceVentes.ts utilise '/ventes' (français) tandis que celui-ci utilise '/sales' (anglais).
 * 
 * Il serait recommandé de standardiser et n'utiliser qu'un seul service.
 */

import type {
	PlannedSale,
	CardCondition,
	SalesStats,
} from '@/types/models'
import { http } from './http'

/**
 * Service de gestion des ventes (version anglaise)
 */
export const salesService = {
	/**
	 * Récupère toutes les ventes planifiées
	 * 
	 * @returns Promise avec le tableau de ventes planifiées
	 */
	async getPlannedSales(): Promise<PlannedSale[]> {
		const res = await http.get<{ data: PlannedSale[] }>('/sales')
		return res.data
	},

	/**
	 * Récupère les statistiques de ventes
	 * 
	 * @returns Promise avec les statistiques
	 */
	async getSalesStats(): Promise<SalesStats> {
		const res = await http.get<{ data: SalesStats }>('/sales/stats')
		return res.data
	},

	/**
	 * Ajoute une nouvelle vente planifiée
	 * 
	 * @param payload - Données de la vente
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
		const res = await http.post<{ data: PlannedSale }>('/sales', payload)
		return res.data
	},

	/**
	 * Met à jour une vente planifiée
	 * 
	 * @param id - ID de la vente
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
		const res = await http.patch<{ data: PlannedSale }>(`/sales/${id}`, payload)
		return res.data
	},

	/**
	 * Marque une vente comme complétée
	 * 
	 * @param id - ID de la vente
	 * @returns Promise avec la vente mise à jour
	 */
	async markSaleAsCompleted(id: string): Promise<PlannedSale> {
		const res = await http.patch<{ data: PlannedSale }>(`/sales/${id}/complete`, {})
		return res.data
	},

	/**
	 * Supprime une vente planifiée
	 * 
	 * @param id - ID de la vente à supprimer
	 */
	async deletePlannedSale(id: string): Promise<void> {
		await http.delete(`/sales/${id}`)
	},
}
