import type { PokemonCard, PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Input } from '@components/ui/Input'
import { FilterBar, type FilterOption } from '@components/layout/FilterBar'
import { PageHeader } from '@components/layout/PageHeader'
import { CardThumbnail } from '@components/pokemon/CardThumbnail'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

// ─── Styled Components ────────────────────────────────────────────────────────

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	max-width: 500px;
`

const CardGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: ${({ theme }) => theme.spacing['3']};
`

const StatsContainer = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing['4']};
	margin-bottom: ${({ theme }) => theme.spacing['6']};
	padding: ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	flex-wrap: wrap;
`

const StatItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
`

const StatLabel = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const StatValue = styled.span`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const ChartContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['6']};
	padding: ${({ theme }) => theme.spacing['6']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
`

const ChartHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	cursor: pointer;
	user-select: none;

	&:hover span {
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

const ChartTitle = styled.h3`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0;
`

const ToggleButton = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing['2']};
	font-size: ${({ theme }) => theme.font.size['2xl']};
	color: ${({ theme }) => theme.colors.textSecondary};
	pointer-events: none;
	transition: color ${({ theme }) => theme.transitions.fast};
`

const ChartContent = styled.div<{ $isExpanded: boolean }>`
	max-height: ${({ $isExpanded }) => ($isExpanded ? '2000px' : '0')};
	overflow: ${({ $isExpanded }) => ($isExpanded ? 'visible' : 'hidden')};
	transition: max-height ${({ theme }) => theme.transitions.base};
`

const ChartWrapper = styled.div`
	height: 400px;
	width: 100%;
`

const LegendContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${({ theme }) => theme.spacing['3']};
	margin-top: ${({ theme }) => theme.spacing['4']};
	justify-content: center;
`

const LegendItem = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	transition: transform 0.2s ease;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
`

const SetLogo = styled.img`
	width: 32px;
	height: 32px;
	object-fit: contain;
`

const LegendText = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const LegendSetName = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const LegendCount = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const ColorDot = styled.div<{ color: string }>`
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background-color: ${({ color }) => color};
	flex-shrink: 0;
`

// ─── Search & Filter Functions ────────────────────────────────────────────────

// Mapping français -> anglais pour les termes Pokémon
const frenchToEnglishTerms: Record<string, string[]> = {
	// Types
	'feu': ['fire'],
	'eau': ['water'],
	'plante': ['grass'],
	'électrik': ['lightning', 'electric'],
	'electrique': ['lightning', 'electric'],
	'psy': ['psychic'],
	'combat': ['fighting'],
	'ténèbres': ['darkness', 'dark'],
	'métal': ['metal'],
	'fée': ['fairy'],
	'dragon': ['dragon'],
	'incolore': ['colorless'],
	// Raretés
	'commune': ['common'],
	'peu commune': ['uncommon'],
	'rare': ['rare'],
	'holo': ['holo'],
	'ultra': ['ultra'],
	'secrète': ['secret'],
	'arc-en-ciel': ['rainbow'],
	'brillant': ['shining', 'shiny', 'brilliant'],
	'illustration': ['illustration'],
	'hyper': ['hyper'],
	'amazing': ['amazing'],
	'radiant': ['radiant'],
	// Termes généraux
	'dresseur': ['trainer'],
	'énergie': ['energy'],
	'support': ['supporter'],
	'objet': ['item'],
	'stade': ['stadium'],
	'évolution': ['evolution'],
	'base': ['basic'],
	'niveau': ['level'],
}

function normalizeString(str: string | undefined | null): string {
	if (!str) return ''
	return str
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '') // Retire les accents
		.trim()
}

function matchesCardSearch(card: PokemonCard, searchQuery: string): boolean {
	if (!searchQuery) return true

	const normalizedQuery = normalizeString(searchQuery)
	const normalizedName = normalizeString(card.name)
	const normalizedNumber = normalizeString(card.number)
	const normalizedRarity = normalizeString(card.rarity)
	const normalizedSetName = normalizeString(card.set.name)

	// Recherche directe dans le nom, numéro, rareté ou nom du set
	if (normalizedName.includes(normalizedQuery)) return true
	if (normalizedNumber.includes(normalizedQuery)) return true
	if (normalizedRarity.includes(normalizedQuery)) return true
	if (normalizedSetName.includes(normalizedQuery)) return true

	// Recherche via le mapping français-anglais
	for (const [frenchTerm, englishTerms] of Object.entries(frenchToEnglishTerms)) {
		const normalizedFrench = normalizeString(frenchTerm)
		if (normalizedFrench.includes(normalizedQuery) || normalizedQuery.includes(normalizedFrench)) {
			// Si le terme français correspond, vérifier si un des termes anglais est dans la carte
			const matches = englishTerms.some(englishTerm => {
				const normalized = normalizeString(englishTerm)
				return normalizedName.includes(normalized) || 
				       normalizedRarity.includes(normalized)
			})
			if (matches) return true
		}
	}

	return false
}

// Rarity order from most common to rarest
const rarityOrder: Record<string, number> = {
	'Common': 1,
	'Uncommon': 2,
	'Rare': 3,
	'Rare Holo': 4,
	'Double Rare': 5,
	'Rare Holo EX': 6,
	'Rare Holo GX': 7,
	'Rare Holo V': 8,
	'Rare Holo VMAX': 9,
	'Rare Holo VSTAR': 10,
	'Rare Ultra': 11,
	'Illustration Rare': 12,
	'Rare ACE': 13,
	'Rare BREAK': 14,
	'Amazing Rare': 15,
	'Radiant Rare': 16,
	'Rare Shining': 17,
	'Rare Shiny': 18,
	'Rare Shiny GX': 19,
	'Ultra Rare': 20,
	'Special Illustration Rare': 21,
	'Hyper Rare': 22,
	'Rare Secret': 23,
	'Rare Rainbow': 24,
	'LEGEND': 25,
	'Promo': 26,
}

// Modern color palette for the pie chart
const CHART_COLORS = [
	'#3b82f6', // blue
	'#8b5cf6', // purple
	'#ec4899', // pink
	'#f59e0b', // amber
	'#10b981', // emerald
	'#06b6d4', // cyan
	'#f97316', // orange
	'#6366f1', // indigo
	'#14b8a6', // teal
	'#a855f7', // violet
	'#ef4444', // red
	'#84cc16', // lime
]

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MyCardsPage() {
	const [cards, setCards] = useState<PokemonCard[]>([])
	const [sets, setSets] = useState<Map<string, PokemonSet>>(new Map())
	const [searchQuery, setSearchQuery] = useState('')
	const [rarityFilter, setRarityFilter] = useState<string>('all')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isChartExpanded, setIsChartExpanded] = useState(true)
	const { acquiredMap, setCollection } = useCollectionStore()
	const navigate = useNavigate()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const collection = await collectionService.getCollection()
			setCollection(collection)

			// Récupérer les IDs des cartes possédées
			const ownedCardIds = Object.keys(acquiredMap)

			if (ownedCardIds.length === 0) {
				setCards([])
				setIsLoading(false)
				return
			}

			// Récupérer les détails de toutes les cartes possédées
			// Grouper par setId pour optimiser les requêtes
			const cardsBySet = new Map<string, string[]>()
			for (const card of collection) {
				if (!cardsBySet.has(card.setId)) {
					cardsBySet.set(card.setId, [])
				}
				const setCards = cardsBySet.get(card.setId)
				if (setCards) {
					setCards.push(card.cardId)
				}
			}

			// Récupérer les cartes de chaque set
			const allCardsPromises = Array.from(cardsBySet.entries()).map(async ([setId]) => {
				const setData = await cardsService.getSet(setId)
				return setData
			})

			const allSetsData = await Promise.all(allCardsPromises)
			const allCards = allSetsData.flatMap(setData => setData.cards)
			
			// Stocker les informations des sets avec leurs logos
			const setsMap = new Map<string, PokemonSet>()
			for (const setData of allSetsData) {
				setsMap.set(setData.set.id, setData.set)
			}
			setSets(setsMap)

			// Filtrer pour ne garder que les cartes possédées
			const ownedCards = allCards.filter(card => ownedCardIds.includes(card.id))

			// Trier par nom de set puis par numéro de carte
			const sortedCards = [...ownedCards].sort((a, b) => {
				// D'abord par set
				const setCompare = a.set.name.localeCompare(b.set.name)
				if (setCompare !== 0) return setCompare

				// Ensuite par numéro
				const numA = Number.parseInt(a.number.replaceAll(/\D/g, ''), 10) || 0
				const numB = Number.parseInt(b.number.replaceAll(/\D/g, ''), 10) || 0
				if (numA !== numB) return numA - numB
				return a.number.localeCompare(b.number)
			})

			setCards(sortedCards)
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

	// Extract unique rarities from cards and sort by rarity order
	const availableRarities = useMemo(() => {
		return Array.from(new Set(cards.map(c => c.rarity))).sort((a, b) => {
			const orderA = rarityOrder[a] ?? 999
			const orderB = rarityOrder[b] ?? 999
			if (orderA !== orderB) return orderA - orderB
			return a.localeCompare(b)
		})
	}, [cards])

	const rarityOptions: FilterOption<string>[] = useMemo(() => {
		return [
			{ value: 'all', label: 'Toutes les raretés' },
			...availableRarities.map(rarity => ({ value: rarity, label: rarity })),
		]
	}, [availableRarities])

	// Apply filters
	const filteredCards = useMemo(() => {
		return cards.filter(card => {
			// Filter by search query
			if (!matchesCardSearch(card, searchQuery)) return false
			
			// Filter by rarity
			if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false
			
			return true
		})
	}, [cards, searchQuery, rarityFilter])

	// Calculate stats
	const totalCards = cards.length
	const uniqueSets = new Set(cards.map(c => c.set.id)).size
	const totalCopies = Object.values(acquiredMap).flat().length

	// Calculate chart data - cards distribution by set
	const chartData = useMemo(() => {
		const setDistribution = new Map<string, number>()
		
		// Count cards per set
		for (const card of cards) {
			const count = setDistribution.get(card.set.id) || 0
			setDistribution.set(card.set.id, count + 1)
		}

		// Convert to chart format with set info
		return Array.from(setDistribution.entries())
			.map(([setId, count], index) => {
				const set = sets.get(setId)
				return {
					name: set?.name || setId,
					value: count,
					setId,
					logo: set?.images.logo,
					symbol: set?.images.symbol,
					color: CHART_COLORS[index % CHART_COLORS.length],
				}
			})
			.sort((a, b) => b.value - a.value) // Sort by count descending
	}, [cards, sets])

	function handleCardClick(card: PokemonCard) {
		navigate(`/collections/${card.set.id}`)
	}

	if (isLoading) return <Spinner center label="Chargement de vos cartes…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />

	if (cards.length === 0) {
		return (
			<section aria-labelledby="my-cards-title">
				<PageHeader
					title="Mes Cartes"
					id="my-cards-title"
					subtitle="Aucune carte dans votre collection"
				/>
				<EmptyState message="Vous n'avez pas encore de cartes. Commencez par ajouter des cartes depuis les collections." />
			</section>
		)
	}

	return (
		<section aria-labelledby="my-cards-title">
			<PageHeader
				title="Mes Cartes"
				id="my-cards-title"
				subtitle={`${totalCopies} carte${totalCopies > 1 ? 's' : ''} dans votre collection`}
			/>

			<StatsContainer>
				<StatItem>
					<StatLabel>Cartes uniques</StatLabel>
					<StatValue>{totalCards}</StatValue>
				</StatItem>
				<StatItem>
					<StatLabel>Total de copies</StatLabel>
					<StatValue>{totalCopies}</StatValue>
				</StatItem>
				<StatItem>
					<StatLabel>Sets différents</StatLabel>
					<StatValue>{uniqueSets}</StatValue>
				</StatItem>
			</StatsContainer>

			{chartData.length > 0 && (
				<ChartContainer>
					<ChartHeader
						role="button"
						tabIndex={0}
						onClick={() => setIsChartExpanded(!isChartExpanded)}
						onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsChartExpanded(!isChartExpanded)}
						aria-expanded={isChartExpanded}
						aria-controls="chart-content"
					>
						<ChartTitle>Répartition par Set</ChartTitle>
						<ToggleButton aria-hidden="true">
							{isChartExpanded ? '⌃' : '⌄'}
						</ToggleButton>
					</ChartHeader>
					<ChartContent $isExpanded={isChartExpanded} id="chart-content">
						<ChartWrapper>
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={chartData}
										cx="50%"
										cy="50%"
										labelLine={false}
										label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
										outerRadius={120}
										fill="#8884d8"
										dataKey="value"
									>
									{chartData.map((entry) => (
										<Cell key={entry.setId} fill={entry.color} />
										))}
									</Pie>
									<Tooltip 
										formatter={(value) => {
											const count = typeof value === 'number' ? value : 0
											return [`${count} carte${count > 1 ? 's' : ''}`, 'Nombre']
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</ChartWrapper>
						<LegendContainer>
							{chartData.map((entry) => (
								<LegendItem key={entry.setId}>
									<ColorDot color={entry.color} />
									{entry.logo && (
										<SetLogo src={entry.logo} alt={entry.name} />
									)}
									<LegendText>
										<LegendSetName>{entry.name}</LegendSetName>
										<LegendCount>{entry.value} carte{entry.value > 1 ? 's' : ''}</LegendCount>
									</LegendText>
								</LegendItem>
							))}
						</LegendContainer>
					</ChartContent>
				</ChartContainer>
			)}

			<SearchContainer>
				<Input
					type="text"
					placeholder="Rechercher une carte (ex: Pikachu, 025, feu, brillant)..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					inputSize="md"
				/>
			</SearchContainer>

			<FilterBar
				options={rarityOptions}
				value={rarityFilter}
				onChange={setRarityFilter}
				label="Filtrer par rareté"
			/>

			{filteredCards.length === 0 ? (
				<EmptyState message={`Aucune carte trouvée pour "${searchQuery}"`} />
			) : (
				<CardGrid>
					{filteredCards.map(card => (
						<CardThumbnail
							key={card.id}
							card={card}
							owned={true}
							planned={false}
							onClick={() => handleCardClick(card)}
						/>
					))}
				</CardGrid>
			)}
		</section>
	)
}
