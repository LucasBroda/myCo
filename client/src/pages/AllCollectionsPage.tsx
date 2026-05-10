import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { PageHeader } from '@components/layout/PageHeader'
import { SetCard } from '@components/pokemon/SetCard'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { useToast } from '@hooks/useToast'

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	max-width: 500px;

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		margin-bottom: ${({ theme }) => theme.spacing['6']};
	}
`

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing['3']};

	@media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: ${({ theme }) => theme.spacing['4']};
	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
`

const SetCardWrapper = styled.div<{ $isFollowed: boolean }>`
	position: relative;
	opacity: ${({ $isFollowed }) => ($isFollowed ? 0.5 : 1)};
	transition: opacity ${({ theme }) => theme.transitions.fast};
	cursor: ${({ $isFollowed }) => ($isFollowed ? 'not-allowed' : 'pointer')};
	pointer-events: ${({ $isFollowed }) => ($isFollowed ? 'none' : 'auto')};

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
	pointer-events: auto;

	&:hover:not(:disabled) {
		background-color: ${({ $isFollowed, theme }) =>
			$isFollowed ? theme.colors.brick : theme.colors.amber};
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

// Mapping français -> anglais pour les séries Pokémon
const frenchToEnglishMapping: Record<string, string[]> = {
	// Séries principales
	'base': ['base'],
	'jungle': ['jungle'],
	'fossile': ['fossil'],
	'team rocket': ['team rocket'],
	'gym': ['gym'],
	'neo': ['neo'],
	'legendary': ['legendary', 'legendaire'],
	'expedition': ['expedition', 'expédition'],
	'aquapolis': ['aquapolis'],
	'skyridge': ['skyridge'],
	'rubis': ['ruby', 'sapphire'],
	'saphir': ['ruby', 'sapphire'],
	'emeraude': ['emerald'],
	'feuille': ['firered', 'leafgreen', 'fire', 'leaf'],
	'rouge': ['firered', 'fire'],
	'verte': ['leafgreen', 'leaf'],
	'diamant': ['diamond', 'pearl'],
	'perle': ['diamond', 'pearl'],
	'platine': ['platinum'],
	'or': ['heartgold', 'gold'],
	'argent': ['soulsilver', 'silver'],
	'noir': ['black', 'white'],
	'blanc': ['black', 'white'],
	'x': ['x', 'y'],
	'y': ['x', 'y'],
	'soleil': ['sun', 'moon'],
	'lune': ['sun', 'moon'],
	'épée': ['sword', 'shield'],
	'bouclier': ['sword', 'shield'],
	'écarlate': ['scarlet', 'violet'],
	'violet': ['scarlet', 'violet'],
	'évolutions': ['evolutions', 'evolution'],
	'générations': ['generations', 'generation'],
	'destinées': ['fates', 'destiny', 'destinies'],
	'occult': ['hidden', 'occult'],
	'obscures': ['hidden', 'dark'],
	'brillant': ['shining', 'brilliant', 'shiny'],
	'étoile': ['star', 'stellar'],
	'fusion': ['fusion', 'strike'],
	'ténèbres': ['darkness', 'dark'],
	'tempête': ['storm', 'tempest'],
	'ciel': ['sky', 'celestial'],
	'gardiens': ['guardians', 'guardian'],
	'origine': ['origins', 'origin'],
	'légendes': ['legends', 'legendary'],
	'triomphe': ['triumphant', 'triumph'],
	'dragons': ['dragon'],
	'astres': ['astral', 'stellar'],
	'couronne': ['crown', 'zenith'],
	'zénith': ['zenith'],
	'braises': ['ember', 'fire'],
	'obsidienne': ['obsidian'],
	'glacier': ['ice', 'glacier'],
	'flammes': ['flame', 'fire'],
	'volt': ['volt', 'electric'],
	'paradoxe': ['paradox'],
	'destinée': ['destiny', 'destinies'],
	'roi': ['king', 'crown'],
	'reine': ['queen', 'crown'],
	'masques': ['mask'],
	'crépuscule': ['twilight', 'dusk'],
	'aurore': ['dawn', 'aurora'],
}

function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // Retire les accents
		.trim()
}

function matchesSearch(setName: string, searchQuery: string): boolean {
	if (!searchQuery) return true

	const normalizedSetName = normalizeString(setName)
	const normalizedQuery = normalizeString(searchQuery)

	// Recherche directe dans le nom anglais
	if (normalizedSetName.includes(normalizedQuery)) return true

	// Recherche via le mapping français-anglais
	for (const [frenchTerm, englishTerms] of Object.entries(frenchToEnglishMapping)) {
		const normalizedFrench = normalizeString(frenchTerm)
		if (normalizedFrench.includes(normalizedQuery) || normalizedQuery.includes(normalizedFrench)) {
			// Si le terme français correspond, vérifier si un des termes anglais est dans le nom du set
			return englishTerms.some(englishTerm => 
				normalizedSetName.includes(normalizeString(englishTerm))
			)
		}
	}

	return false
}

export default function AllCollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [searchQuery, setSearchQuery] = useState('')
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

	const filteredSets = useMemo(() => {
		return sets.filter(set => matchesSearch(set.name, searchQuery))
	}, [sets, searchQuery])

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

	const setsLabel = filteredSets.length === 1 ? 'set' : 'sets'
	const subtitle = searchQuery 
		? `${filteredSets.length} ${setsLabel} Pokémon TCG (${sets.length} au total)`
		: `${filteredSets.length} sets Pokémon TCG`

	return (
		<section aria-labelledby="all-collections-title">
			<PageHeader
				title="Toutes les collections"
				id="all-collections-title"
				subtitle={subtitle}
			/>
			<SearchContainer>
				<Input
					type="text"
					placeholder="Rechercher une collection (ex: Vainqueurs Suprêmes, Base, XY)..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					inputSize="md"
				/>
			</SearchContainer>
			{filteredSets.length === 0 ? (
				<EmptyState message={`Aucun set trouvé pour "${searchQuery}"`} />
			) : (
				<Grid>
					{filteredSets.map(set => {
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
								{isFollowed ? '✓ Ajouté' : '+ Ajouter'}
							</FollowButton>
						</SetCardContainer>
					)
				})}
			</Grid>
			)}
		</section>
	)
}
