import { Button } from '@components/ui/Button'
import styled from 'styled-components'

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing['4']};
	padding: ${({ theme }) => theme.spacing['12']};
	text-align: center;
`

const Icon = styled.span`
	font-size: 40px;
	display: block;
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
			<Icon aria-hidden="true">⚠️</Icon>
			<Message>{message}</Message>
			{onRetry && (
				<Button variant="secondary" onClick={onRetry}>
					Réessayer
				</Button>
			)}
		</Wrapper>
	)
}
