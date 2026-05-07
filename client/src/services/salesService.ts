import type {
	PotentialSale,
	CardCondition,
} from '@/types/models'
import { http } from './http'

export const salesService = {
	async getPotentialSales(): Promise<PotentialSale[]> {
		const res = await http.get<{ data: PotentialSale[] }>('/sales')
		return res.data
	},

	async addPotentialSale(payload: {
		cardId: string
		setId: string
		salePrice: number
		saleDate: string
		condition: CardCondition
		notes?: string | null
	}): Promise<PotentialSale> {
		const res = await http.post<{ data: PotentialSale }>('/sales', payload)
		return res.data
	},

	async updatePotentialSale(
		id: string,
		payload: {
			salePrice: number
			saleDate: string
			condition: CardCondition
			notes?: string | null
		}
	): Promise<PotentialSale> {
		const res = await http.patch<{ data: PotentialSale }>(`/sales/${id}`, payload)
		return res.data
	},

	async deletePotentialSale(id: string): Promise<void> {
		await http.delete(`/sales/${id}`)
	},
}
