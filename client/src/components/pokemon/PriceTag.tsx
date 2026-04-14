import styled from 'styled-components'

const formatEuros = (value: number) =>
	new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
	}).format(value)

interface TagProps {
	$variant: 'default' | 'deal'
}

const Tag = styled.span<TagProps>`
	display: inline-flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['1']};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme, $variant }) =>
		$variant === 'deal' ? theme.colors.forest : theme.colors.textPrimary};
`

const Label = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
	font-weight: ${({ theme }) => theme.font.weight.regular};
`

interface Props {
	price: number | null
	label?: string
	variant?: 'default' | 'deal'
}

export function PriceTag({ price, label, variant = 'default' }: Props) {
	if (price === null) return <Label>N/A</Label>

	return (
		<Tag $variant={variant}>
			{label && <Label>{label}</Label>}
			{formatEuros(price)}
		</Tag>
	)
}
