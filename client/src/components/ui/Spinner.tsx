import styled, { keyframes } from 'styled-components'

const spin = keyframes`
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
`

interface SpinnerProps {
	size?: 'sm' | 'md' | 'lg'
}

const sizeMap = { sm: '16px', md: '24px', lg: '40px' }

const SpinnerEl = styled.span<SpinnerProps>`
	display: inline-block;
	width: ${({ size = 'md' }) => sizeMap[size]};
	height: ${({ size = 'md' }) => sizeMap[size]};
	border: 2px solid ${({ theme }) => theme.colors.border};
	border-top-color: ${({ theme }) => theme.colors.amber};
	border-radius: 50%;
	animation: ${spin} 600ms linear infinite;
	flex-shrink: 0;

	@media (prefers-reduced-motion: reduce) {
		animation-duration: 1200ms;
	}
`

const Wrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
`

interface Props {
	size?: 'sm' | 'md' | 'lg'
	label?: string
	center?: boolean
}

export function Spinner({ size = 'md', label = 'Chargement…', center }: Props) {
	const el = <SpinnerEl size={size} role="status" aria-label={label} />
	if (center) return <Wrapper>{el}</Wrapper>
	return el
}
