import type { MarketPrice, PokemonCard } from '@/types/models'
import { http } from './http'

interface MarketCard extends PokemonCard {
	market: MarketPrice
}

interface DealCard extends MarketCard {
	discountPercent: number
}

export const marketService = {
	async search(query: string, setId?: string): Promise<MarketCard[]> {
		const params = new URLSearchParams({ q: query })
		if (setId) params.set('set', setId)
		const res = await http.get<{ data: MarketCard[] }>(
			`/market/search?${params}`
		)
		return res.data
	},

	async getDeals(): Promise<DealCard[]> {
		const res = await http.get<{ data: DealCard[] }>('/market/deals')
		return res.data
	},

	async compare(cardId: string): Promise<MarketPrice> {
		const res = await http.get<{ data: MarketPrice }>(
			`/market/compare/${cardId}`
		)
		return res.data
	},
}
