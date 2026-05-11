/**
 * Service pour l'API de profil côté client
 * 
 * Gère les achats planifiés de l'utilisateur.
 * Permet de suivre les cartes que l'utilisateur souhaite acquérir dans le futur.
 */

import type { PlannedPurchase } from '@/types/models'
import { http } from './http'

/**
 * Service de gestion du profil utilisateur
 */
export const profileService = {
	/**
	 * Récupère tous les achats planifiés de l'utilisateur
	 * 
	 * Liste des cartes que l'utilisateur prévoit d'acheter avec budget et date prévue.
	 * 
	 * @returns Promise avec le tableau d'achats planifiés
	 */
	async getPlanned(): Promise<PlannedPurchase[]> {
		const res = await http.get<{ data: PlannedPurchase[] }>('/profil/planifies')
		return res.data
	},

	/**
	 * Ajoute un nouvel achat planifié
	 * 
	 * Permet de planifier l'achat d'une carte avec un budget maximum et une date cible.
	 * 
	 * @param payload - Données de l'achat planifié
	 * @param payload.cardId - ID de la carte à acheter
	 * @param payload.setId - ID de l'édition
	 * @param payload.cardName - Nom de la carte (dénormalisé)
	 * @param payload.setName - Nom de l'édition (dénormalisé)
	 * @param payload.plannedDate - Date prévue d'achat (format YYYY-MM-DD)
	 * @param payload.budget - Budget maximum en euros (null si non défini)
	 * @param payload.condition - État souhaité de la carte
	 * @param payload.notes - Notes personnelles (null si non renseigné)
	 * @returns Promise avec l'achat planifié créé
	 */
	async addPlanned(payload: {
		cardId: string
		setId: string
		cardName: string
		setName: string
		plannedDate: string
		budget: number | null
		condition: import('@/types/models').CardCondition
		notes: string | null
	}): Promise<PlannedPurchase> {
		const res = await http.post<{ data: PlannedPurchase }>(
			'/profil/planifies',
			payload
		)
		return res.data
	},

	/**
	 * Supprime un achat planifié
	 * 
	 * Retire définitivement l'achat planifié de la base de données.
	 * 
	 * @param id - ID de l'achat planifié à supprimer
	 */
	async deletePlanned(id: string): Promise<void> {
		await http.delete(`/profil/planifies/${id}`)
	},
}
