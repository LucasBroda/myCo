import { focusRing } from '@/styles/mixins'
import styled, { css } from 'styled-components'

const Bar = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	flex-wrap: wrap;
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	width: 100%;
`

interface ChipProps {
	$active: boolean
}

const Chip = styled.button<ChipProps>`
	padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['3']}`};
	border-radius: ${({ theme }) => theme.radii.full};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	border: 1px solid ${({ theme }) => theme.colors.border};
	cursor: pointer;
	font-family: inherit;
	white-space: nowrap;
	flex-shrink: 0;
	transition:
		background-color ${({ theme }) => theme.transitions.fast},
		color ${({ theme }) => theme.transitions.fast},
		border-color ${({ theme }) => theme.transitions.fast};

	${({ $active, theme }) =>
		$active
			? css`
					background-color: ${theme.colors.amberLight};
					color: ${theme.colors.amber};
					border-color: ${theme.colors.amberBorder};
				`
			: css`
					background-color: ${theme.colors.surfaceElevated};
					color: ${theme.colors.textSecondary};

					&:hover {
						background-color: ${theme.colors.surface};
						color: ${theme.colors.textPrimary};
					}
				`}

	&:focus-visible {
		${focusRing}
	}
`

export interface FilterOption<T extends string> {
	value: T
	label: string
}

interface FilterBarProps<T extends string> {
	readonly options: FilterOption<T>[]
	readonly value: T
	readonly onChange: (value: T) => void
	readonly label: string
}

export function BarreFiltres<T extends string>({
	options,
	value,
	onChange,
	label,
}: FilterBarProps<T>) {
	function handleClick(optValue: T) {
		// Si on clique sur le filtre déjà actif, retourner au premier filtre (généralement "all")
		if (value === optValue && options.length > 0) {
			onChange(options[0].value)
		} else {
			onChange(optValue)
		}
	}

	return (
		<Bar role="group" aria-label={label}>
			{options.map(opt => (
				<Chip
					key={opt.value}
					type="button"
					$active={value === opt.value}
					onClick={() => handleClick(opt.value)}
					aria-pressed={value === opt.value}
				>
					{opt.label}
				</Chip>
			))}
		</Bar>
	)
}
