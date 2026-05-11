/**
 * Page 404 - Page non trouvée
 * 
 * Affichée lorsque l'utilisateur accède à une route inexistante.
 * Design simple et épuré avec message explicite et lien de retour.
 * 
 * Fonctionnalités :
 * - Affichage du code d'erreur 404
 * - Message en français
 * - Lien de retour vers /collections (page d'accueil)
 * - Style minimaliste et centré
 */

import { focusRing } from '@/styles/mixins'
import { Link } from 'react-router'
import styled from 'styled-components'

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 50vh;
	gap: ${({ theme }) => theme.spacing['6']};
	text-align: center;
	padding: ${({ theme }) => theme.spacing['8']};
`

const Code = styled.p`
	font-size: ${({ theme }) => theme.font.size['4xl']};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.amber};
`

const Message = styled.p`
	font-size: ${({ theme }) => theme.font.size.xl};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const BackLink = styled(Link)`
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['6']}`};
	background-color: ${({ theme }) => theme.colors.amber};
	color: ${({ theme }) => theme.colors.textInverse};
	border-radius: ${({ theme }) => theme.radii.md};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.amberHover};
	}

	&:focus-visible {
		${focusRing}
	}
`

/**
 * Composant de la page 404
 * 
 * Affichage centré verticalement et horizontalement avec le code 404,
 * un message explicite et un bouton de retour vers la page des collections.
 */
export default function NotFoundPage() {
	return (
		<Wrapper>
			{/* Code d'erreur HTTP 404 en grand */}
			<Code>404</Code>
			<Message>Page introuvable</Message>
			{/* Lien de retour vers la page d'accueil de l'application */}
			<BackLink to="/collections">Retour aux collections</BackLink>
		</Wrapper>
	)
}
