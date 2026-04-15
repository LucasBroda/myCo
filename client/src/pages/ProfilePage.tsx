import type { CollectionStats, PlannedPurchase, AcquiredCard } from '@/types/models'
import { Card } from '@components/ui/Card'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { PageHeader } from '@components/layout/PageHeader'
import { SectionTitle } from '@components/layout/SectionTitle'
import { collectionService } from '@services/collectionService'
import { profileService } from '@services/profileService'
import { useEffect, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import styled, { createGlobalStyle } from 'styled-components'

// ─── DayPicker custom tokens ──────────────────────────────────────────────────

const DayPickerOverride = createGlobalStyle`
	.rdp-root {
		--rdp-accent-color: #d97706;
		--rdp-accent-background-color: #fef3c7;
	}
`

// ─── Layout ──────────────────────────────────────────────────────────────────

const PageGrid = styled.div`
	display: grid;
	grid-template-columns: 1fr;
	gap: ${({ theme }) => theme.spacing['6']};

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: 1fr 1fr;
	}
`

const FullWidth = styled.div`
	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-column: 1 / -1;
	}
`

// ─── CollectionValueCard ──────────────────────────────────────────────────────

const StatsRow = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: ${({ theme }) => theme.spacing['4']};
`

const StatItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const StatValue = styled.span`
	font-size: ${({ theme }) => theme.font.size['2xl']};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const StatLabel = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

function formatEuros(value: number) {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
	}).format(value)
}

function CollectionValueCard({ stats }: { stats: CollectionStats }) {
	return (
		<Card>
			<SectionTitle>Résumé de la collection</SectionTitle>
			<StatsRow>
				<StatItem>
					<StatValue>{stats.totalCards}</StatValue>
					<StatLabel>Cartes possédées</StatLabel>
				</StatItem>
				<StatItem>
					<StatValue>{formatEuros(stats.totalSpent)}</StatValue>
					<StatLabel>Total dépensé</StatLabel>
				</StatItem>
				<StatItem>
					<StatValue>{formatEuros(stats.estimatedValue)}</StatValue>
					<StatLabel>Valeur estimée</StatLabel>
				</StatItem>
			</StatsRow>
		</Card>
	)
}

// ─── SpendingChart ────────────────────────────────────────────────────────────

function SpendingChart({ stats }: { stats: CollectionStats }) {
	if (stats.byMonth.length === 0) {
		return (
			<Card>
				<SectionTitle>Dépenses mensuelles</SectionTitle>
				<EmptyState message="Aucune dépense enregistrée." icon="📊" />
			</Card>
		)
	}

	const data = stats.byMonth.map(m => ({
		month: m.month,
		depenses: m.totalSpent,
	}))

	return (
		<Card>
			<SectionTitle>Dépenses mensuelles</SectionTitle>
			<ResponsiveContainer width="100%" height={220}>
				<BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
					<CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
					<XAxis
						dataKey="month"
						tick={{ fontSize: 12, fill: '#78716c' }}
						axisLine={{ stroke: '#e7e5e4' }}
						tickLine={false}
					/>
					<YAxis
						tick={{ fontSize: 12, fill: '#78716c' }}
						axisLine={false}
						tickLine={false}
						tickFormatter={v => `${v}€`}
					/>
					<Tooltip
						formatter={value =>
							typeof value === 'number'
								? [formatEuros(value), 'Dépenses']
								: [String(value), 'Dépenses']
						}
						contentStyle={{
							border: '1px solid #e7e5e4',
							borderRadius: '8px',
							fontSize: '13px',
						}}
					/>
					<Bar dataKey="depenses" fill="#d97706" radius={[4, 4, 0, 0]} />
				</BarChart>
			</ResponsiveContainer>
		</Card>
	)
}

// ─── PurchaseCalendar ─────────────────────────────────────────────────────────

function PurchaseCalendar({ planned }: { planned: PlannedPurchase[] }) {
	const plannedDates = planned.map(p => new Date(p.plannedDate))

	return (
		<Card>
			<SectionTitle>Achats planifiés</SectionTitle>
			{planned.length === 0 ? (
				<EmptyState message="Aucun achat planifié." icon="📅" />
			) : (
				<>
					<DayPickerOverride />
					<DayPicker
						mode="multiple"
						selected={plannedDates}
						footer={
							<p
								style={{ margin: 0, fontSize: '13px', color: '#78716c' }}
								aria-live="polite"
							>
								{planned.length} achat{planned.length > 1 ? 's' : ''} planifié
								{planned.length > 1 ? 's' : ''}
							</p>
						}
					/>
				</>
			)}
		</Card>
	)
}

// ─── RecentAcquisitionsList ───────────────────────────────────────────────────

const AcqList = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;
`

const AcqItem = styled.li`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${({ theme }) => `${theme.spacing['3']} 0`};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};

	&:last-child {
		border-bottom: none;
	}
`

const AcqInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const AcqCardId = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const AcqMeta = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
`

const AcqPrice = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const LoadMoreBtn = styled.button`
	margin-top: ${({ theme }) => theme.spacing['3']};
	width: 100%;
	padding: ${({ theme }) => theme.spacing['2']};
	background: none;
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	cursor: pointer;
	font-family: inherit;
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
	}
`

const PAGE_SIZE = 20

function RecentAcquisitionsList({ cards }: { cards: AcquiredCard[] }) {
	const [page, setPage] = useState(1)
	const visible = cards.slice(0, page * PAGE_SIZE)
	const remaining = cards.length - visible.length

	if (cards.length === 0) {
		return (
			<Card>
				<SectionTitle>Acquisitions récentes</SectionTitle>
				<EmptyState message="Aucune carte acquise pour l'instant." />
			</Card>
		)
	}

	return (
		<Card>
			<SectionTitle>Acquisitions récentes</SectionTitle>
			<AcqList>
				{visible.map(card => (
					<AcqItem key={card.id}>
						<AcqInfo>
							<AcqCardId>{card.cardName}</AcqCardId>
							<AcqMeta>
								{card.setName} · {new Date(card.acquiredDate).toLocaleDateString('fr-FR')} ·{' '}
								{card.condition}
							</AcqMeta>
						</AcqInfo>
						<AcqPrice>
							{card.pricePaid !== null ? formatEuros(card.pricePaid) : '—'}
						</AcqPrice>
					</AcqItem>
				))}
			</AcqList>
			{remaining > 0 && (
				<LoadMoreBtn type="button" onClick={() => setPage(p => p + 1)}>
					Charger plus ({remaining} restante{remaining > 1 ? 's' : ''})
				</LoadMoreBtn>
			)}
		</Card>
	)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
	const [stats, setStats] = useState<CollectionStats | null>(null)
	const [acquisitions, setAcquisitions] = useState<AcquiredCard[]>([])
	const [planned, setPlanned] = useState<PlannedPurchase[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const [statsData, collectionData, plannedData] = await Promise.all([
				collectionService.getStats(),
				collectionService.getCollectionWithDetails(),
				profileService.getPlanned(),
			])
			setStats(statsData)
			setAcquisitions(
				[...collectionData].sort(
					(a, b) =>
						new Date(b.acquiredDate).getTime() -
						new Date(a.acquiredDate).getTime()
				)
			)
			setPlanned(plannedData)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadData()
	}, [])

	if (isLoading) return <Spinner center label="Chargement du profil…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (!stats) return null

	return (
		<section aria-labelledby="profile-title">
			<PageHeader title="Mon Profil" id="profile-title" />
			<PageGrid>
				<FullWidth>
					<CollectionValueCard stats={stats} />
				</FullWidth>
				<SpendingChart stats={stats} />
				<PurchaseCalendar planned={planned} />
				<FullWidth>
					<RecentAcquisitionsList cards={acquisitions} />
				</FullWidth>
			</PageGrid>
		</section>
	)
}
