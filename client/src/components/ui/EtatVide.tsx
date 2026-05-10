import styled from 'styled-components'
import type { ReactNode } from 'react'
import { MailboxIcon } from './Icones'

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

const IconWrapper = styled.div`
	color: ${({ theme }) => theme.colors.textMuted};
	opacity: 0.6;
`

const Message = styled.p`
	font-size: ${({ theme }) => theme.font.size.base};
	margin: 0;
`

interface Props {
	message: string
	icon?: ReactNode
}

export function EmptyState({ message, icon }: Props) {
	return (
		<Wrapper>
			<IconWrapper aria-hidden="true">
				{icon || <MailboxIcon size={40} />}
			</IconWrapper>
			<Message>{message}</Message>
		</Wrapper>
	)
}
