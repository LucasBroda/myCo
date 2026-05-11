import { focusRing } from '@/styles/mixins'
import type { CardCondition } from '@/types/models'
import styled from 'styled-components'

const conditions: { value: CardCondition; label: string }[] = [
	{ value: 'Mint', label: 'Mint' },
	{ value: 'NM', label: 'Near Mint (NM)' },
	{ value: 'LP', label: 'Lightly Played (LP)' },
	{ value: 'MP', label: 'Moderately Played (MP)' },
	{ value: 'HP', label: 'Heavily Played (HP)' },
	{ value: 'Damaged', label: 'Damaged' },
]

const Select = styled.select`
	width: 100%;
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.base};
	font-family: inherit;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	color: ${({ theme }) => theme.colors.textPrimary};
	cursor: pointer;
	min-height: 44px;
	transition: border-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.amber};
		box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.amberLight};
	}

	&:focus-visible {
		${focusRing}
	}
`

interface Props {
	id: string
	value: CardCondition
	onChange: (value: CardCondition) => void
}

export function SelectionCondition({ id, value, onChange }: Props) {
	return (
		<Select
			id={id}
			value={value}
			onChange={e => onChange(e.target.value as CardCondition)}
		>
			{conditions.map(c => (
				<option key={c.value} value={c.value}>
					{c.label}
				</option>
			))}
		</Select>
	)
}
