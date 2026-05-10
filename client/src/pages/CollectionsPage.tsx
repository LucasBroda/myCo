import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { PageHeader } from '@components/layout/PageHeader'
import { SetCard } from '@components/pokemon/SetCard'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing['4']};

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
`

export default function CollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore()
	const navigate = useNavigate()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const [fetchedSets, collection] = await Promise.all([
				cardsService.getSets(),
				collectionService.getCollection(),
			])
			setSets(fetchedSets)
			setCollection(collection)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	function getOwnedCount(setId: string): number {
		return Object.values(acquiredMap)
			.flat()
			.filter(c => c.setId === setId).length
	}

	if (isLoading) return <Spinner center label="Chargement des collections…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (sets.length === 0) return <EmptyState message="Aucun set disponible." />

	return (
		<section aria-labelledby="collections-title">
			<PageHeader
				title="Collections"
				id="collections-title"
				subtitle={`${sets.length} sets Pokémon TCG`}
			/>
			<Grid>
				{sets.map(set => (
					<SetCard
						key={set.id}
						set={set}
						ownedCount={getOwnedCount(set.id)}
						onClick={() => navigate(`/collections/${set.id}`)}
					/>
				))}
			</Grid>
		</section>
	)
}
