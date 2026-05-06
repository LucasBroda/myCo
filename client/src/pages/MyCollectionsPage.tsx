import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Input } from '@components/ui/Input'
import { PageHeader } from '@components/layout/PageHeader'
import { SetCard } from '@components/pokemon/SetCard'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['6']};
	max-width: 500px;
`

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
	gap: ${({ theme }) => theme.spacing['4']};
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

export default function MyCollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore()
	const navigate = useNavigate()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const [followedSetIds, collection, allSets] = await Promise.all([
				collectionService.getFollowedSets(),
				collectionService.getCollection(),
				cardsService.getSets(),
			])
			setCollection(collection)
			
			// Filter only followed sets
			const followedSets = allSets.filter(set => followedSetIds.includes(set.id))
			setSets(followedSets)
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

	if (isLoading) return <Spinner center label="Chargement de vos collections…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (sets.length === 0) {
		return (
			<section aria-labelledby="my-collections-title">
				<PageHeader
					title="Mes collections"
					id="my-collections-title"
					subtitle="Aucune collection suivie"
				/>
				<EmptyState message="Vous ne suivez aucune collection. Allez dans 'Toutes les collections' pour en ajouter." />
			</section>
		)
	}

	const collectionsLabel = filteredSets.length > 1 ? 'collections suivies' : 'collection suivie'
	const subtitle = searchQuery
		? `${filteredSets.length} ${collectionsLabel} (${sets.length} au total)`
		: `${filteredSets.length} ${collectionsLabel}`

	return (
		<section aria-labelledby="my-collections-title">
			<PageHeader
				title="Mes collections"
				id="my-collections-title"
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
				<EmptyState message={`Aucune collection trouvée pour "${searchQuery}"`} />
			) : (
				<Grid>
					{filteredSets.map(set => (
					<SetCard
						key={set.id}
						set={set}
						ownedCount={getOwnedCount(set.id)}
						onClick={() => navigate(`/collections/${set.id}`)}
					/>
					))}
				</Grid>
			)}
		</section>
	)
}
