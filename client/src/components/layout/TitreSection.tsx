import styled from 'styled-components'

export const SectionTitle = styled.h2`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 ${({ theme }) => theme.spacing['4']};
`
