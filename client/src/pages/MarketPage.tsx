import type { MarketPrice, PokemonCard } from '@/types/models'
import { Badge } from '@components/ui/Badge'
import { Card } from '@components/ui/Card'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Input } from '@components/ui/Input'
import { Spinner } from '@components/ui/Spinner'
import { PageHeader } from '@components/layout/PageHeader'
import { SectionTitle } from '@components/layout/SectionTitle'
import { PriceTag } from '@components/pokemon/PriceTag'
import { marketService } from '@services/marketService'
import { useDebounce } from '@hooks/useDebounce'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

// ─── Layout ──────────────────────────────────────────────────────────────────

const PageLayout = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: ${({ theme }) => theme.spacing['6']};

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: 1fr 380px;
	}
`

const LeftPane = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};
`

// ─── SearchBar ────────────────────────────────────────────────────────────────

const SearchWrapper = styled.div`
	position: relative;
`

const SearchHint = styled.p`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
	margin: ${({ theme }) => `${theme.spacing['1']} 0 0`};
`

interface SearchBarProps {
	onSearch: (query: string) => void
}

function MarketSearchBar({ onSearch }: SearchBarProps) {
	const [value, setValue] = useState('')
	const debounced = useDebounce(value, 300)

	useEffect(() => {
		onSearch(debounced)
	}, [debounced, onSearch])

	return (
		<SearchWrapper>
			<label
				htmlFor="market-search"
				style={{
					display: 'block',
					fontSize: '14px',
					fontWeight: 500,
					marginBottom: '4px',
				}}
			>
				Rechercher une carte
			</label>
			<Input
				id="market-search"
				type="search"
				value={value}
				onChange={e => setValue(e.target.value)}
				placeholder="Ex : Dracaufeu, Pikachu VMAX…"
				autoComplete="off"
			/>
			<SearchHint>Résultats mis à jour automatiquement</SearchHint>
		</SearchWrapper>
	)
}

// ─── DealCard ─────────────────────────────────────────────────────────────────

interface MarketCard extends PokemonCard {
	market: MarketPrice
}

interface DealCard extends MarketCard {
	discountPercent: number
}

const DealItem = styled.li`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => `${theme.spacing['3']} 0`};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	cursor: pointer;

	&:last-child {
		border-bottom: none;
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		margin: 0 -${({ theme }) => theme.spacing['3']};
		padding-left: ${({ theme }) => theme.spacing['3']};
		padding-right: ${({ theme }) => theme.spacing['3']};
		border-radius: ${({ theme }) => theme.radii.md};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
	}
`

const DealCardImg = styled.img`
	width: 48px;
	height: 68px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.sm};
	flex-shrink: 0;
`

const DealInfo = styled.div`
	flex: 1;
	min-width: 0;
`

const DealName = styled.span`
	display: block;
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

const DealSet = styled.span`
	display: block;
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
`

const DealPrices = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
	flex-shrink: 0;
`

function DealsList({
	deals,
	onSelect,
}: {
	deals: DealCard[]
	onSelect: (card: DealCard) => void
}) {
	if (deals.length === 0) {
		return <EmptyState message="Aucun deal disponible." icon="🏷️" />
	}

	return (
		<Card>
			<SectionTitle>Meilleures offres du moment</SectionTitle>
			<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{deals.map(deal => (
					<DealItem
						key={deal.id}
						tabIndex={0}
						role="button"
						onClick={() => onSelect(deal)}
						onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(deal)}
						aria-label={`${deal.name} — ${deal.discountPercent}% sous le marché`}
					>
						<DealCardImg
							src={deal.images.small}
							alt={`${deal.name} — ${deal.number} ${deal.set.name}`}
							loading="lazy"
						/>
						<DealInfo>
							<DealName>{deal.name}</DealName>
							<DealSet>
								{deal.set.name} · #{deal.number}
							</DealSet>
						</DealInfo>
						<DealPrices>
							<Badge variant="forest" size="sm">
								-{deal.discountPercent}%
							</Badge>
							<PriceTag price={deal.market.cardMarketPrice} variant="deal" />
						</DealPrices>
					</DealItem>
				))}
			</ul>
		</Card>
	)
}

// ─── SearchResults ────────────────────────────────────────────────────────────

const ResultItem = styled.li`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => `${theme.spacing['3']} 0`};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	cursor: pointer;

	&:last-child {
		border-bottom: none;
	}

	&:hover,
	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
	}
`

const ResultImg = styled.img`
	width: 40px;
	height: 56px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.sm};
	flex-shrink: 0;
`

const ResultInfo = styled.div`
	flex: 1;
	min-width: 0;
`

const ResultName = styled.span`
	display: block;
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const ResultMeta = styled.span`
	display: block;
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
`

function SearchResults({
	results,
	onSelect,
}: {
	results: MarketCard[]
	onSelect: (card: MarketCard) => void
}) {
	if (results.length === 0) {
		return <EmptyState message="Aucun résultat pour cette recherche." icon="🔍" />
	}

	return (
		<Card>
			<SectionTitle>Résultats ({results.length})</SectionTitle>
			<ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
				{results.map(card => (
					<ResultItem
						key={card.id}
						tabIndex={0}
						role="button"
						onClick={() => onSelect(card)}
						onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onSelect(card)}
						aria-label={`${card.name} — ${card.set.name}`}
					>
						<ResultImg
							src={card.images.small}
							alt={`${card.name} — ${card.number} ${card.set.name}`}
							loading="lazy"
						/>
						<ResultInfo>
							<ResultName>{card.name}</ResultName>
							<ResultMeta>
								{card.set.name} · #{card.number}
							</ResultMeta>
						</ResultInfo>
						<PriceTag price={card.market?.cardMarketPrice ?? null} />
					</ResultItem>
				))}
			</ul>
		</Card>
	)
}

// ─── PriceComparisonPanel ─────────────────────────────────────────────────────

const PanelHeader = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
	margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const PanelImg = styled.img`
	width: 64px;
	height: 90px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.md};
	flex-shrink: 0;
`

const PanelName = styled.h3`
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 4px;
`

const PriceRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${({ theme }) => `${theme.spacing['3']} 0`};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};

	&:last-of-type {
		border-bottom: none;
	}
`

const PriceSource = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const BuyLink = styled.a`
	display: inline-flex;
	align-items: center;
	padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['3']}`};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
		border-radius: ${({ theme }) => theme.radii.md};
	}
`

const EmptyPanel = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing['3']};
	height: 200px;
	color: ${({ theme }) => theme.colors.textMuted};
	font-size: ${({ theme }) => theme.font.size.sm};
	text-align: center;
	padding: ${({ theme }) => theme.spacing['4']};
`

function PriceComparisonPanel({
	card,
}: {
	card: MarketCard | DealCard | null
}) {
	const [price, setPrice] = useState<MarketPrice | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!card) return
		void (async () => {
			setLoading(true)
			setError(null)
			try {
				setPrice(await marketService.compare(card.id))
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erreur de chargement')
			} finally {
				setLoading(false)
			}
		})()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [card?.id])

	return (
		<Card style={{ position: 'sticky', top: '24px' }}>
			<SectionTitle>Comparateur de prix</SectionTitle>

			{!card && (
				<EmptyPanel>
					Sélectionnez une carte pour comparer les prix
				</EmptyPanel>
			)}

			{card && (
				<>
					<PanelHeader>
						<PanelImg
							src={card.images.small}
							alt={`${card.name} — ${card.number} ${card.set.name}`}
						/>
						<div>
							<PanelName>{card.name}</PanelName>
							<span
								style={{ fontSize: '13px', color: '#78716c' }}
							>{`${card.set.name} · #${card.number}`}</span>
						</div>
					</PanelHeader>

					{loading && <Spinner center size="sm" label="Chargement des prix…" />}
					{error && (
						<p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>
							{error}
						</p>
					)}

					{price && !loading && (
						<>
							<PriceRow>
								<PriceSource>CardMarket</PriceSource>
								<div
									style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
								>
									<PriceTag price={price.cardMarketPrice} />
									{price.cardMarketUrl && (
										<BuyLink
											href={price.cardMarketUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`Acheter ${card.name} sur CardMarket`}
										>
											Acheter
										</BuyLink>
									)}
								</div>
							</PriceRow>
							<PriceRow>
								<PriceSource>eBay</PriceSource>
								<div
									style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
								>
									<PriceTag price={price.ebayPrice} />
									{price.ebayUrl && (
										<BuyLink
											href={price.ebayUrl}
											target="_blank"
											rel="noopener noreferrer"
											aria-label={`Acheter ${card.name} sur eBay`}
										>
											Acheter
										</BuyLink>
									)}
								</div>
							</PriceRow>
						</>
					)}
				</>
			)}
		</Card>
	)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketPage() {
	const [query, setQuery] = useState('')
	const [searchResults, setSearchResults] = useState<MarketCard[]>([])
	const [deals, setDeals] = useState<DealCard[]>([])
	const [selectedCard, setSelectedCard] = useState<MarketCard | DealCard | null>(null)
	const [isSearching, setIsSearching] = useState(false)
	const [isLoadingDeals, setIsLoadingDeals] = useState(true)
	const [searchError, setSearchError] = useState<string | null>(null)
	const [dealsError, setDealsError] = useState<string | null>(null)

	// Load deals on mount
	useEffect(() => {
		marketService
			.getDeals()
			.then(d => setDeals(d as unknown as DealCard[]))
			.catch(err =>
				setDealsError(err instanceof Error ? err.message : 'Erreur de chargement')
			)
			.finally(() => setIsLoadingDeals(false))
	}, [])

	// Trigger search when debounced query changes
	const handleSearch = useCallback((q: string) => {
		setQuery(q)
		if (!q.trim()) {
			setSearchResults([])
			setSearchError(null)
			return
		}
		setIsSearching(true)
		setSearchError(null)
		marketService
			.search(q)
			.then(r => setSearchResults(r as unknown as MarketCard[]))
			.catch(err =>
				setSearchError(err instanceof Error ? err.message : 'Erreur de recherche')
			)
			.finally(() => setIsSearching(false))
	}, [])

	const showSearch = !!query.trim()

	return (
		<section aria-labelledby="market-title">
			<PageHeader title="Marché" id="market-title" />
			<PageLayout>
				<LeftPane>
					<MarketSearchBar onSearch={handleSearch} />

					{showSearch ? (
						isSearching ? (
							<Spinner center label="Recherche en cours…" />
						) : searchError ? (
							<ErrorState message={searchError} />
						) : (
							<SearchResults results={searchResults} onSelect={setSelectedCard} />
						)
					) : isLoadingDeals ? (
						<Spinner center label="Chargement des deals…" />
					) : dealsError ? (
						<ErrorState message={dealsError} />
					) : (
						<DealsList deals={deals} onSelect={setSelectedCard} />
					)}
				</LeftPane>

				<PriceComparisonPanel card={selectedCard} />
			</PageLayout>
		</section>
	)
}
