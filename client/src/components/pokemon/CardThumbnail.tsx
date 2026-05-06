import { focusRing } from '@/styles/mixins'
import type { PokemonCard } from '@/types/models'
import styled, { css } from 'styled-components'

interface ThumbnailProps {
	owned?: boolean
	planned?: boolean
	interactive?: boolean
}

const Wrapper = styled.div<ThumbnailProps>`
	position: relative;
	border-radius: ${({ theme }) => theme.radii.md};
	overflow: hidden;
	border: 2px solid
		${({ theme, owned, planned }) =>
			owned ? theme.colors.forestBorder : planned ? theme.colors.amberBorder : theme.colors.border};
	background-color: ${({ theme }) => theme.colors.surface};
	aspect-ratio: 2 / 3;
	transition:
		border-color ${({ theme }) => theme.transitions.fast},
		box-shadow ${({ theme }) => theme.transitions.fast},
		transform ${({ theme }) => theme.transitions.fast},
		opacity ${({ theme }) => theme.transitions.fast};
	opacity: ${({ planned }) => (planned ? 0.7 : 1)};

	${({ interactive, planned, theme }) =>
		interactive &&
		!planned &&
		css`
			cursor: pointer;

			&:hover {
				box-shadow: ${theme.shadows.md};
				transform: translateY(-2px);
			}

			&:focus-visible {
				${focusRing}
			}
		`}
`

const Img = styled.img<{ $owned: boolean; $planned: boolean }>`
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: ${({ $owned }) => ($owned ? 1 : 0.45)};
	transition: opacity ${({ theme }) => theme.transitions.fast};

	${Wrapper}:hover & {
		opacity: ${({ $owned, $planned }) => ($owned || $planned ? ($owned ? 1 : 0.45) : 0.65)};
	}
`

const OwnedBadge = styled.div`
	position: absolute;
	top: ${({ theme }) => theme.spacing['1']};
	right: ${({ theme }) => theme.spacing['1']};
	width: 20px;
	height: 20px;
	border-radius: ${({ theme }) => theme.radii.full};
	background-color: ${({ theme }) => theme.colors.forest};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	color: #fff;
	z-index: 10;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`

const PlannedBadge = styled.div`
	position: absolute;
	top: ${({ theme }) => theme.spacing['1']};
	right: ${({ theme }) => theme.spacing['1']};
	width: 22px;
	height: 22px;
	border-radius: ${({ theme }) => theme.radii.full};
	background-color: ${({ theme }) => theme.colors.amber};
	display: flex;
	align-items: center;
	justify-content: center;
	color: #fff;
	z-index: 10;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

	svg {
		width: 12px;
		height: 12px;
		stroke: currentColor;
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
`

const PlannedTooltip = styled.div`
	position: absolute;
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
	margin-top: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => theme.spacing['2']} ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.amber};
	color: #fff;
	font-size: ${({ theme }) => theme.font.size.xs};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	border-radius: ${({ theme }) => theme.radii.md};
	white-space: nowrap;
	opacity: 0;
	pointer-events: none;
	transition: opacity ${({ theme }) => theme.transitions.fast};
	z-index: 20;
	box-shadow: ${({ theme }) => theme.shadows.md};

	${Wrapper}:hover & {
		opacity: 1;
	}

	&::before {
		content: '';
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-bottom-color: ${({ theme }) => theme.colors.amber};
	}
`

const Overlay = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['2']}`};
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
	display: flex;
	justify-content: space-between;
	align-items: center;
`

const NumberBadge = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: #fff;
	font-weight: ${({ theme }) => theme.font.weight.medium};
`

const InfoBadge = styled.div`
	width: 18px;
	height: 18px;
	border-radius: ${({ theme }) => theme.radii.full};
	background-color: rgba(100, 116, 139, 0.9);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: #fff;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	transition: background-color ${({ theme }) => theme.transitions.fast};

	${Wrapper}:hover & {
		background-color: rgba(217, 119, 6, 0.95);
	}
`

function ClockIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="10" />
			<path d="M12 6v6l4 2" />
		</svg>
	)
}

interface Props {
	readonly card: PokemonCard
	readonly owned?: boolean
	readonly planned?: boolean
	readonly plannedDate?: string
	readonly onClick?: () => void
	readonly showInfoBadge?: boolean
}

export function CardThumbnail({ card, owned = false, planned = false, plannedDate, onClick, showInfoBadge = false }: Props) {
	const getAriaLabel = () => {
		let status = ' (manquante)'
		if (owned) status = ' (possédée)'
		else if (planned) status = ' (achat planifié)'
		return `${card.name} — ${card.number} ${card.set.name}${status}`
	}

	const formatPlannedDate = (date: string) => {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		})
	}
	
	return (
		<Wrapper
			owned={owned}
			planned={planned}
			interactive={!!onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick && !planned ? 0 : undefined}
			onClick={planned ? undefined : onClick}
			onKeyDown={
				onClick && !planned
					? e => (e.key === 'Enter' || e.key === ' ') && onClick()
					: undefined
			}
			aria-label={getAriaLabel()}
			aria-disabled={planned}
		>
			<Img
				src={card.images.small}
				alt={`${card.name} — ${card.number} ${card.set.name}`}
				loading="lazy"
				$owned={owned}
				$planned={planned}
			/>
			{owned && !showInfoBadge && (
				<OwnedBadge aria-hidden="true" title="Possédée">
					✓
				</OwnedBadge>
			)}
			{!owned && planned && (
				<>
					<PlannedBadge aria-hidden="true" title="Achat planifié">
						<ClockIcon />
					</PlannedBadge>
					{plannedDate && (
						<PlannedTooltip>
							Prévu le {formatPlannedDate(plannedDate)}
						</PlannedTooltip>
					)}
				</>
			)}
			<Overlay>
				<NumberBadge aria-hidden="true">#{card.number}</NumberBadge>
				{showInfoBadge && (
					<InfoBadge aria-label="Cliquer pour plus d'informations" title="Plus d'informations">
						i
					</InfoBadge>
				)}
			</Overlay>
		</Wrapper>
	)
}
