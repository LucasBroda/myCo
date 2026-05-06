import { focusRing } from '@/styles/mixins'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const SelectContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	max-width: 400px;
`

const Label = styled.label`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const SelectWrapper = styled.div`
	position: relative;
	width: 100%;
`

const SelectButton = styled.button<{ $isOpen: boolean }>`
	width: 100%;
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	padding-right: ${({ theme }) => theme.spacing['10']};
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	font-family: ${({ theme }) => theme.font.family};
	color: ${({ theme }) => theme.colors.textPrimary};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme, $isOpen }) => $isOpen ? theme.colors.amber : theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	cursor: pointer;
	text-align: left;
	transition: 
		border-color ${({ theme }) => theme.transitions.fast},
		box-shadow ${({ theme }) => theme.transitions.fast},
		background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
		background-color: ${({ theme }) => theme.colors.surface};
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

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
	position: absolute;
	top: calc(100% + ${({ theme }) => theme.spacing['2']});
	left: 0;
	right: 0;
	max-height: 320px;
	overflow-y: auto;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
	opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
	visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
	transform: ${({ $isOpen }) => $isOpen ? 'translateY(0)' : 'translateY(-8px)'};
	transition: 
		opacity ${({ theme }) => theme.transitions.fast},
		visibility ${({ theme }) => theme.transitions.fast},
		transform ${({ theme }) => theme.transitions.fast};
	z-index: 1000;

	/* Custom scrollbar */
	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: ${({ theme }) => theme.colors.surface};
		border-radius: ${({ theme }) => theme.radii.md};
	}

	&::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.colors.border};
		border-radius: ${({ theme }) => theme.radii.md};
		
		&:hover {
			background: ${({ theme }) => theme.colors.borderStrong};
		}
	}
`

const OptionButton = styled.button<{ $isSelected: boolean }>`
	width: 100%;
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme, $isSelected }) => $isSelected ? theme.font.weight.semibold : theme.font.weight.medium};
	font-family: ${({ theme }) => theme.font.family};
	color: ${({ theme, $isSelected }) => $isSelected ? theme.colors.amber : theme.colors.textPrimary};
	background-color: ${({ theme, $isSelected }) => $isSelected ? theme.colors.amberLight : 'transparent'};
	border: none;
	text-align: left;
	cursor: pointer;
	transition: 
		background-color ${({ theme }) => theme.transitions.fast},
		color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme, $isSelected }) => $isSelected ? theme.colors.amberLight : theme.colors.surface};
		color: ${({ theme }) => theme.colors.amber};
	}

	&:focus {
		outline: none;
		background-color: ${({ theme }) => theme.colors.surface};
	}

	&:first-child {
		border-radius: ${({ theme }) => `${theme.radii.lg} ${theme.radii.lg} 0 0`};
	}

	&:last-child {
		border-radius: ${({ theme }) => `0 0 ${theme.radii.lg} ${theme.radii.lg}`};
	}

	&:only-child {
		border-radius: ${({ theme }) => theme.radii.lg};
	}
`

const ChevronIcon = styled.svg<{ $isOpen: boolean }>`
	position: absolute;
	right: ${({ theme }) => theme.spacing['4']};
	top: 50%;
	transform: translateY(-50%) rotate(${({ $isOpen }) => $isOpen ? '180deg' : '0deg'});
	width: 20px;
	height: 20px;
	color: ${({ theme }) => theme.colors.textSecondary};
	pointer-events: none;
	transition: 
		color ${({ theme }) => theme.transitions.fast},
		transform ${({ theme }) => theme.transitions.base};

	${SelectButton}:hover ~ & {
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

export interface SelectOption<T extends string> {
	value: T
	label: string
}

interface SelectProps<T extends string> {
	readonly options: SelectOption<T>[]
	readonly value: T
	readonly onChange: (value: T) => void
	readonly label: string
	readonly id?: string
}

export function Select<T extends string>({
	options,
	value,
	onChange,
	label,
	id = 'select',
}: SelectProps<T>) {
	const [isOpen, setIsOpen] = useState(false)
	const selectRef = useRef<HTMLDivElement>(null)

	// Find selected option label
	const selectedOption = options.find(opt => opt.value === value)
	const selectedLabel = selectedOption?.label || 'Sélectionner...'

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside)
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [isOpen])

	function handleToggle() {
		setIsOpen(!isOpen)
	}

	function handleSelect(optionValue: T) {
		onChange(optionValue)
		setIsOpen(false)
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === 'Escape') {
			setIsOpen(false)
		}
	}

	return (
		<SelectContainer ref={selectRef}>
			<Label htmlFor={id}>{label}</Label>
			<SelectWrapper>
				<SelectButton
					id={id}
					type="button"
					onClick={handleToggle}
					onKeyDown={handleKeyDown}
					aria-haspopup="listbox"
					aria-expanded={isOpen}
					aria-label={label}
					$isOpen={isOpen}
				>
					{selectedLabel}
				</SelectButton>
				<ChevronIcon
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					$isOpen={isOpen}
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
						clipRule="evenodd"
					/>
				</ChevronIcon>
				<DropdownMenu $isOpen={isOpen} role="listbox">
					{options.map(opt => (
						<OptionButton
							key={opt.value}
							type="button"
							onClick={() => handleSelect(opt.value)}
							$isSelected={opt.value === value}
							role="option"
							aria-selected={opt.value === value}
						>
							{opt.label}
						</OptionButton>
					))}
				</DropdownMenu>
			</SelectWrapper>
		</SelectContainer>
	)
}
