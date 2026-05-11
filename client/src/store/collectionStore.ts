/**
 * Store Zustand pour la gestion de la collection de cartes
 * 
 * Ce store maintient une map des cartes possédées par l'utilisateur.
 * Structure : card_id → AcquiredCard[]
 * 
 * Un même utilisateur peut posséder plusieurs exemplaires d'une carte
 * (différentes conditions, prix, dates d'acquisition), d'où le tableau.
 * 
 * Cette structure permet des recherches rapides pour savoir si une carte est possédée.
 */

import type { AcquiredCard } from '@/types/models'
import { create } from 'zustand'

/**
 * Interface de l'état du store de collection
 */
interface CollectionState {
	/**
	 * Map des cartes acquises indexées par card_id
	 * Permet un accès O(1) pour vérifier si une carte est possédée
	 */
	acquiredMap: Record<string, AcquiredCard[]>
	
	/**
	 * Définit la collection complète (remplace l'état existant)
	 * 
	 * @param cards - Tableau de toutes les cartes acquises
	 */
	setCollection: (cards: AcquiredCard[]) => void
	
	/**
	 * Ajoute une carte à la collection
	 * 
	 * @param card - Carte à ajouter
	 */
	addCard: (card: AcquiredCard) => void
	
	/**
	 * Retire une carte de la collection par son ID
	 * 
	 * @param id - ID de l'entrée acquired_card à supprimer
	 */
	removeCard: (id: string) => void
}

/**
 * Store de collection
 */
export const useCollectionStore = create<CollectionState>()(set => ({
	acquiredMap: {},

	/**
	 * Reconstruit la map de collection à partir d'un tableau de cartes
	 * Utilisé lors du chargement initial ou du rafraîchissement complet
	 */
	setCollection: cards => {
		const map: Record<string, AcquiredCard[]> = {}
		
		// Groupe les cartes par card_id
		for (const card of cards) {
			if (!map[card.cardId]) map[card.cardId] = []
			map[card.cardId].push(card)
		}
		
		set({ acquiredMap: map })
	},

	/**
	 * Ajoute une carte à la collection de manière immutable
	 * Crée une nouvelle entrée si le card_id n'existe pas encore
	 */
	addCard: card =>
		set(state => {
			const existing = state.acquiredMap[card.cardId] ?? []
			return {
				acquiredMap: {
					...state.acquiredMap,
					[card.cardId]: [...existing, card],
				},
			}
		}),

	/**
	 * Retire une carte par son ID d'acquisition (pas le card_id)
	 * Supprime l'entrée card_id de la map si c'était le dernier exemplaire
	 */
	removeCard: id =>
		set(state => {
			const next = { ...state.acquiredMap }
			
			// Parcourt toutes les cartes et filtre celle avec l'ID correspondant
			for (const cardId of Object.keys(next)) {
				next[cardId] = next[cardId].filter(c => c.id !== id)
				
				// Supprime la clé si plus aucun exemplaire
				if (next[cardId].length === 0) delete next[cardId]
			}
			
			return { acquiredMap: next }
		}),
}))

/**
 * Fonctions helper utilisées hors de React
 * (évite les références circulaires dans create())
 */

/**
 * Vérifie si une carte est possédée (au moins un exemplaire)
 * 
 * @param cardId - Identifiant de la carte
 * @returns true si au moins un exemplaire est possédé
 */
export function isOwned(cardId: string): boolean {
	return (useCollectionStore.getState().acquiredMap[cardId]?.length ?? 0) > 0
}

/**
 * Récupère toutes les cartes d'une édition spécifique
 * 
 * @param setId - Identifiant de l'édition
 * @returns Tableau de toutes les cartes de cette édition dans la collection
 */
export function getBySet(setId: string): AcquiredCard[] {
	return Object.values(useCollectionStore.getState().acquiredMap)
		.flat() // Aplatit le tableau de tableaux
		.filter(c => c.setId === setId)
}
