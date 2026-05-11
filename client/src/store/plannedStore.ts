/**
 * Store Zustand pour la gestion des achats planifiés
 * 
 * Structure similaire au collectionStore mais pour les cartes que l'utilisateur
 * prévoit d'acheter dans le futur.
 * 
 * Structure : card_id → PlannedPurchase[]
 * 
 * Un même utilisateur peut planifier plusieurs achats de la même carte avec
 * différents budgets, conditions souhaitées, ou dates prévues.
 */

import type { PlannedPurchase } from '@/types/models'
import { create } from 'zustand'

/**
 * Interface de l'état du store des achats planifiés
 */
interface PlannedState {
	/**
	 * Map des achats planifiés indexés par card_id
	 * Permet une vérification O(1) pour savoir si une carte est planifiée
	 */
	plannedMap: Record<string, PlannedPurchase[]>
	
	/**
	 * Définit la liste complète des achats planifiés (remplace l'état existant)
	 * 
	 * @param purchases - Tableau de tous les achats planifiés
	 */
	setPlanned: (purchases: PlannedPurchase[]) => void
	
	/**
	 * Ajoute un achat planifié
	 * 
	 * @param purchase - Achat à ajouter
	 */
	addPlanned: (purchase: PlannedPurchase) => void
	
	/**
	 * Retire un achat planifié par son ID
	 * 
	 * @param id - ID de l'entrée planned_purchase à supprimer
	 */
	removePlanned: (id: string) => void
}

/**
 * Store des achats planifiés
 */
export const usePlannedStore = create<PlannedState>()(set => ({
	plannedMap: {},

	/**
	 * Reconstruit la map des achats planifiés à partir d'un tableau
	 * Utilisé lors du chargement initial ou du rafraîchissement complet
	 */
	setPlanned: purchases => {
		const map: Record<string, PlannedPurchase[]> = {}
		
		// Groupe les achats par card_id
		for (const purchase of purchases) {
			if (!map[purchase.cardId]) map[purchase.cardId] = []
			map[purchase.cardId].push(purchase)
		}
		
		set({ plannedMap: map })
	},

	/**
	 * Ajoute un achat planifié de manière immutable
	 * Crée une nouvelle entrée si le card_id n'existe pas encore
	 */
	addPlanned: purchase =>
		set(state => {
			const existing = state.plannedMap[purchase.cardId] ?? []
			return {
				plannedMap: {
					...state.plannedMap,
					[purchase.cardId]: [...existing, purchase],
				},
			}
		}),

	/**
	 * Retire un achat planifié par son ID d'achat (pas le card_id)
	 * Supprime l'entrée card_id de la map si c'était le dernier achat planifié
	 */
	removePlanned: id =>
		set(state => {
			const next = { ...state.plannedMap }
			
			// Parcourt toutes les cartes et filtre l'achat avec l'ID correspondant
			for (const cardId of Object.keys(next)) {
				next[cardId] = next[cardId].filter(p => p.id !== id)
				
				// Supprime la clé si plus aucun achat planifié
				if (next[cardId].length === 0) delete next[cardId]
			}
			
			return { plannedMap: next }
		}),
}))

/**
 * Helper pour vérifier si une carte a au moins un achat planifié
 * Utilisé hors de React pour éviter les références circulaires
 * 
 * @param cardId - Identifiant de la carte
 * @returns true si au moins un achat est planifié pour cette carte
 */
export function isPlanned(cardId: string): boolean {
	return (usePlannedStore.getState().plannedMap[cardId]?.length ?? 0) > 0
}
