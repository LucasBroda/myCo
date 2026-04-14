import { Outlet } from 'react-router'
import styled from 'styled-components'

const Wrapper = styled.div`
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: ${({ theme }) => theme.colors.surface};
	padding: ${({ theme }) => theme.spacing['4']};
`

const Card = styled.div`
	width: 100%;
	max-width: 400px;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.xl};
	box-shadow: ${({ theme }) => theme.shadows.lg};
	padding: ${({ theme }) => theme.spacing['8']};
`

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

export default function AuthLayout() {
	return (
		<Wrapper>
			<Card>
				<Logo>
					<h1>myCo</h1>
					<p>Gestionnaire de collection Pokémon TCG</p>
				</Logo>
				<Outlet />
			</Card>
		</Wrapper>
	)
}
