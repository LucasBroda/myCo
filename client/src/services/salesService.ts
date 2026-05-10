import type {
	PlannedSale,
	CardCondition,
	SalesStats,
} from '@/types/models'
import { http } from './http'

export const salesService = {
	async getPlannedSales(): Promise<PlannedSale[]> {
		const res = await http.get<{ data: PlannedSale[] }>('/sales')
		return res.data
	},

	async getSalesStats(): Promise<SalesStats> {
		const res = await http.get<{ data: SalesStats }>('/sales/stats')
		return res.data
	},

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

	async markSaleAsCompleted(id: string): Promise<PlannedSale> {
		const res = await http.patch<{ data: PlannedSale }>(`/sales/${id}/complete`, {})
		return res.data
	},

	async deletePlannedSale(id: string): Promise<void> {
		await http.delete(`/sales/${id}`)
	},
}
