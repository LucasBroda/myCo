import type { PlannedPurchase } from '@/types/models'
import { http } from './http'

export const profileService = {
	async getPlanned(): Promise<PlannedPurchase[]> {
		const res = await http.get<{ data: PlannedPurchase[] }>('/profile/planned')
		return res.data
	},

	async addPlanned(payload: {
		cardName: string
		setName: string
		plannedDate: string
		budget: number | null
		notes: string | null
	}): Promise<PlannedPurchase> {
		const res = await http.post<{ data: PlannedPurchase }>(
			'/profile/planned',
			payload
		)
		return res.data
	},

	async deletePlanned(id: string): Promise<void> {
		await http.delete(`/profile/planned/${id}`)
	},
}
