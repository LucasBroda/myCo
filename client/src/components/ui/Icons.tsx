import styled from 'styled-components'

const IconWrapper = styled.div<{ $size?: number }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: ${({ $size }) => $size || 40}px;
	height: ${({ $size }) => $size || 40}px;
	
	svg {
		width: 100%;
		height: 100%;
		stroke-width: 1.5;
	}
`

interface IconProps {
	readonly size?: number
	readonly color?: string
	readonly className?: string
}

export function ChartBarIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<path d="M8 10v7" />
				<path d="M12 7v10" />
				<path d="M16 13v4" />
			</svg>
		</IconWrapper>
	)
}

export function TrendingUpIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
				<polyline points="16 7 22 7 22 13" />
			</svg>
		</IconWrapper>
	)
}

export function CalendarIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		</IconWrapper>
	)
}

export function ListIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<line x1="8" y1="6" x2="21" y2="6" />
				<line x1="8" y1="12" x2="21" y2="12" />
				<line x1="8" y1="18" x2="21" y2="18" />
				<line x1="3" y1="6" x2="3.01" y2="6" />
				<line x1="3" y1="12" x2="3.01" y2="12" />
				<line x1="3" y1="18" x2="3.01" y2="18" />
			</svg>
		</IconWrapper>
	)
}

export function MailboxIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z" />
				<polyline points="15,9 18,9 18,11" />
				<path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2" />
			</svg>
		</IconWrapper>
	)
}

export function AlertIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
				<line x1="12" y1="9" x2="12" y2="13" />
				<line x1="12" y1="17" x2="12.01" y2="17" />
			</svg>
		</IconWrapper>
	)
}

export function ActivityIcon({ size, color = 'currentColor', className }: IconProps) {
	return (
<IconWrapper $size={size} className={className}>
			<svg viewBox="0 0 24 24" fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</svg>
		</IconWrapper>
	)
}

export const InlineIcon = styled.span<{ $size?: number }>`
	display: inline-flex;
	align-items: center;
	vertical-align: middle;
	margin-right: ${({ theme }) => theme.spacing['2']};
	
	svg {
		width: ${({ $size }) => $size || 16}px;
		height: ${({ $size }) => $size || 16}px;
		stroke-width: 2;
	}
`
