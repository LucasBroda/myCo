import type { PokemonCard, PokemonSet } from '@/types/models'
import { http } from './http'

export const cardsService = {
	async getSets(): Promise<PokemonSet[]> {
		const res = await http.get<{ data: PokemonSet[] }>('/cards/sets')
		return res.data
	},

	async getSet(
		setId: string
	): Promise<{ set: PokemonSet; cards: PokemonCard[] }> {
		return http.get<{ set: PokemonSet; cards: PokemonCard[] }>(
			`/cards/sets/${setId}`
		)
	},

	async getCard(cardId: string): Promise<PokemonCard> {
		const res = await http.get<{ data: PokemonCard }>(`/cards/${cardId}`)
		return res.data
	},

	async search(query: string, setId?: string): Promise<PokemonCard[]> {
		const params = new URLSearchParams({ q: query })
		if (setId) params.set('set', setId)
		const res = await http.get<{ data: PokemonCard[] }>(
			`/cards/search?${params}`
		)
		return res.data
	},
}
