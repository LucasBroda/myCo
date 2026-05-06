import type { PokemonCard, AcquiredCard, CardCondition } from '@/types/models'
import { Modal, ModalBody } from '@components/ui/Modal'
import { PriceTrend } from '@components/pokemon/PriceTrend'
import { Badge } from '@components/ui/Badge'
import styled from 'styled-components'

const CardImageContainer = styled.div`
	display: flex;
	justify-content: center;
	margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const CardImage = styled.img`
	max-width: 300px;
	width: 100%;
	height: auto;
	border-radius: ${({ theme }) => theme.radii.lg};
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`

const DetailSection = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
`

const DetailRow = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
`

const DetailLabel = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-weight: ${({ theme }) => theme.font.weight.medium};
`

const DetailValue = styled.span`
	font-size: ${({ theme }) => theme.font.size.base};
	color: ${({ theme }) => theme.colors.textPrimary};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	text-align: right;
`

const GainLossValue = styled(DetailValue)<{ $isPositive: boolean }>`
	color: ${({ $isPositive }) => ($isPositive ? '#16a34a' : '#dc2626')};
`

const PriceValue = styled(DetailValue)`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
`

const SectionTitle = styled.h3`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: ${({ theme }) => theme.spacing['4']} 0 ${({ theme }) => theme.spacing['2']};

	&:first-child {
		margin-top: 0;
	}
`

const AcquisitionsList = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
`

const AcquisitionItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
`

const AcquisitionHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: ${({ theme }) => theme.spacing['3']};
`

const AcquisitionInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`

const AcquisitionDate = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textPrimary};
	font-weight: ${({ theme }) => theme.font.weight.medium};
`

const AcquisitionCondition = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const AcquisitionPrices = styled.div`
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: ${({ theme }) => theme.spacing['2']};
	padding-top: ${({ theme }) => theme.spacing['2']};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const PriceItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`

const PriceItemLabel = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
	text-transform: uppercase;
	letter-spacing: 0.5px;
`

const PriceItemValue = styled.span<{ $color?: string }>`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ $color, theme }) => $color || theme.colors.textPrimary};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
`

const AcquisitionBadge = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	padding: ${({ theme }) => theme.spacing['1']} ${({ theme }) => theme.spacing['2']};
	background-color: ${({ theme }) => theme.colors.surface};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	font-weight: ${({ theme }) => theme.font.weight.medium};
`

const ConditionBadges = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: ${({ theme }) => theme.spacing['2']};
`

interface Props {
	readonly card: PokemonCard
	readonly acquisitions: AcquiredCard[]
	readonly onClose: () => void
}

// Helper to check if a value is a valid number
function isValidNumber(value: unknown): value is number {
	return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value)
}

// Coefficients de prix selon l'état de la carte (basé sur les standards du marché TCG)
// Le prix de référence (trendPrice) est considéré comme Near Mint (NM)
const CONDITION_MULTIPLIERS: Record<CardCondition, number> = {
	'Mint': 1.05,      // +5% pour Mint
	'NM': 1.00,        // 100% - référence
	'LP': 0.85,        // -15% pour Lightly Played
	'MP': 0.70,        // -30% pour Moderately Played
	'HP': 0.50,        // -50% pour Heavily Played
	'Damaged': 0.30,   // -70% pour Damaged
}

// Estime le prix d'une carte en fonction de sa condition
function estimatePriceByCondition(basePrice: number, condition: CardCondition): number {
	if (!isValidNumber(basePrice)) return 0
	const multiplier = CONDITION_MULTIPLIERS[condition] ?? 1.0
	return basePrice * multiplier
}

function formatEuros(value: number | null) {
	if (!isValidNumber(value)) return '—'
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(value)
}

function calculateAveragePrice(acquisitions: AcquiredCard[]): number | null {
	// Filter out null, undefined, NaN, and any invalid values
	const prices = acquisitions
		.map(a => a.pricePaid)
		.filter(isValidNumber)
	
	if (prices.length === 0) return null
	
	const sum = prices.reduce((acc, p) => acc + p, 0)
	const average = sum / prices.length
	
	// Double-check the result is valid
	return isValidNumber(average) ? average : null
}

function calculateTotalPaid(acquisitions: AcquiredCard[]): number | null {
	// Filter out null, undefined, NaN, and any invalid values
	const prices = acquisitions
		.map(a => a.pricePaid)
		.filter(isValidNumber)
	
	if (prices.length === 0) return null
	
	const total = prices.reduce((acc, p) => acc + p, 0)
	
	// Double-check the result is valid
	return isValidNumber(total) ? total : null
}

// Calcule la valeur actuelle totale en tenant compte de l'état de chaque carte
function calculateTotalCurrentValueByCondition(
	basePriceNM: number,
	acquisitions: AcquiredCard[]
): number | null {
	if (!isValidNumber(basePriceNM) || acquisitions.length === 0) return null
	
	const total = acquisitions.reduce((sum, acq) => {
		const estimatedPrice = estimatePriceByCondition(basePriceNM, acq.condition)
		return sum + estimatedPrice
	}, 0)
	
	return isValidNumber(total) ? total : null
}

// Calcule le prix moyen actuel pondéré par condition
function calculateAverageCurrentPrice(
	basePriceNM: number,
	acquisitions: AcquiredCard[]
): number | null {
	if (!isValidNumber(basePriceNM) || acquisitions.length === 0) return null
	
	const total = calculateTotalCurrentValueByCondition(basePriceNM, acquisitions)
	if (!isValidNumber(total)) return null
	
	const average = total / acquisitions.length
	return isValidNumber(average) ? average : null
}

function calculateTotalGainLoss(currentValue: number | null, totalPaid: number | null): number | null {
	if (!isValidNumber(currentValue) || !isValidNumber(totalPaid)) return null
	
	const gainLoss = currentValue - totalPaid
	return isValidNumber(gainLoss) ? gainLoss : null
}

function calculatePercentChange(current: number, average: number | null): number | null {
	if (!isValidNumber(current) || !isValidNumber(average) || average === 0) return null
	
	const percentChange = ((current - average) / average) * 100
	return isValidNumber(percentChange) ? percentChange : null
}

export function CardDetailsModal({ card, acquisitions, onClose }: Props) {
	// Ensure we have a valid current price (trendPrice is for NM condition)
	const rawCurrentPriceNM = card.cardmarket?.prices?.trendPrice
	const basePriceNM = isValidNumber(rawCurrentPriceNM) ? rawCurrentPriceNM : null
	
	// Calculate all price metrics
	const totalPaid = calculateTotalPaid(acquisitions)
	const averagePricePaid = calculateAveragePrice(acquisitions)
	const numberOfCopies = acquisitions.length
	
	// Calculer la valeur actuelle totale en tenant compte de l'état de chaque carte
	const totalCurrentValue = basePriceNM !== null
		? calculateTotalCurrentValueByCondition(basePriceNM, acquisitions)
		: null
	
	// Calculer le prix moyen actuel (pondéré par condition)
	const averageCurrentPrice = basePriceNM !== null
		? calculateAverageCurrentPrice(basePriceNM, acquisitions)
		: null
	
	// Calculer la plus/moins-value totale
	const totalGainLoss = calculateTotalGainLoss(totalCurrentValue, totalPaid)
	
	// Calculer le pourcentage de changement basé sur le prix moyen
	const percentChange = calculatePercentChange(averageCurrentPrice ?? 0, averagePricePaid)

	// Group acquisitions by condition
	const conditionCounts = acquisitions.reduce((acc, acq) => {
		acc[acq.condition] = (acc[acq.condition] || 0) + 1
		return acc
	}, {} as Record<CardCondition, number>)

	return (
		<Modal isOpen={true} onClose={onClose} title={card.name}>
			<ModalBody>
				<CardImageContainer>
					<CardImage src={card.images.large} alt={card.name} />
				</CardImageContainer>

				<DetailSection>
					<DetailRow>
						<DetailLabel>Collection</DetailLabel>
						<DetailValue>{card.set.name}</DetailValue>
					</DetailRow>
					<DetailRow>
						<DetailLabel>Numéro</DetailLabel>
						<DetailValue>#{card.number}</DetailValue>
					</DetailRow>
					<DetailRow>
						<DetailLabel>Rareté</DetailLabel>
						<DetailValue>{card.rarity}</DetailValue>
					</DetailRow>
					{card.artist && (
						<DetailRow>
							<DetailLabel>Artiste</DetailLabel>
							<DetailValue>{card.artist}</DetailValue>
						</DetailRow>
					)}
					{card.types && card.types.length > 0 && (
						<DetailRow>
							<DetailLabel>Type(s)</DetailLabel>
							<DetailValue>{card.types.join(', ')}</DetailValue>
						</DetailRow>
					)}
				</DetailSection>

				<SectionTitle>Prix</SectionTitle>
				<DetailSection>
					{basePriceNM !== null && (
						<DetailRow>
							<DetailLabel>Prix de référence (NM)</DetailLabel>
							<DetailValue>{formatEuros(basePriceNM)}</DetailValue>
						</DetailRow>
					)}
					{isValidNumber(averageCurrentPrice) && (
						<DetailRow>
							<DetailLabel>Prix moyen actuel (par état)</DetailLabel>
							<DetailValue>{formatEuros(averageCurrentPrice)}</DetailValue>
						</DetailRow>
					)}
					{isValidNumber(averagePricePaid) && (
						<DetailRow>
							<DetailLabel>Prix moyen payé</DetailLabel>
							<DetailValue>{formatEuros(averagePricePaid)}</DetailValue>
						</DetailRow>
					)}
					{isValidNumber(averageCurrentPrice) && isValidNumber(averagePricePaid) && (
						<DetailRow>
							<DetailLabel>Écart moyen unitaire</DetailLabel>
							<PriceValue>
								<GainLossValue $isPositive={(averageCurrentPrice - averagePricePaid) >= 0}>
									{(averageCurrentPrice - averagePricePaid) >= 0 ? '+' : ''}{formatEuros(averageCurrentPrice - averagePricePaid)}
								</GainLossValue>
								{isValidNumber(percentChange) && (
									<PriceTrend percentChange={percentChange} inverted={true} />
								)}
							</PriceValue>
						</DetailRow>
					)}
					{isValidNumber(totalCurrentValue) && numberOfCopies > 1 && (
						<DetailRow>
							<DetailLabel>Valeur totale actuelle ({numberOfCopies} copies)</DetailLabel>
							<DetailValue>{formatEuros(totalCurrentValue)}</DetailValue>
						</DetailRow>
					)}
					{isValidNumber(totalPaid) && numberOfCopies > 1 && (
						<DetailRow>
							<DetailLabel>Total payé</DetailLabel>
							<DetailValue>{formatEuros(totalPaid)}</DetailValue>
						</DetailRow>
					)}
					{isValidNumber(totalGainLoss) && numberOfCopies > 1 && (
						<DetailRow>
							<DetailLabel>Plus/Moins-value totale</DetailLabel>
							<GainLossValue $isPositive={totalGainLoss >= 0}>
								{totalGainLoss >= 0 ? '+' : ''}{formatEuros(totalGainLoss)}
							</GainLossValue>
						</DetailRow>
					)}
					{isValidNumber(totalCurrentValue) && isValidNumber(totalPaid) && numberOfCopies === 1 && (
						<DetailRow>
							<DetailLabel>Plus/Moins-value</DetailLabel>
							<GainLossValue $isPositive={(totalCurrentValue - totalPaid) >= 0}>
								{(totalCurrentValue - totalPaid) >= 0 ? '+' : ''}{formatEuros(totalCurrentValue - totalPaid)}
							</GainLossValue>
						</DetailRow>
					)}
				</DetailSection>

				<SectionTitle>Exemplaires possédés ({acquisitions.length})</SectionTitle>
				<ConditionBadges>
					{Object.entries(conditionCounts).map(([condition, count]) => (
						<Badge key={condition} variant="neutral">
							{condition}: {count}
						</Badge>
					))}
				</ConditionBadges>

				<SectionTitle>Historique d'acquisition</SectionTitle>
				<AcquisitionsList>
					{[...acquisitions]
						.sort((a: AcquiredCard, b: AcquiredCard) => new Date(b.acquiredDate).getTime() - new Date(a.acquiredDate).getTime())
						.map((acquisition: AcquiredCard) => {
								const pricePaid = isValidNumber(acquisition.pricePaid) ? acquisition.pricePaid : null
								
								// Calculer le prix actuel en fonction de l'état de cette acquisition
								const currentPriceForCondition = basePriceNM !== null
									? estimatePriceByCondition(basePriceNM, acquisition.condition)
									: null
								
								const individualGainLoss = pricePaid !== null && currentPriceForCondition !== null
									? currentPriceForCondition - pricePaid
									: null
								
								return (
									<AcquisitionItem key={acquisition.id}>
										<AcquisitionHeader>
											<AcquisitionInfo>
												<AcquisitionDate>
													{new Date(acquisition.acquiredDate).toLocaleDateString('fr-FR', {
														year: 'numeric',
														month: 'long',
														day: 'numeric',
													})}
												</AcquisitionDate>
												<AcquisitionCondition>État: {acquisition.condition}</AcquisitionCondition>
											</AcquisitionInfo>
											<AcquisitionBadge>#{acquisition.id.slice(0, 8)}</AcquisitionBadge>
										</AcquisitionHeader>
										
										<AcquisitionPrices>
											<PriceItem>
												<PriceItemLabel>Prix payé</PriceItemLabel>
												<PriceItemValue>
													{pricePaid !== null ? formatEuros(pricePaid) : 'Non renseigné'}
												</PriceItemValue>
											</PriceItem>
											
											<PriceItem>
												<PriceItemLabel>Prix actuel ({acquisition.condition})</PriceItemLabel>
												<PriceItemValue>
													{currentPriceForCondition !== null ? formatEuros(currentPriceForCondition) : '—'}
												</PriceItemValue>
											</PriceItem>
											
											<PriceItem>
												<PriceItemLabel>+/- Value</PriceItemLabel>
												<PriceItemValue 
													$color={
														individualGainLoss === null 
															? undefined 
															: individualGainLoss >= 0 ? '#16a34a' : '#dc2626'
													}
												>
													{individualGainLoss !== null 
														? `${individualGainLoss >= 0 ? '+' : ''}${formatEuros(individualGainLoss)}`
														: '—'
													}
												</PriceItemValue>
											</PriceItem>
										</AcquisitionPrices>
									</AcquisitionItem>
								)
							})}
				</AcquisitionsList>
			</ModalBody>
		</Modal>
	)
}
