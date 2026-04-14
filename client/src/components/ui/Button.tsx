import { focusRing } from '@/styles/mixins'
import styled, { css } from 'styled-components'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
	variant?: Variant
	size?: Size
	loading?: boolean
	fullWidth?: boolean
}

const sizeStyles = {
	sm: css`
		padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['3']}`};
		font-size: ${({ theme }) => theme.font.size.sm};
		min-height: 32px;
	`,
	md: css`
		padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['4']}`};
		font-size: ${({ theme }) => theme.font.size.base};
		min-height: 40px;
	`,
	lg: css`
		padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['6']}`};
		font-size: ${({ theme }) => theme.font.size.base};
		min-height: 44px;
	`,
}

const variantStyles = {
	primary: css`
		background-color: ${({ theme }) => theme.colors.amber};
		color: ${({ theme }) => theme.colors.textInverse};
		border: 1px solid transparent;

		&:hover:not(:disabled) {
			background-color: ${({ theme }) => theme.colors.amberHover};
		}
	`,
	secondary: css`
		background-color: ${({ theme }) => theme.colors.surfaceElevated};
		color: ${({ theme }) => theme.colors.textPrimary};
		border: 1px solid ${({ theme }) => theme.colors.border};

		&:hover:not(:disabled) {
			background-color: ${({ theme }) => theme.colors.surface};
			border-color: ${({ theme }) => theme.colors.borderStrong};
		}
	`,
	danger: css`
		background-color: ${({ theme }) => theme.colors.brick};
		color: ${({ theme }) => theme.colors.textInverse};
		border: 1px solid transparent;

		&:hover:not(:disabled) {
			background-color: ${({ theme }) => theme.colors.brickHover};
		}
	`,
	ghost: css`
		background-color: transparent;
		color: ${({ theme }) => theme.colors.textSecondary};
		border: 1px solid transparent;

		&:hover:not(:disabled) {
			background-color: ${({ theme }) => theme.colors.surface};
			color: ${({ theme }) => theme.colors.textPrimary};
		}
	`,
}

export const Button = styled.button<ButtonProps>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing['2']};
	border-radius: ${({ theme }) => theme.radii.md};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	cursor: pointer;
	font-family: inherit;
	transition:
		background-color ${({ theme }) => theme.transitions.fast},
		color ${({ theme }) => theme.transitions.fast},
		border-color ${({ theme }) => theme.transitions.fast};
	white-space: nowrap;
	${({ size = 'md' }) => sizeStyles[size]}
	${({ variant = 'primary' }) => variantStyles[variant]}
	${({ fullWidth }) =>
		fullWidth &&
		css`
			width: 100%;
		`}

	&:disabled {
		background-color: ${({ theme }) => theme.colors.disabled};
		color: ${({ theme }) => theme.colors.disabledText};
		border-color: transparent;
		cursor: not-allowed;
	}

	&:focus-visible {
		${focusRing}
	}

	${({ loading }) =>
		loading &&
		css`
			opacity: 0.7;
			cursor: wait;
		`}
`

Button.defaultProps = {
	type: 'button',
}
