import type { PlannedPurchase } from '@/types/models'
import { http } from './http'

export const profileService = {
	async getPlanned(): Promise<PlannedPurchase[]> {
		const res = await http.get<{ data: PlannedPurchase[] }>('/profil/planifies')
		return res.data
	},

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

	async deletePlanned(id: string): Promise<void> {
		await http.delete(`/profil/planifies/${id}`)
	},
}
