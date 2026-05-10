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

export default function NotFoundPage() {
	return (
		<Wrapper>
			<Code>404</Code>
			<Message>Page introuvable</Message>
			<BackLink to="/collections">Retour aux collections</BackLink>
		</Wrapper>
	)
}
