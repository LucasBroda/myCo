import { focusRing } from '@/styles/mixins'
import ThemeToggle from '@components/ui/ThemeToggle'
import { useAuth } from '@hooks/useAuth'
import { Link, Outlet, useLocation } from 'react-router'
import styled from 'styled-components'

const Shell = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		flex-direction: row;
	}
`

const Sidebar = styled.nav`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	padding: ${({ theme }) => theme.spacing['4']};
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['4']};
	z-index: 10;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		flex-direction: column;
		align-items: flex-start;
		width: 220px;
		min-height: 100vh;
		border-bottom: none;
		border-right: 1px solid ${({ theme }) => theme.colors.border};
		padding: ${({ theme }) => theme.spacing['6']};
		position: sticky;
		top: 0;
		height: 100vh;
	}
`

const BrandContainer = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
	flex-shrink: 0;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		margin-bottom: ${({ theme }) => theme.spacing['8']};
		width: 100%;
	}
`

const Brand = styled.div`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const NavItems = styled.ul`
	display: flex;
	gap: ${({ theme }) => theme.spacing['2']};
	flex: 1;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		flex-direction: column;
		gap: ${({ theme }) => theme.spacing['1']};
	}
`

const StyledLink = styled(Link)<{ $isActive: boolean }>`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['3']}`};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textSecondary};
	transition:
		background-color ${({ theme }) => theme.transitions.fast},
		color ${({ theme }) => theme.transitions.fast};
	white-space: nowrap;
	text-decoration: none;

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	${({ $isActive, theme }) =>
		$isActive &&
		`
		background-color: ${theme.colors.amberLight};
		color: ${theme.colors.amber};
		font-weight: ${theme.font.weight.semibold};
	`}

	&:focus-visible {
		${focusRing}
	}
`

const LogoutButton = styled.button`
	margin-top: auto;
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => `${theme.spacing['2']} ${theme.spacing['3']}`};
	border-radius: ${({ theme }) => theme.radii.md};
	border: none;
	background: none;
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textSecondary};
	cursor: pointer;
	transition:
		background-color ${({ theme }) => theme.transitions.fast},
		color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.brickLight};
		color: ${({ theme }) => theme.colors.brick};
	}

	&:focus-visible {
		${focusRing}
	}
`

const Main = styled.main`
	flex: 1;
	padding: ${({ theme }) => theme.spacing['4']};

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		padding: ${({ theme }) => theme.spacing['6']};
	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		padding: ${({ theme }) => theme.spacing['8']};
	}
`

const navItems = [
	{ to: '/my-collections', label: 'Mes Collections' },
	{ to: '/all-collections', label: 'Toutes les Collections' },
	{ to: '/profile', label: 'Profil' },
	{ to: '/market', label: 'Marché' },
]

export default function AppLayout() {
	const { user, logout } = useAuth()
	const location = useLocation()

	return (
		<Shell>
			<Sidebar aria-label="Navigation principale">
				<BrandContainer>
					<Brand>myCo</Brand>
					<ThemeToggle />
				</BrandContainer>
				<NavItems>
					{navItems.map(item => (
						<li key={item.to}>
							<StyledLink
								to={item.to}
								$isActive={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
							>
								{item.label}
							</StyledLink>
						</li>
					))}
				</NavItems>
				{user && (
					<LogoutButton
						type="button"
						onClick={logout}
						aria-label={`Déconnexion — ${user.email}`}
					>
						Déconnexion
					</LogoutButton>
				)}
			</Sidebar>
			<Main>
				<Outlet />
			</Main>
		</Shell>
	)
}
