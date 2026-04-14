import styled, { css } from 'styled-components'

type BadgeVariant = 'default' | 'amber' | 'brick' | 'forest' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps {
	variant?: BadgeVariant
	size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, ReturnType<typeof css>> = {
	default: css`
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.textSecondary};
		border: 1px solid ${({ theme }) => theme.colors.border};
	`,
	amber: css`
		background-color: ${({ theme }) => theme.colors.amberLight};
		color: ${({ theme }) => theme.colors.amber};
		border: 1px solid ${({ theme }) => theme.colors.amberBorder};
	`,
	brick: css`
		background-color: ${({ theme }) => theme.colors.brickLight};
		color: ${({ theme }) => theme.colors.brick};
		border: 1px solid ${({ theme }) => theme.colors.brickBorder};
	`,
	forest: css`
		background-color: ${({ theme }) => theme.colors.forestLight};
		color: ${({ theme }) => theme.colors.forest};
		border: 1px solid ${({ theme }) => theme.colors.forestBorder};
	`,
	neutral: css`
		background-color: ${({ theme }) => theme.colors.disabled};
		color: ${({ theme }) => theme.colors.textSecondary};
		border: 1px solid transparent;
	`,
}

export const Badge = styled.span<BadgeProps>`
	display: inline-flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['1']};
	border-radius: ${({ theme }) => theme.radii.full};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	white-space: nowrap;

	${({ size = 'md', theme }) =>
		size === 'sm'
			? css`
					padding: 2px ${theme.spacing['2']};
					font-size: ${theme.font.size.xs};
				`
			: css`
					padding: ${theme.spacing['1']} ${theme.spacing['3']};
					font-size: ${theme.font.size.sm};
				`}

	${({ variant = 'default' }) => variantStyles[variant]}
`
