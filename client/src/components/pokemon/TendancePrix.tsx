import styled from 'styled-components'

type TrendDirection = 'up' | 'down' | 'stable'

interface TrendIndicatorProps {
	$direction: TrendDirection
	$inverted: boolean
}

const TrendContainer = styled.span<TrendIndicatorProps>`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: ${({ theme }) => theme.font.size.xs};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme, $direction, $inverted }) => {
		// Contexte inversé (collection) : hausse = bon (vert), baisse = mauvais (rouge)
		// Contexte normal (marché) : hausse = mauvais (rouge), baisse = bon (vert)
		if ($inverted) {
			switch ($direction) {
				case 'up':
					return '#16a34a' // Vert pour hausse de valeur collection
				case 'down':
					return '#dc2626' // Rouge pour baisse de valeur collection
				default:
					return theme.colors.textMuted
			}
		} else {
			switch ($direction) {
				case 'up':
					return '#dc2626' // Rouge pour hausse de prix marché
				case 'down':
					return '#16a34a' // Vert pour baisse de prix marché
				default:
					return theme.colors.textMuted
			}
		}
	}};
`

const Arrow = styled.span`
	font-size: 12px;
`

interface Props {
	readonly percentChange: number | null
	readonly period?: '7d' | '30d' | '60d'
	readonly inverted?: boolean // Pour inverser la logique des couleurs (collection vs marché)
}

export function PriceTrend({ percentChange, period = '30d', inverted = false }: Props) {
	if (percentChange === null || percentChange === 0) {
		return (
			<TrendContainer $direction="stable" $inverted={inverted} title="Prix stable">
				<Arrow>→</Arrow>
				<span>Stable</span>
			</TrendContainer>
		)
	}

	const direction: TrendDirection = percentChange > 0 ? 'up' : 'down'
	const absChange = Math.abs(percentChange)

	const getPeriodLabel = () => {
		switch (period) {
			case '7d':
				return '7j'
			case '30d':
				return '30j'
			case '60d':
				return '60j'
			default:
				return '30j'
		}
	}

	const getTooltipText = () => {
		if (inverted) {
			// Contexte collection : hausse = plus-value, baisse = moins-value
			return `${direction === 'up' ? 'Plus-value' : 'Moins-value'} de ${absChange.toFixed(1)}%`
		} else {
			// Contexte marché : hausse/baisse de prix
			return `${direction === 'up' ? 'Hausse' : 'Baisse'} de ${absChange.toFixed(1)}% sur ${getPeriodLabel()}`
		}
	}

	return (
		<TrendContainer
			$direction={direction}
			$inverted={inverted}
			title={getTooltipText()}
		>
			<Arrow>{direction === 'up' ? '↑' : '↓'}</Arrow>
			<span>
				{direction === 'up' ? '+' : '-'}
				{absChange.toFixed(1)}%
			</span>
		</TrendContainer>
	)
}
