import styled from 'styled-components'

type TrendDirection = 'up' | 'down' | 'stable'

interface TrendIndicatorProps {
	$direction: TrendDirection
}

const TrendContainer = styled.span<TrendIndicatorProps>`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	font-size: ${({ theme }) => theme.font.size.xs};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme, $direction }) => {
		switch ($direction) {
			case 'up':
				return '#dc2626' // Rouge pour hausse
			case 'down':
				return '#16a34a' // Vert pour baisse
			default:
				return theme.colors.textMuted
		}
	}};
`

const Arrow = styled.span`
	font-size: 12px;
`

interface Props {
	readonly percentChange: number | null
	readonly period?: '7d' | '30d' | '60d'
}

export function PriceTrend({ percentChange, period = '30d' }: Props) {
	if (percentChange === null || percentChange === 0) {
		return (
			<TrendContainer $direction="stable" title="Prix stable">
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

	return (
		<TrendContainer
			$direction={direction}
			title={`${direction === 'up' ? 'Hausse' : 'Baisse'} de ${absChange.toFixed(1)}% sur ${getPeriodLabel()}`}
		>
			<Arrow>{direction === 'up' ? '↑' : '↓'}</Arrow>
			<span>
				{direction === 'up' ? '+' : '-'}
				{absChange.toFixed(1)}%
			</span>
		</TrendContainer>
	)
}
