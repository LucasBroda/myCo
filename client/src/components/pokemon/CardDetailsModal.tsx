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
	justify-content: space-between;
	align-items: center;
	padding: ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
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

const AcquisitionPrice = styled.span`
	font-size: ${({ theme }) => theme.font.size.base};
	color: ${({ theme }) => theme.colors.amber};
	font-weight: ${({ theme }) => theme.font.weight.bold};
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

function formatEuros(value: number | null) {
	if (value === null) return '—'
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
	}).format(value)
}

function calculateAveragePrice(acquisitions: AcquiredCard[]): number | null {
	const prices = acquisitions.map(a => a.pricePaid).filter((p): p is number => p !== null)
	if (prices.length === 0) return null
	return prices.reduce((sum, p) => sum + p, 0) / prices.length
}

function calculateTotalPaid(acquisitions: AcquiredCard[]): number | null {
	const prices = acquisitions.map(a => a.pricePaid).filter((p): p is number => p !== null)
	if (prices.length === 0) return null
	return prices.reduce((sum, p) => sum + p, 0)
}

function calculateTotalCurrentValue(price: number, quantity: number): number {
	return price * quantity
}

function calculateTotalGainLoss(currentValue: number, totalPaid: number | null): number | null {
	if (totalPaid === null) return null
	return currentValue - totalPaid
}

function calculatePercentChange(current: number, average: number | null): number | null {
	if (average === null || average === 0) return null
	return ((current - average) / average) * 100
}

export function CardDetailsModal({ card, acquisitions, onClose }: Props) {
	const currentPricePerCard = card.cardmarket?.prices?.trendPrice ?? null
	const totalPaid = calculateTotalPaid(acquisitions)
	const averagePricePaid = calculateAveragePrice(acquisitions)
	const numberOfCopies = acquisitions.length
	
	// Calculer la valeur actuelle totale de toutes les copies
	const totalCurrentValue = currentPricePerCard !== null 
		? calculateTotalCurrentValue(currentPricePerCard, numberOfCopies) 
		: null
	
	// Calculer la plus/moins-value totale
	const totalGainLoss = totalCurrentValue !== null && totalPaid !== null
		? calculateTotalGainLoss(totalCurrentValue, totalPaid)
		: null
	
	// Calculer le pourcentage de changement basé sur le prix moyen
	const percentChange = currentPricePerCard !== null && averagePricePaid !== null 
		? calculatePercentChange(currentPricePerCard, averagePricePaid) 
		: null

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
					{currentPricePerCard !== null && (
						<DetailRow>
							<DetailLabel>Prix unitaire actuel</DetailLabel>
							<DetailValue>{formatEuros(currentPricePerCard)}</DetailValue>
						</DetailRow>
					)}
					{totalCurrentValue !== null && numberOfCopies > 1 && (
						<DetailRow>
							<DetailLabel>Valeur totale actuelle ({numberOfCopies} copies)</DetailLabel>
							<PriceValue>
								{formatEuros(totalCurrentValue)}
								{percentChange !== null && (
									<PriceTrend percentChange={percentChange} inverted={true} />
								)}
							</PriceValue>
						</DetailRow>
					)}
					{averagePricePaid !== null && (
						<DetailRow>
							<DetailLabel>Prix moyen payé</DetailLabel>
							<DetailValue>{formatEuros(averagePricePaid)}</DetailValue>
						</DetailRow>
					)}
					{totalPaid !== null && numberOfCopies > 1 && (
						<DetailRow>
							<DetailLabel>Total payé</DetailLabel>
							<DetailValue>{formatEuros(totalPaid)}</DetailValue>
						</DetailRow>
					)}
					{totalGainLoss !== null && (
						<DetailRow>
							<DetailLabel>Plus/Moins-value</DetailLabel>
							<GainLossValue $isPositive={totalGainLoss >= 0}>
								{totalGainLoss >= 0 ? '+' : ''}{formatEuros(totalGainLoss)}
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
						.map((acquisition: AcquiredCard) => (
							<AcquisitionItem key={acquisition.id}>
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
								<AcquisitionPrice>
										{acquisition.pricePaid === null ? '—' : formatEuros(acquisition.pricePaid)}
								</AcquisitionPrice>
							</AcquisitionItem>
						))}
				</AcquisitionsList>
			</ModalBody>
		</Modal>
	)
}
