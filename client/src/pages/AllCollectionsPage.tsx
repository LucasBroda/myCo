import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Button } from '@components/ui/Button'
import { PageHeader } from '@components/layout/PageHeader'
import { SetCard } from '@components/pokemon/SetCard'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { useToast } from '@hooks/useToast'

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: ${({ theme }) => theme.spacing['4']};
`

const SetCardWrapper = styled.div<{ $isFollowed: boolean }>`
	position: relative;
	opacity: ${({ $isFollowed }) => ($isFollowed ? 0.5 : 1)};
	transition: opacity ${({ theme }) => theme.transitions.fast};

	${({ $isFollowed, theme }) =>
		$isFollowed &&
		`
		&::after {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: ${theme.colors.surface};
			opacity: 0.3;
			pointer-events: none;
			border-radius: ${theme.radii.lg};
		}
	`}
`

const SetCardContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
`

const FollowButton = styled(Button)<{ $isFollowed: boolean }>`
	width: 100%;
	font-size: ${({ theme }) => theme.font.size.sm};
	padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['3']}`};
	background-color: ${({ $isFollowed, theme }) =>
		$isFollowed ? theme.colors.brickLight : theme.colors.amberLight};
	color: ${({ $isFollowed, theme }) =>
		$isFollowed ? theme.colors.brick : theme.colors.amber};

	&:hover:not(:disabled) {
		background-color: ${({ $isFollowed, theme }) =>
			$isFollowed ? theme.colors.brick : theme.colors.amber};
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

export default function AllCollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [followedSetIds, setFollowedSetIds] = useState<Set<string>>(new Set())
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore()
	const navigate = useNavigate()
	const { toast } = useToast()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const [fetchedSets, collection, followedIds] = await Promise.all([
				cardsService.getSets(),
				collectionService.getCollection(),
				collectionService.getFollowedSets(),
			])
			setSets(fetchedSets)
			setCollection(collection)
			setFollowedSetIds(new Set(followedIds))
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

	async function handleToggleFollow(setId: string, setName: string, e: React.MouseEvent) {
		e.stopPropagation()
		const isFollowed = followedSetIds.has(setId)

		try {
			if (isFollowed) {
				await collectionService.unfollowSet(setId)
				setFollowedSetIds(prev => {
					const next = new Set(prev)
					next.delete(setId)
					return next
				})
				toast(`Collection "${setName}" retirée de vos suivis`, 'success')
			} else {
				await collectionService.followSet(setId)
				setFollowedSetIds(prev => new Set(prev).add(setId))
				toast(`Collection "${setName}" ajoutée à vos suivis`, 'success')
			}
		} catch (err) {
			toast(
				err instanceof Error ? err.message : 'Erreur lors de la modification',
				'error'
			)
		}
	}

	if (isLoading) return <Spinner center label="Chargement des collections…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (sets.length === 0) return <EmptyState message="Aucun set disponible." />

	return (
		<section aria-labelledby="all-collections-title">
			<PageHeader
				title="Toutes les Collections"
				id="all-collections-title"
				subtitle={`${sets.length} sets Pokémon TCG`}
			/>
			<Grid>
				{sets.map(set => {
					const isFollowed = followedSetIds.has(set.id)
					return (
						<SetCardContainer key={set.id}>
							<SetCardWrapper $isFollowed={isFollowed}>
								<SetCard
									set={set}
									ownedCount={getOwnedCount(set.id)}
									onClick={() => navigate(`/collections/${set.id}`)}
								/>
							</SetCardWrapper>
							<FollowButton
								$isFollowed={isFollowed}
								onClick={(e) => handleToggleFollow(set.id, set.name, e)}
							>
								{isFollowed ? '✓ Suivie' : '+ Suivre'}
							</FollowButton>
						</SetCardContainer>
					)
				})}
			</Grid>
		</section>
	)
}
