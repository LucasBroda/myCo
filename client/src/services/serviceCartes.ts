import type { PokemonCard, PokemonSet } from '@/types/models'
import { http } from './http'

export const cardsService = {
	async getSets(): Promise<PokemonSet[]> {
		const res = await http.get<{ data: PokemonSet[] }>('/cartes/collections')
		return res.data
	},

	async getSet(
		setId: string
	): Promise<{ set: PokemonSet; cards: PokemonCard[] }> {
		return http.get<{ set: PokemonSet; cards: PokemonCard[] }>(
			`/cartes/collections/${setId}`
		)
	},

	async getCard(cardId: string): Promise<PokemonCard> {
		const res = await http.get<{ data: PokemonCard }>(`/cartes/${cardId}`)
		return res.data
	},

	async search(query: string, setId?: string): Promise<PokemonCard[]> {
		const params = new URLSearchParams({ q: query })
		if (setId) params.set('set', setId)
		const res = await http.get<{ data: PokemonCard[] }>(
			`/cartes/recherche?${params}`
		)
		return res.data
	},
}
