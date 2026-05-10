import { focusRing } from '@/styles/mixins'
import { useAuth } from '@hooks/useAuth'
import { useToast } from '@hooks/useToast'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import styled from 'styled-components'

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};
`

const Field = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
`

const Label = styled.label`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const Input = styled.input`
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.base};
	font-family: inherit;
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	color: ${({ theme }) => theme.colors.textPrimary};
	transition: border-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.amber};
		box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.amberLight};
	}
`

const SubmitButton = styled.button`
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	background-color: ${({ theme }) => theme.colors.amber};
	color: ${({ theme }) => theme.colors.textInverse};
	border: none;
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.base};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	cursor: pointer;
	transition: background-color ${({ theme }) => theme.transitions.fast};
	min-height: 44px;

	&:hover {
		background-color: ${({ theme }) => theme.colors.amberHover};
	}

	&:disabled {
		background-color: ${({ theme }) => theme.colors.disabled};
		cursor: not-allowed;
	}

	&:focus-visible {
		${focusRing}
	}
`

const ErrorMessage = styled.p`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.brick};
	padding: ${({ theme }) => theme.spacing['3']};
	background-color: ${({ theme }) => theme.colors.brickLight};
	border-radius: ${({ theme }) => theme.radii.md};
	border: 1px solid ${({ theme }) => theme.colors.brickBorder};
`

const Footer = styled.p`
	text-align: center;
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};

	a {
		color: ${({ theme }) => theme.colors.amber};
		font-weight: ${({ theme }) => theme.font.weight.medium};

		&:hover {
			text-decoration: underline;
		}

		&:focus-visible {
			${focusRing}
		}
	}
`

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const { login } = useAuth()
	const { success } = useToast()
	const navigate = useNavigate()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			await login(email, password)
			success('Connexion réussie')
			navigate('/mes-collections')
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de connexion')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form
			onSubmit={handleSubmit}
			aria-label="Formulaire de connexion"
			noValidate
		>
			{error && (
				<ErrorMessage role="alert" id="login-error">
					{error}
				</ErrorMessage>
			)}

			<Field>
				<Label htmlFor="email">Adresse e-mail</Label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					autoComplete="email"
					required
					aria-describedby={error ? 'login-error' : undefined}
				/>
			</Field>

			<Field>
				<Label htmlFor="password">Mot de passe</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					autoComplete="current-password"
					required
				/>
			</Field>

			<SubmitButton type="submit" disabled={loading}>
				{loading ? 'Connexion…' : 'Se connecter'}
			</SubmitButton>

			<Footer>
				Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
			</Footer>
		</Form>
	)
}
