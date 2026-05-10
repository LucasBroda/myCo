import styled from 'styled-components'

interface ProgressBarProps {
	value: number
	max: number
	label?: string
	showCount?: boolean
}

const Track = styled.div`
	width: 100%;
	height: 8px;
	background-color: ${({ theme }) => theme.colors.surface};
	border-radius: ${({ theme }) => theme.radii.full};
	overflow: hidden;
`

const Fill = styled.div<{ $percent: number }>`
	height: 100%;
	width: ${({ $percent }) => $percent}%;
	background-color: ${({ theme }) => theme.colors.amber};
	border-radius: ${({ theme }) => theme.radii.full};
	transition: width ${({ theme }) => theme.transitions.slow};
`

const Meta = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	margin-bottom: ${({ theme }) => theme.spacing['1']};
`

const LabelText = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const CountText = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

export function ProgressBar({
	value,
	max,
	label,
	showCount = true,
}: ProgressBarProps) {
	const percent = max > 0 ? Math.round((value / max) * 100) : 0

	return (
		<div>
			{(label || showCount) && (
				<Meta>
					{label && <LabelText>{label}</LabelText>}
					{showCount && (
						<CountText>
							{value} / {max}
						</CountText>
					)}
				</Meta>
			)}
			<Track>
				<Fill
					$percent={percent}
					role="progressbar"
					aria-valuenow={value}
					aria-valuemin={0}
					aria-valuemax={max}
					aria-label={label ?? `${value} sur ${max}`}
				/>
			</Track>
		</div>
	)
}
