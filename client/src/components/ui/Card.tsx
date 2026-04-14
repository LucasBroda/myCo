import styled, { css } from 'styled-components'

interface CardProps {
	interactive?: boolean
	padding?: 'sm' | 'md' | 'lg'
}

export const Card = styled.div<CardProps>`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	box-shadow: ${({ theme }) => theme.shadows.sm};

	${({ padding = 'md', theme }) => {
		const map = {
			sm: theme.spacing['3'],
			md: theme.spacing['4'],
			lg: theme.spacing['6'],
		}
		return css`
			padding: ${map[padding]};
		`
	}}

	${({ interactive, theme }) =>
		interactive &&
		css`
			cursor: pointer;
			transition:
				box-shadow ${theme.transitions.fast},
				transform ${theme.transitions.fast};

			&:hover {
				box-shadow: ${theme.shadows.md};
				transform: translateY(-1px);
			}

			&:focus-visible {
				outline: 2px solid ${theme.colors.focus};
				outline-offset: 2px;
			}
		`}
`
