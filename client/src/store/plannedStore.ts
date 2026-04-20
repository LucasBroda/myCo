import type { PlannedPurchase } from '@/types/models'
import { create } from 'zustand'

interface PlannedState {
	// card_id → PlannedPurchase[]  (un joueur peut planifier plusieurs fois la même carte)
	plannedMap: Record<string, PlannedPurchase[]>
	setPlanned: (purchases: PlannedPurchase[]) => void
	addPlanned: (purchase: PlannedPurchase) => void
	removePlanned: (id: string) => void
}

export const usePlannedStore = create<PlannedState>()(set => ({
	plannedMap: {},

	setPlanned: purchases => {
		const map: Record<string, PlannedPurchase[]> = {}
		for (const purchase of purchases) {
			if (!map[purchase.cardId]) map[purchase.cardId] = []
			map[purchase.cardId].push(purchase)
		}
		set({ plannedMap: map })
	},

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

	removePlanned: id =>
		set(state => {
			const next = { ...state.plannedMap }
			for (const cardId of Object.keys(next)) {
				next[cardId] = next[cardId].filter(p => p.id !== id)
				if (next[cardId].length === 0) delete next[cardId]
			}
			return { plannedMap: next }
		}),
}))

// Helpers utilisés hors de React
export function isPlanned(cardId: string): boolean {
	return (usePlannedStore.getState().plannedMap[cardId]?.length ?? 0) > 0
}
