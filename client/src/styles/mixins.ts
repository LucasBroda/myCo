import { css } from 'styled-components'

export const focusRing = css`
	outline: 2px solid ${({ theme }) => theme.colors.focus};
	outline-offset: 2px;
`

export const srOnly = css`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border-width: 0;
`

export const truncate = css`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

export const cardSurface = css`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	box-shadow: ${({ theme }) => theme.shadows.sm};
`

export const interactiveScale = css`
	transition: transform ${({ theme }) => theme.transitions.fast};
	&:hover {
		transform: translateY(-1px);
	}
	&:active {
		transform: translateY(0);
	}
`
