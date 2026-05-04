import type { CollectionStats, PlannedPurchase, AcquiredCard, PokemonCard } from '@/types/models'
import { Card } from '@components/ui/Card'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { PageHeader } from '@components/layout/PageHeader'
import { SectionTitle } from '@components/layout/SectionTitle'
import { collectionService } from '@services/collectionService'
import { profileService } from '@services/profileService'
import { cardsService } from '@services/cardsService'
import { PriceTrend } from '@components/pokemon/PriceTrend'
import { usePlannedStore } from '@store/plannedStore'
import { useToast } from '@hooks/useToast'
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

	.rdp-day.planned-date {
		background-color: #fef3c7;
		color: #d97706;
		font-weight: 600;
		border-radius: 50%;
		cursor: pointer;
	}

	.rdp-day.planned-date:hover {
		background-color: #fde68a;
	}

	.rdp-day.planned-date:active {
		background-color: #fcd34d;
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
	color: ${({ theme }) => theme.colors.amber};
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	flex-wrap: wrap;
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

const PlannedValueIndicator = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textSecondary};
	margin-left: ${({ theme }) => theme.spacing['2']};
`

interface CollectionValueCardProps {
	readonly stats: CollectionStats
	readonly planned: PlannedPurchase[]
}

function CollectionValueCard({ stats, planned }: CollectionValueCardProps) {
	// Calculer la valeur totale des achats planifiés
	const plannedTotal = planned.reduce((sum, p) => {
		return sum + (p.budget ? Number(p.budget) : 0)
	}, 0)

	// Calculer l'évolution de la valeur (plus-value ou moins-value)
	const valueChange = stats.totalSpent > 0 
		? ((stats.estimatedValue - stats.totalSpent) / stats.totalSpent) * 100 
		: null

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
					<StatValue>
						<span>{formatEuros(stats.estimatedValue)}</span>
						{valueChange !== null && stats.estimatedValue > 0 && (
							<PriceTrend percentChange={valueChange} />
						)}
						{plannedTotal > 0 && (
							<PlannedValueIndicator>
								(+ {formatEuros(plannedTotal)} prévus)
							</PlannedValueIndicator>
						)}
					</StatValue>
					<StatLabel>Valeur estimée</StatLabel>
				</StatItem>
			</StatsRow>
		</Card>
	)
}

// ─── SpendingChart ────────────────────────────────────────────────────────────

const ChartWrapper = styled.div`
	padding: ${({ theme }) => theme.spacing['2']} 0;
`

const TooltipContainer = styled.div`
	background-color: #ffffff;
	border: none;
	border-radius: 12px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
	padding: 12px 16px;
`

const TooltipItem = styled.div`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	color: #78716c;
	margin-bottom: 4px;

	&:last-child {
		margin-bottom: 0;
	}
`

const TooltipValue = styled.span`
	font-weight: 600;
	color: #d97706;
`

interface CustomTooltipProps {
	active?: boolean
	payload?: Array<{
		value: number
		dataKey: string
		payload: {
			month: string
			depenses: number
			cardCount: number
			budgetPlanifie: number
			plannedCount: number
			realBudget: number
		}
	}>
	label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
	if (!active || !payload || payload.length === 0) return null

	const data = payload[0].payload

	return (
		<TooltipContainer>
			{data.depenses > 0 && (
				<>
					<TooltipItem>
						<span>Dépenses réelles :</span>
						<TooltipValue>{formatEuros(data.depenses)}</TooltipValue>
					</TooltipItem>
					<TooltipItem>
						<span>Cartes achetées :</span>
						<TooltipValue>{data.cardCount}</TooltipValue>
					</TooltipItem>
				</>
			)}
			{data.plannedCount > 0 && (
				<>
					{data.realBudget > 0 && (
						<TooltipItem>
							<span>Budget planifié :</span>
							<TooltipValue style={{ color: '#f59e0b' }}>{formatEuros(data.realBudget)}</TooltipValue>
						</TooltipItem>
					)}
					<TooltipItem>
						<span>Achats planifiés :</span>
						<TooltipValue style={{ color: '#f59e0b' }}>{data.plannedCount}</TooltipValue>
					</TooltipItem>
				</>
			)}
		</TooltipContainer>
	)
}

interface SpendingChartProps {
	readonly stats: CollectionStats
	readonly planned: PlannedPurchase[]
}

function SpendingChart({ stats, planned }: SpendingChartProps) {
	// Agréger les budgets planifiés par mois
	const plannedByMonth = planned.reduce((acc, p) => {
		const date = new Date(p.plannedDate)
		const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
		if (!acc[monthKey]) {
			acc[monthKey] = { total: 0, count: 0 }
		}
		// Ajouter le budget seulement s'il est défini, mais compter tous les achats
		// IMPORTANT : Convertir en nombre car la DB peut retourner des strings
		if (p.budget !== null) {
			acc[monthKey].total += Number(p.budget)
		}
		acc[monthKey].count += 1
		return acc
	}, {} as Record<string, { total: number; count: number }>)


	// Créer une liste de tous les mois (réels + planifiés)
	const allMonths = new Set<string>()
	stats.byMonth.forEach(m => allMonths.add(m.month))
	Object.keys(plannedByMonth).forEach(m => allMonths.add(m))

	if (allMonths.size === 0) {
		return (
			<Card>
				<SectionTitle>Dépenses mensuelles</SectionTitle>
				<EmptyState message="Aucune dépense enregistrée." icon="📊" />
			</Card>
		)
	}

	// Formater les mois pour l'affichage (ex: "2026-05" -> "Mai 26")
	const formatMonth = (monthKey: string) => {
		const [year, month] = monthKey.split('-')
		const date = new Date(parseInt(year), parseInt(month) - 1)
		return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
	}

	// Combiner les données réelles et planifiées
	const data = Array.from(allMonths)
		.sort()
		.map(monthKey => {
			const realData = stats.byMonth.find(m => m.month === monthKey)
			const plannedData = plannedByMonth[monthKey]

			// Si des achats sont planifiés mais sans budget, utiliser une valeur indicative minimale
			const plannedValue = plannedData?.total || 0
			const plannedCountValue = plannedData?.count || 0
			// Afficher au moins 1€ par achat planifié s'il n'y a pas de budget défini
			const displayValue = plannedCountValue > 0 && plannedValue === 0 
				? plannedCountValue * 1 
				: plannedValue

			return {
				month: formatMonth(monthKey),
				monthKey,
				depenses: realData?.totalSpent || 0,
				cardCount: realData?.cardCount || 0,
				budgetPlanifie: displayValue,
				plannedCount: plannedCountValue,
				realBudget: plannedValue, // Budget réel pour le tooltip
			}
		})

	return (
		<Card>
			<SectionTitle>Dépenses mensuelles</SectionTitle>
			<ChartWrapper>
				<ResponsiveContainer width="100%" height={260}>
					<BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
						<defs>
							<linearGradient id="barGradientReal" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
								<stop offset="100%" stopColor="#059669" stopOpacity={1} />
							</linearGradient>
							<linearGradient id="barGradientPlanned" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="#fbbf24" stopOpacity={0.7} />
								<stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
							</linearGradient>
						</defs>
						<CartesianGrid 
							strokeDasharray="3 3" 
							stroke="#f5f5f4" 
							vertical={false}
							strokeOpacity={0.5}
						/>
						<XAxis
							dataKey="month"
							tick={{ fontSize: 13, fill: '#57534e', fontWeight: 500 }}
							axisLine={false}
							tickLine={false}
							dy={8}
						/>
						<YAxis
							tick={{ fontSize: 13, fill: '#78716c', fontWeight: 500 }}
							axisLine={false}
							tickLine={false}
							tickFormatter={v => `${v}€`}
							width={50}
						/>
						<Tooltip content={<CustomTooltip />} cursor={{ fill: '#fef3c7', opacity: 0.3 }} />
						<Bar 
							dataKey="depenses" 
							fill="url(#barGradientReal)" 
							radius={[8, 8, 0, 0]}
							maxBarSize={40}
							name="Dépenses réelles"
						/>
						<Bar 
							dataKey="budgetPlanifie" 
							fill="url(#barGradientPlanned)" 
							radius={[8, 8, 0, 0]}
							maxBarSize={40}
							name="Budget planifié"
						/>
					</BarChart>
				</ResponsiveContainer>
			</ChartWrapper>
		</Card>
	)
}

// ─── PurchaseCalendar ─────────────────────────────────────────────────────────

const PlannedList = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['3']};
	max-height: 280px;
	overflow-y: auto;
	scrollbar-width: thin;
	scrollbar-color: ${({ theme }) => `${theme.colors.border} transparent`};

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${({ theme }) => theme.colors.border};
		border-radius: ${({ theme }) => theme.radii.full};
	}
`

const PlannedItem = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	transition: border-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}
`

const PlannedInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
	flex: 1;
	min-width: 0;
`

const PlannedCardName = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const PlannedMeta = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const PlannedBudget = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.amber};
`

const PlannedActions = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
`

const DeleteButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	padding: 0;
	background: none;
	border: 1px solid transparent;
	border-radius: ${({ theme }) => theme.radii.md};
	color: ${({ theme }) => theme.colors.textSecondary};
	cursor: pointer;
	transition: all ${({ theme }) => theme.transitions.fast};
	flex-shrink: 0;

	svg {
		width: 16px;
		height: 16px;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.brickLight};
		border-color: ${({ theme }) => theme.colors.brickBorder};
		color: ${({ theme }) => theme.colors.brick};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
	}
`

function TrashIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
			<path d="M10 11v6M14 11v6" />
		</svg>
	)
}


const CalendarToggle = styled.button`
	padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
	background: none;
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-size: ${({ theme }) => theme.font.size.xs};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	cursor: pointer;
	font-family: inherit;
	transition: all ${({ theme }) => theme.transitions.fast};
	margin-bottom: ${({ theme }) => theme.spacing['3']};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
	}
`

const LayoutGrid = styled.div`
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-content: flex-start;
	align-items: flex-start;
	gap: ${({ theme }) => theme.spacing['10']};
`

const CalendarCell = styled.div`
	flex-shrink: 0;
	align-self: flex-start;
`

const CardCell = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 160px;
	flex-shrink: 0;
`

const CardPreviewItem = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	gap: ${({ theme }) => theme.spacing['4']};
`

const CardPreviewImage = styled.img`
	width: 160px;
	height: 224px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.md};
	box-shadow: ${({ theme }) => theme.shadows.md};
`

const CardPreviewName = styled.h4`
	margin: 0;
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	text-align: center;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const CardPreviewDetail = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	gap: ${({ theme }) => theme.spacing['2']};
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	
	& > span:last-child {
		text-align: right;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`

const CardPreviewBudget = styled.span`
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.amber};
`

const CardPreviewNotes = styled.p`
	margin: 0;
	padding: ${({ theme }) => theme.spacing['2']};
	background-color: ${({ theme }) => theme.colors.amberLight};
	border-left: 3px solid ${({ theme }) => theme.colors.amber};
	border-radius: ${({ theme }) => theme.radii.sm};
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-style: italic;
	width: 100%;
	word-wrap: break-word;
`

interface PurchaseCalendarProps {
	readonly planned: PlannedPurchase[]
	readonly onDelete: (id: string) => Promise<void>
	readonly onRefresh: () => void
}

function PurchaseCalendar({ planned, onDelete, onRefresh }: PurchaseCalendarProps) {
	const [showCalendar, setShowCalendar] = useState(false)
	const [deleting, setDeleting] = useState<string | null>(null)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [cardDetails, setCardDetails] = useState<Record<string, PokemonCard>>({})
	const { success, error: showError } = useToast()
	const plannedDates = planned.map(p => new Date(p.plannedDate))

	// Charger les détails des cartes au montage
	useEffect(() => {
		async function loadCardDetails() {
			const details: Record<string, PokemonCard> = {}
			for (const purchase of planned) {
				if (!details[purchase.cardId]) {
					try {
						const card = await cardsService.getCard(purchase.cardId)
						details[purchase.cardId] = card
					} catch (err) {
						console.error(`Failed to load card ${purchase.cardId}`, err)
					}
				}
			}
			setCardDetails(details)
		}
		if (planned.length > 0) {
			loadCardDetails()
		}
	}, [planned])

	// Trouver les achats planifiés pour la date sélectionnée
	const selectedPurchases = selectedDate
		? planned.filter(p => {
				const purchaseDate = new Date(p.plannedDate)
				return (
					purchaseDate.getDate() === selectedDate.getDate() &&
					purchaseDate.getMonth() === selectedDate.getMonth() &&
					purchaseDate.getFullYear() === selectedDate.getFullYear()
				)
		  })
		: []

	function handleDayClick(date: Date) {
		// Vérifier si cette date a des achats planifiés
		const hasPlannedPurchases = planned.some(p => {
			const purchaseDate = new Date(p.plannedDate)
			return (
				purchaseDate.getDate() === date.getDate() &&
				purchaseDate.getMonth() === date.getMonth() &&
				purchaseDate.getFullYear() === date.getFullYear()
			)
		})
		
		// Si la date a des achats planifiés, la sélectionner (ou la désélectionner si déjà sélectionnée)
		if (hasPlannedPurchases) {
			setSelectedDate(prev => {
				if (prev?.getDate() === date.getDate() &&
					prev?.getMonth() === date.getMonth() &&
					prev?.getFullYear() === date.getFullYear()) {
					return null // Désélectionner si même date
				}
				return date // Sélectionner la nouvelle date
			})
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Supprimer cet achat planifié ?')) return
		setDeleting(id)
		try {
			await onDelete(id)
			success('Achat planifié supprimé')
			onRefresh()
		} catch (err) {
			showError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
		} finally {
			setDeleting(null)
		}
	}

	return (
		<Card>
			<SectionTitle>Achats planifiés ({planned.length})</SectionTitle>
			
			{planned.length > 0 && (
				<CalendarToggle
					type="button"
					onClick={() => setShowCalendar(!showCalendar)}
				>
					{showCalendar ? '📋 Afficher la liste' : '📅 Afficher le calendrier'}
				</CalendarToggle>
			)}

			{planned.length === 0 && (
				<EmptyState message="Aucun achat planifié." icon="📅" />
			)}

			{planned.length > 0 && showCalendar && (
				<>
					<DayPickerOverride />
					<LayoutGrid>
						<CalendarCell>
							<DayPicker
								modifiers={{ planned: plannedDates }}
								modifiersClassNames={{ planned: 'planned-date' }}
								onDayClick={handleDayClick}
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
						</CalendarCell>
						{selectedPurchases.map((purchase) => {
							const card = cardDetails[purchase.cardId]
							if (!card) return null

							return (
								<CardCell key={purchase.id}>
									<CardPreviewItem>
										<CardPreviewImage
											src={card.images.small}
											alt={card.name}
											loading="lazy"
										/>
										<CardPreviewName>{purchase.cardName}</CardPreviewName>
										<CardPreviewDetail>
											<span>Collection</span>
											<span>{purchase.setName}</span>
										</CardPreviewDetail>
										<CardPreviewDetail>
											<span>État</span>
											<span>{purchase.condition}</span>
										</CardPreviewDetail>
										<CardPreviewDetail>
											<span>Date prévue</span>
											<span>
												{new Date(purchase.plannedDate).toLocaleDateString('fr-FR', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
												})}
											</span>
										</CardPreviewDetail>
										{purchase.budget !== null && (
											<CardPreviewDetail>
												<span>Budget prévu</span>
												<CardPreviewBudget>
													{formatEuros(purchase.budget)}
												</CardPreviewBudget>
											</CardPreviewDetail>
										)}
										{purchase.notes && (
											<CardPreviewNotes>{purchase.notes}</CardPreviewNotes>
										)}
									</CardPreviewItem>
								</CardCell>
							)
						})}
					</LayoutGrid>
				</>
			)}
			{planned.length > 0 && !showCalendar && (
				<PlannedList>
					{planned.map(item => (
						<PlannedItem key={item.id}>
							<PlannedInfo>
								<PlannedCardName>
									{item.cardName}
								</PlannedCardName>
								<PlannedMeta>{item.setName}</PlannedMeta>
								<PlannedMeta>
									{new Date(item.plannedDate).toLocaleDateString('fr-FR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</PlannedMeta>
								{item.notes && <PlannedMeta>{item.notes}</PlannedMeta>}
							</PlannedInfo>
							<PlannedActions>
								{item.budget !== null && (
									<PlannedBudget>{formatEuros(item.budget)}</PlannedBudget>
								)}
								<DeleteButton
									type="button"
									onClick={() => handleDelete(item.id)}
									disabled={deleting === item.id}
									aria-label="Supprimer"
									title="Supprimer cet achat planifié"
								>
									{deleting === item.id ? '⋯' : <TrashIcon />}
								</DeleteButton>
							</PlannedActions>
						</PlannedItem>
					))}
				</PlannedList>
			)}
		</Card>
	)
}

// ─── RecentAcquisitionsList ───────────────────────────────────────────────────

const SectionHeader = styled.div`
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

const AcqListWrapper = styled.div<{ $isCollapsed: boolean }>`
	max-height: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '500px')};
	overflow-y: ${({ $isCollapsed }) => ($isCollapsed ? 'hidden' : 'auto')};
	transition: max-height ${({ theme }) => theme.transitions.base};
	scrollbar-width: thin;
	scrollbar-color: ${({ theme }) => `${theme.colors.border} transparent`};

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${({ theme }) => theme.colors.border};
		border-radius: ${({ theme }) => theme.radii.full};
	}
`

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
	color: ${({ theme }) => theme.colors.amber};
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

function RecentAcquisitionsList({ cards }: { readonly cards: AcquiredCard[] }) {
	const [page, setPage] = useState(1)
	const [isCollapsed, setIsCollapsed] = useState(true)
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
			<SectionHeader
				role="button"
				tabIndex={0}
				onClick={() => setIsCollapsed(!isCollapsed)}
				onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsCollapsed(!isCollapsed)}
				aria-expanded={!isCollapsed}
				aria-controls="acquisitions-list"
			>
				<SectionTitle>Acquisitions récentes</SectionTitle>
				<ToggleButton aria-hidden="true">
					{isCollapsed ? '⌄' : '⌃'}
				</ToggleButton>
			</SectionHeader>
			<AcqListWrapper $isCollapsed={isCollapsed} id="acquisitions-list">
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
								{card.pricePaid === null ? '—' : formatEuros(card.pricePaid)}
							</AcqPrice>
						</AcqItem>
					))}
				</AcqList>
				{remaining > 0 && (
					<LoadMoreBtn type="button" onClick={() => setPage(p => p + 1)}>
						Charger plus ({remaining} restante{remaining > 1 ? 's' : ''})
					</LoadMoreBtn>
				)}
			</AcqListWrapper>
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
	const { setPlanned: setPlannedStore, removePlanned } = usePlannedStore()

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
			setPlannedStore(plannedData)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadData()
	}, [])

	async function handleDeletePlanned(id: string) {
		await profileService.deletePlanned(id)
		removePlanned(id)
	}

	if (isLoading) return <Spinner center label="Chargement du profil…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (!stats) return null

	return (
		<section aria-labelledby="profile-title">
			<PageHeader title="Mon Profil" id="profile-title" />
			<PageGrid>
				<FullWidth>
					<CollectionValueCard stats={stats} planned={planned} />
				</FullWidth>
				<SpendingChart stats={stats} planned={planned} />
				<PurchaseCalendar 
					planned={planned} 
					onDelete={handleDeletePlanned}
					onRefresh={loadData}
				/>
				<FullWidth>
					<RecentAcquisitionsList cards={acquisitions} />
				</FullWidth>
			</PageGrid>
		</section>
	)
}
