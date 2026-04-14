import { focusRing } from '@/styles/mixins'
import type { PokemonSet } from '@/types/models'
import { ProgressBar } from '@components/ui/ProgressBar'
import styled from 'styled-components'

const Wrapper = styled.article`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	padding: ${({ theme }) => theme.spacing['4']};
	cursor: pointer;
	transition:
		box-shadow ${({ theme }) => theme.transitions.fast},
		transform ${({ theme }) => theme.transitions.fast};

	&:hover {
		box-shadow: ${({ theme }) => theme.shadows.md};
		transform: translateY(-1px);
	}

	&:focus-visible {
		${focusRing}
	}
`

const Header = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
	margin-bottom: ${({ theme }) => theme.spacing['3']};
`

const Logo = styled.img`
	width: 48px;
	height: 48px;
	object-fit: contain;
	flex-shrink: 0;
`

const Info = styled.div`
	flex: 1;
	min-width: 0;
`

const SetName = styled.h3`
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 2px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`

const Series = styled.p`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
	margin: 0;
`

interface Props {
	set: PokemonSet
	ownedCount: number
	onClick: () => void
}

export function SetCard({ set, ownedCount, onClick }: Props) {
	return (
		<Wrapper
			tabIndex={0}
			onClick={onClick}
			onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
			aria-label={`${set.name} — ${ownedCount} sur ${set.total} cartes`}
		>
			<Header>
				<Logo
					src={set.images.logo}
					alt={`Logo du set ${set.name}`}
					loading="lazy"
				/>
				<Info>
					<SetName>{set.name}</SetName>
					<Series>{set.series}</Series>
				</Info>
			</Header>
			<ProgressBar value={ownedCount} max={set.total} />
		</Wrapper>
	)
}
