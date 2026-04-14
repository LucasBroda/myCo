import styled from 'styled-components'

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['12']};
	text-align: center;
	color: ${({ theme }) => theme.colors.textMuted};
`

const Icon = styled.span`
	font-size: 40px;
	display: block;
`

const Message = styled.p`
	font-size: ${({ theme }) => theme.font.size.base};
	margin: 0;
`

interface Props {
	message: string
	icon?: string
}

export function EmptyState({ message, icon = '📭' }: Props) {
	return (
		<Wrapper>
			<Icon aria-hidden="true">{icon}</Icon>
			<Message>{message}</Message>
		</Wrapper>
	)
}
