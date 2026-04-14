import { focusRing } from '@/styles/mixins'
import type { PokemonCard } from '@/types/models'
import styled, { css } from 'styled-components'

interface ThumbnailProps {
	owned?: boolean
	interactive?: boolean
}

const Wrapper = styled.div<ThumbnailProps>`
	position: relative;
	border-radius: ${({ theme }) => theme.radii.md};
	overflow: hidden;
	border: 2px solid
		${({ theme, owned }) =>
			owned ? theme.colors.forestBorder : theme.colors.border};
	background-color: ${({ theme }) => theme.colors.surface};
	aspect-ratio: 2 / 3;
	transition:
		border-color ${({ theme }) => theme.transitions.fast},
		box-shadow ${({ theme }) => theme.transitions.fast},
		transform ${({ theme }) => theme.transitions.fast};

	${({ interactive, theme }) =>
		interactive &&
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

const Img = styled.img<{ $owned: boolean }>`
	width: 100%;
	height: 100%;
	object-fit: cover;
	opacity: ${({ $owned }) => ($owned ? 1 : 0.45)};
	transition: opacity ${({ theme }) => theme.transitions.fast};

	${Wrapper}:hover & {
		opacity: ${({ $owned }) => ($owned ? 1 : 0.65)};
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
`

const Overlay = styled.div`
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing['2']}`};
	background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
`

const NumberBadge = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: #fff;
	font-weight: ${({ theme }) => theme.font.weight.medium};
`

interface Props {
	card: PokemonCard
	owned?: boolean
	onClick?: () => void
}

export function CardThumbnail({ card, owned = false, onClick }: Props) {
	return (
		<Wrapper
			owned={owned}
			interactive={!!onClick}
			role={onClick ? 'button' : undefined}
			tabIndex={onClick ? 0 : undefined}
			onClick={onClick}
			onKeyDown={
				onClick
					? e => (e.key === 'Enter' || e.key === ' ') && onClick()
					: undefined
			}
			aria-label={`${card.name} — ${card.number} ${card.set.name}${owned ? ' (possédée)' : ' (manquante)'}`}
		>
			<Img
				src={card.images.small}
				alt={`${card.name} — ${card.number} ${card.set.name}`}
				loading="lazy"
				$owned={owned}
			/>
			{owned && (
				<OwnedBadge aria-hidden="true" title="Possédée">
					✓
				</OwnedBadge>
			)}
			<Overlay>
				<NumberBadge aria-hidden="true">#{card.number}</NumberBadge>
			</Overlay>
		</Wrapper>
	)
}
