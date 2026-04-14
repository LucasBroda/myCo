import styled from 'styled-components'

const Header = styled.header`
	margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const TitleRow = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing['4']};
	flex-wrap: wrap;
`

const Title = styled.h1`
	font-size: ${({ theme }) => theme.font.size['2xl']};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
	line-height: 1.2;
	margin: 0;
`

const Subtitle = styled.p`
	font-size: ${({ theme }) => theme.font.size.base};
	color: ${({ theme }) => theme.colors.textSecondary};
	margin: ${({ theme }) => `${theme.spacing['1']} 0 0`};
`

interface Props {
	title: string
	id?: string
	subtitle?: string
	actions?: React.ReactNode
}

export function PageHeader({ title, id, subtitle, actions }: Props) {
	return (
		<Header>
			<TitleRow>
				<div>
					<Title id={id}>{title}</Title>
					{subtitle && <Subtitle>{subtitle}</Subtitle>}
				</div>
				{actions && <div>{actions}</div>}
			</TitleRow>
		</Header>
	)
}
