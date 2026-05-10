import { focusRing } from '@/styles/mixins'
import { useToast } from '@hooks/useToast'
import { authService } from '@services/serviceAuthentification'
import { useAuthStore } from '@store/authStore'
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

export default function RegisterPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const setAuth = useAuthStore(s => s.setAuth)
	const { success } = useToast()
	const navigate = useNavigate()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError('')
		setLoading(true)
		try {
			const { user, accessToken } = await authService.register(email, password)
			setAuth(user, accessToken)
			success('Compte créé avec succès')
			navigate('/mes-collections')
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Erreur lors de l'inscription"
			)
		} finally {
			setLoading(false)
		}
	}

	return (
		<Form
			onSubmit={handleSubmit}
			aria-label="Formulaire d'inscription"
			noValidate
		>
			{error && <ErrorMessage role="alert">{error}</ErrorMessage>}

			<Field>
				<Label htmlFor="reg-email">Adresse e-mail</Label>
				<Input
					id="reg-email"
					type="email"
					value={email}
					onChange={e => setEmail(e.target.value)}
					autoComplete="email"
					required
				/>
			</Field>

			<Field>
				<Label htmlFor="reg-password">
					Mot de passe (8 caractères minimum)
				</Label>
				<Input
					id="reg-password"
					type="password"
					value={password}
					onChange={e => setPassword(e.target.value)}
					autoComplete="new-password"
					minLength={8}
					required
				/>
			</Field>

			<SubmitButton type="submit" disabled={loading}>
				{loading ? 'Création…' : 'Créer mon compte'}
			</SubmitButton>

			<Footer>
				Déjà un compte ? <Link to="/connexion">Se connecter</Link>
			</Footer>
		</Form>
	)
}
