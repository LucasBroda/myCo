import type { AcquiredCard } from '@/types/models'
import { create } from 'zustand'

interface CollectionState {
	// card_id → AcquiredCard[]  (un seul joueur peut avoir plusieurs copies)
	acquiredMap: Record<string, AcquiredCard[]>
	setCollection: (cards: AcquiredCard[]) => void
	addCard: (card: AcquiredCard) => void
	removeCard: (id: string) => void
}

export const useCollectionStore = create<CollectionState>()(set => ({
	acquiredMap: {},

	setCollection: cards => {
		const map: Record<string, AcquiredCard[]> = {}
		for (const card of cards) {
			if (!map[card.cardId]) map[card.cardId] = []
			map[card.cardId].push(card)
		}
		set({ acquiredMap: map })
	},

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

	removeCard: id =>
		set(state => {
			const next = { ...state.acquiredMap }
			for (const cardId of Object.keys(next)) {
				next[cardId] = next[cardId].filter(c => c.id !== id)
				if (next[cardId].length === 0) delete next[cardId]
			}
			return { acquiredMap: next }
		}),
}))

// Helpers utilisés hors de React (évitent les références circulaires dans create())
export function isOwned(cardId: string): boolean {
	return (useCollectionStore.getState().acquiredMap[cardId]?.length ?? 0) > 0
}

export function getBySet(setId: string): AcquiredCard[] {
	return Object.values(useCollectionStore.getState().acquiredMap)
		.flat()
		.filter(c => c.setId === setId)
}
