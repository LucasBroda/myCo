import { Button } from '@components/ui/Bouton'
import styled from 'styled-components'
import { AlertIcon } from './Icones'

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing['4']};
	padding: ${({ theme }) => theme.spacing['12']};
	text-align: center;
`

const IconWrapper = styled.div`
	color: ${({ theme }) => theme.colors.brick};
	opacity: 0.8;
`

const Message = styled.p`
	font-size: ${({ theme }) => theme.font.size.base};
	color: ${({ theme }) => theme.colors.textSecondary};
	margin: 0;
`

interface Props {
	message: string
	onRetry?: () => void
}

export function ErrorState({ message, onRetry }: Props) {
	return (
		<Wrapper role="alert">
			<IconWrapper aria-hidden="true">
				<AlertIcon size={40} />
			</IconWrapper>
			<Message>{message}</Message>
			{onRetry && (
				<Button variant="secondary" onClick={onRetry}>
					Réessayer
				</Button>
			)}
		</Wrapper>
	)
}
