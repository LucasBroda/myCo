/**
 * Layout principal de l'application
 * 
 * Fournit la structure de navigation principale avec :
 * - Sidebar persistante sur desktop (sticky)
 * - Menu hamburger responsive sur mobile
 * - Navigation vers toutes les pages de l'application
 * - Basculeur de thème (clair/sombre)
 * - Bouton de déconnexion
 * 
 * Design responsive :
 * - Mobile : navigation en haut + menu latéral coulissant
 * - Desktop : sidebar fixe à gauche (220px de large)
 */

import { focusRing } from '@/styles/mixins'
import ThemeToggle from '@components/ui/BasculeurTheme'
import { useAuth } from '@hooks/useAuth'
import { Link, Outlet, useLocation } from 'react-router'
import { useState } from 'react'
import styled from 'styled-components'

/**
 * Conteneur principal flex
 * Colonne sur mobile, ligne sur desktop
 */
const Shell = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		flex-direction: row;
	}
`

/**
 * Sidebar de navigation
 * Barre horizontale sur mobile, sidebar verticale sticky sur desktop
 */
const Sidebar = styled.nav`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing['3']};
	z-index: 10;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		width: 220px;
		min-height: 100vh;
		border-bottom: none;
		border-right: 1px solid ${({ theme }) => theme.colors.border};
		padding: ${({ theme }) => theme.spacing['6']};
		/* Sticky pour garder la sidebar visible pendant le scroll */
		position: sticky;
		top: 0;
		height: 100vh;
		gap: ${({ theme }) => theme.spacing['4']};
	}
`

/**
 * Bouton hamburger pour ouvrir le menu mobile
 * Masqué sur desktop
 */
const BurgerButton = styled.button`
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	width: 40px;
	height: 40px;
	background: transparent;
	border: none;
	cursor: pointer;
	padding: ${({ theme }) => theme.spacing['2']};
	border-radius: ${({ theme }) => theme.radii.md};
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
	}

	&:focus-visible {
		${focusRing}
	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		display: none;
	}

	/* Trois barres horizontales formant l'icône hamburger */
	span {
		width: 24px;
		height: 2px;
		background: ${({ theme }) => theme.colors.textPrimary};
		border-radius: ${({ theme }) => theme.radii.full};
		transition: all ${({ theme }) => theme.transitions.fast};
		transform-origin: center;
	}
`

/**
 * Overlay semi-transparent derrière le menu mobile
 * Cliquer dessus ferme le menu
 */
const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
	display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
	position: fixed;
	inset: 0;
	background: rgba(28, 25, 23, 0.6);
	backdrop-filter: blur(4px);
	z-index: 50;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		display: none;
	}
`

/**
 * Menu mobile coulissant depuis la gauche
 * Animation de translation pour l'ouverture/fermeture
 */
const MobileMenu = styled.div<{ $isOpen: boolean }>`
	display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
	flex-direction: column;
	position: fixed;
	top: 0;
	left: 0;
	width: 80%;
	max-width: 320px;
	height: 100vh;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border-right: 1px solid ${({ theme }) => theme.colors.border};
	padding: ${({ theme }) => theme.spacing['6']};
	z-index: 51;
	overflow-y: auto;
	transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
	transition: transform ${({ theme }) => theme.transitions.base};

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		display: none;
	}
`

const MobileMenuHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: ${({ theme }) => theme.spacing['8']};
`

const CloseButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	background: transparent;
	border: none;
	cursor: pointer;
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.xl};
	color: ${({ theme }) => theme.colors.textSecondary};
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	&:focus-visible {
		${focusRing}
	}
`

const MobileNavItems = styled.ul`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
	margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const MobileThemeToggleWrapper = styled.div`
	padding: ${({ theme }) => theme.spacing['3']} 0;
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	margin-top: auto;
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
	display: none;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		display: flex;
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

const MobileLogoutButton = styled.button`
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
	width: 100%;
	text-align: left;

	&:hover {
		background-color: ${({ theme }) => theme.colors.brickLight};
		color: ${({ theme }) => theme.colors.brick};
	}

	&:focus-visible {
		${focusRing}
	}
`

const LogoutButton = styled.button`
	display: none;

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
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
	{ to: '/mes-collections', label: 'Mes collections' },
	{ to: '/toutes-collections', label: 'Toutes les collections' },
	{ to: '/mes-cartes', label: 'Mes cartes' },
	{ to: '/mes-ventes', label: 'Mes ventes' },
	{ to: '/profil', label: 'Profil' },
	{ to: '/marche', label: 'Marché' },
]

export default function AppLayout() {
	const { user, logout } = useAuth()
	const location = useLocation()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const handleCloseMobileMenu = () => {
		setIsMobileMenuOpen(false)
	}

	const handleLogout = () => {
		logout()
		handleCloseMobileMenu()
	}

	return (
		<Shell>
			<Sidebar aria-label="Navigation principale">
				<BrandContainer>
					<Brand>myCo</Brand>
				</BrandContainer>
				<BurgerButton
					type="button"
					onClick={() => setIsMobileMenuOpen(true)}
					aria-label="Ouvrir le menu"
				>
					<span />
					<span />
					<span />
				</BurgerButton>
				<NavItems>
					<li>
						<ThemeToggle />
					</li>
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

			{/* Menu mobile */}
			<MobileMenuOverlay $isOpen={isMobileMenuOpen} onClick={handleCloseMobileMenu} />
			<MobileMenu $isOpen={isMobileMenuOpen}>
				<MobileMenuHeader>
					<Brand>myCo</Brand>
					<CloseButton
						type="button"
						onClick={handleCloseMobileMenu}
						aria-label="Fermer le menu"
					>
						×
					</CloseButton>
				</MobileMenuHeader>

				<MobileNavItems>
					{navItems.map(item => (
						<li key={item.to}>
							<StyledLink
								to={item.to}
								$isActive={location.pathname === item.to || location.pathname.startsWith(item.to + '/')}
								onClick={handleCloseMobileMenu}
							>
								{item.label}
							</StyledLink>
						</li>
					))}
				</MobileNavItems>

				{user && (
					<MobileLogoutButton
						type="button"
						onClick={handleLogout}
						aria-label={`Déconnexion — ${user.email}`}
					>
						Déconnexion
					</MobileLogoutButton>
				)}

				<MobileThemeToggleWrapper>
					<ThemeToggle />
				</MobileThemeToggleWrapper>
			</MobileMenu>

			<Main>
				<Outlet />
			</Main>
		</Shell>
	)
}
