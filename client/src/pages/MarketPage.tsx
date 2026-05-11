/**
 * MarketPage - Version alternative de PageMarche (imports anglais)
 * 
 * REMARQUE : Ce fichier est un doublon de PageMarche.tsx avec des imports anglais.
 * Fonctionnalité identique : recherche et comparaison de prix de cartes Pokémon.
 * 
 * Voir PageMarche.tsx pour la documentation complète.
 */

import type { MarketPrice, PokemonCard } from '@/types/models'
import { Card } from '@components/ui/Card'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Input } from '@components/ui/Input'
import { Spinner } from '@components/ui/Spinner'
import { Modal } from '@components/ui/Modal'
import { PageHeader } from '@components/layout/PageHeader'
import { SectionTitle } from '@components/layout/SectionTitle'
import { SearchIcon } from '@components/ui/Icons'
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
		grid-template-columns: 1fr 400px;
	}
`

const LeftPane = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};
`

const RightPane = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		position: sticky;
		top: 0;
		align-self: flex-start;
		max-height: 100vh;
		overflow-y: auto;
	}
`

// Spacer invisible pour aligner le RightPane avec les résultats de recherche
const SearchBarSpacer = styled.div`
	@media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
		display: none;
	}
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
	readonly onSearch: (query: string) => void
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface MarketCard extends PokemonCard {
	market: MarketPrice
}

// ─── SearchResults ────────────────────────────────────────────────────────────

const WelcomeCard = styled(Card)`
	text-align: center;
	padding: ${({ theme }) => theme.spacing['8']};
`

const WelcomeIconWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	
	svg {
		width: 64px;
		height: 64px;
		stroke: ${({ theme }) => theme.colors.textMuted};
	}
`

const WelcomeTitle = styled.h2`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 ${({ theme }) => theme.spacing['2']};
`

const WelcomeText = styled.p`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textMuted};
	margin: 0;
`

function WelcomeMessage() {
	return (
		<WelcomeCard>
			<WelcomeIconWrapper>
				<SearchIcon size={64} />
			</WelcomeIconWrapper>
			<WelcomeTitle>Comparez les prix des cartes Pokémon</WelcomeTitle>
			<WelcomeText>
				Recherchez une carte pour comparer les prix entre CardMarket et eBay.
			</WelcomeText>
		</WelcomeCard>
	)
}

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
	readonly results: MarketCard[]
	readonly onSelect: (card: MarketCard) => void
}) {
	if (results.length === 0) {
		return <EmptyState message="Aucun résultat pour cette recherche." icon={<SearchIcon size={40} />} />
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
						<PriceTag 
							price={card.market?.cardMarketPrice ?? null}
							trend={card.market?.percentChange30d ?? null}
							showTrend={true}
						/>
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
	align-items: flex-start;
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
	padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['4']}`};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	transition: all ${({ theme }) => theme.transitions.fast};
	text-decoration: none;

	&:hover {
		background-color: ${({ theme }) => theme.colors.amberLight};
		border-color: ${({ theme }) => theme.colors.amber};
		color: ${({ theme }) => theme.colors.amber};
		transform: translateY(-1px);
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
		border-radius: ${({ theme }) => theme.radii.md};
	}

	&:active {
		transform: translateY(0);
	}
`

function PriceComparisonPanel({
	card,
}: {
	readonly card: MarketCard | null
}) {
	const [price, setPrice] = useState<MarketPrice | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!card) {
			setPrice(null)
			return
		}
		void (async () => {
			setLoading(true)
			setError(null)
			try {
				const priceData = await marketService.compare(card.id)
				setPrice(priceData)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erreur de chargement')
			} finally {
				setLoading(false)
			}
		})()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [card?.id])

	if (!card) return null

	return (
		<Card>
			<SectionTitle>Liens d'achat 🛒</SectionTitle>

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
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
							<PriceTag price={price.cardMarketPrice} />
							{price.cardMarketUrl && (
								<BuyLink
									href={price.cardMarketUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Voir ${card.name} sur CardMarket`}
								>
									Voir l'offre →
								</BuyLink>
							)}
						</div>
					</PriceRow>
					<PriceRow>
						<PriceSource>eBay</PriceSource>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
							<PriceTag price={price.ebayPrice} />
							{price.ebayUrl && (
								<BuyLink
									href={price.ebayUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Voir ${card.name} sur eBay`}
								>
									Voir l'offre →
								</BuyLink>
							)}
						</div>
					</PriceRow>
				</>
			)}
		</Card>
	)
}

// ─── PriceComparisonModal ─────────────────────────────────────────────────────

const ModalPanelImg = styled.img`
	width: 100%;
	max-width: 200px;
	height: auto;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.lg};
	margin: 0 auto;
	margin-top: ${({ theme }) => theme.spacing['4']};
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	display: block;
	box-shadow: ${({ theme }) => theme.shadows.lg};
`

const ModalPanelName = styled.h3`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 ${({ theme }) => theme.spacing['2']};
	text-align: center;
`

const ModalPanelMeta = styled.p`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	margin: 0 0 ${({ theme }) => theme.spacing['4']};
	text-align: center;
`

const ModalPricesContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.surface};
	border-radius: ${({ theme }) => theme.radii.lg};
	border: 1px solid ${({ theme }) => theme.colors.border};
`

const ModalPriceRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.bg};
	border-radius: ${({ theme }) => theme.radii.md};
	border: 1px solid ${({ theme }) => theme.colors.border};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}
`

const ModalPriceSource = styled.span`
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const ModalPriceInfo = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: ${({ theme }) => theme.spacing['2']};
`

function PriceComparisonModal({
	card,
	isOpen,
	onClose,
}: {
	readonly card: MarketCard | null
	readonly isOpen: boolean
	readonly onClose: () => void
}) {
	const [price, setPrice] = useState<MarketPrice | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (!card || !isOpen) {
			setPrice(null)
			return
		}
		void (async () => {
			setLoading(true)
			setError(null)
			try {
				const priceData = await marketService.compare(card.id)
				setPrice(priceData)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Erreur de chargement')
			} finally {
				setLoading(false)
			}
		})()
	}, [card?.id, isOpen])

	if (!card || !isOpen) return null

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Liens d'achat 🛒"
		>
			<ModalPanelImg
				src={card.images.small}
				alt={`${card.name} — ${card.number} ${card.set.name}`}
			/>
			<ModalPanelName>{card.name}</ModalPanelName>
			<ModalPanelMeta>{`${card.set.name} · #${card.number}`}</ModalPanelMeta>

			{loading && (
				<div style={{ padding: '16px 0' }}>
					<Spinner center size="sm" label="Chargement des prix…" />
				</div>
			)}
			{error && (
				<p style={{ 
					fontSize: '14px', 
					color: '#b91c1c', 
					margin: 0, 
					textAlign: 'center',
					padding: '12px',
					backgroundColor: '#fee2e2',
					borderRadius: '8px'
				}}>
					{error}
				</p>
			)}

			{price && !loading && (
				<ModalPricesContainer>
					<ModalPriceRow>
						<ModalPriceSource>CardMarket</ModalPriceSource>
						<ModalPriceInfo>
							<PriceTag price={price.cardMarketPrice} />
							{price.cardMarketUrl && (
								<BuyLink
									href={price.cardMarketUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Voir ${card.name} sur CardMarket`}
								>
									Voir l'offre →
								</BuyLink>
							)}
						</ModalPriceInfo>
					</ModalPriceRow>
					<ModalPriceRow>
						<ModalPriceSource>eBay</ModalPriceSource>
						<ModalPriceInfo>
							<PriceTag price={price.ebayPrice} />
							{price.ebayUrl && (
								<BuyLink
									href={price.ebayUrl}
									target="_blank"
									rel="noopener noreferrer"
									aria-label={`Voir ${card.name} sur eBay`}
								>
									Voir l'offre →
								</BuyLink>
							)}
						</ModalPriceInfo>
					</ModalPriceRow>
				</ModalPricesContainer>
			)}
		</Modal>
	)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarketPage() {
	const [query, setQuery] = useState('')
	const [searchResults, setSearchResults] = useState<MarketCard[]>([])
	const [selectedCard, setSelectedCard] = useState<MarketCard | null>(null)
	const [isSearching, setIsSearching] = useState(false)
	const [searchError, setSearchError] = useState<string | null>(null)
	const [isModalOpen, setIsModalOpen] = useState(false)

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

	const handleSelectCard = useCallback((card: MarketCard) => {
		setSelectedCard(card)
		// Sur mobile (< 1024px), ouvrir la modale
		if (window.innerWidth < 1024) {
			setIsModalOpen(true)
		}
	}, [])

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false)
	}, [])

	const showSearch = !!query.trim()

	return (
		<section aria-labelledby="market-title">
			<PageHeader title="Marché" id="market-title" />
			<PageLayout>
				<LeftPane>
					<MarketSearchBar onSearch={handleSearch} />

					{showSearch ? (
						<>
							{isSearching && <Spinner center label="Recherche en cours…" />}
							{!isSearching && searchError && <ErrorState message={searchError} />}
							{!isSearching && !searchError && (
								<SearchResults results={searchResults} onSelect={handleSelectCard} />
							)}
						</>
					) : (
						<WelcomeMessage />
					)}
				</LeftPane>

				<RightPane>
					<SearchBarSpacer style={{ height: '88px' }} />
					<PriceComparisonPanel card={selectedCard} />
				</RightPane>
			</PageLayout>

			<PriceComparisonModal
				card={selectedCard}
				isOpen={isModalOpen}
				onClose={handleCloseModal}
			/>
		</section>
	)
}
