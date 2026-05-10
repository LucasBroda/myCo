import type {
	AcquiredCard,
	CardCondition,
	CollectionStats,
} from '@/types/models'
import { http } from './http'

export const collectionService = {
	async getCollection(): Promise<AcquiredCard[]> {
		const res = await http.get<{ data: AcquiredCard[] }>('/collection')
		return res.data
	},

	async getCollectionWithDetails(): Promise<AcquiredCard[]> {
		const res = await http.get<{ data: AcquiredCard[] }>(
			'/collection/avec-details'
		)
		return res.data
	},

	async addCard(payload: {
		cardId: string
		setId: string
		acquiredDate: string
		pricePaid: number | null
		condition: CardCondition
	}): Promise<AcquiredCard> {
		const res = await http.post<{ data: AcquiredCard }>('/collection', payload)
		return res.data
	},

	async removeCard(id: string): Promise<void> {
		await http.delete(`/collection/${id}`)
	},

	async getStats(): Promise<CollectionStats> {
		const res = await http.get<{ data: CollectionStats }>('/collection/statistiques')
		return res.data
	},

	async getFollowedSets(): Promise<string[]> {
		const res = await http.get<{ data: string[] }>('/collection/collections-suivies')
		return res.data
	},

	async followSet(setId: string): Promise<void> {
		await http.post('/collection/collections-suivies', { setId })
	},

	async unfollowSet(setId: string): Promise<void> {
		await http.delete(`/collection/collections-suivies/${setId}`)
	},
}
