/**
 * Layout pour les pages d'authentification
 * 
 * Fournit une mise en page centrée avec une carte stylisée pour les formulaires
 * de connexion et d'inscription.
 * 
 * Design responsive :
 * - Mobile : carte pleine largeur avec padding
 * - Desktop : carte centrée avec largeur maximale de 400px
 */

import { Outlet } from 'react-router'
import styled from 'styled-components'

/**
 * Conteneur principal en plein écran
 * Centre le contenu verticalement et horizontalement
 */
const Wrapper = styled.div`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${({ theme }) => theme.colors.surface};
	padding: ${({ theme }) => theme.spacing['4']};
`

/**
 * Carte contenant le formulaire d'authentification
 * Largeur maximale 400px avec ombres et bordures arrondies
 */
const Card = styled.div`
	width: 100%;
	max-width: 400px;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.xl};
	box-shadow: ${({ theme }) => theme.shadows.lg};
	padding: ${({ theme }) => theme.spacing['8']};
`

/**
 * Section logo et description de l'application
 */
const Logo = styled.div`
	text-align: center;
	margin-bottom: ${({ theme }) => theme.spacing['6']};

	h1 {
		font-size: ${({ theme }) => theme.font.size['2xl']};
		font-weight: ${({ theme }) => theme.font.weight.bold};
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	p {
		font-size: ${({ theme }) => theme.font.size.sm};
		color: ${({ theme }) => theme.colors.textSecondary};
		margin-top: ${({ theme }) => theme.spacing['1']};
	}
`

/**
 * Composant AuthLayout
 * 
 * Affiche une carte centrée avec le logo myCo et injecte
 * les routes enfants (LoginPage, RegisterPage) via Outlet.
 */
export default function DispositionAuth() {
	return (
		<Wrapper>
			<Card>
				<Logo>
					<h1>myCo</h1>
					<p>Gestionnaire de collection Pokémon TCG</p>
				</Logo>
				{/* Outlet = injecte LoginPage ou RegisterPage */}
				<Outlet />
			</Card>
		</Wrapper>
	)
}
