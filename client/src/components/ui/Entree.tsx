import { focusRing } from '@/styles/mixins'
import styled, { css } from 'styled-components'

type InputSize = 'sm' | 'md'

interface InputProps {
	inputSize?: InputSize
	hasError?: boolean
}

export const Input = styled.input<InputProps>`
	width: 100%;
	border-radius: ${({ theme }) => theme.radii.md};
	border: 1px solid
		${({ theme, hasError }) =>
			hasError ? theme.colors.brick : theme.colors.border};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	color: ${({ theme }) => theme.colors.textPrimary};
	font-family: inherit;
	transition:
		border-color ${({ theme }) => theme.transitions.fast},
		box-shadow ${({ theme }) => theme.transitions.fast};

	${({ inputSize = 'md', theme }) =>
		inputSize === 'sm'
			? css`
					padding: ${theme.spacing['2']} ${theme.spacing['3']};
					font-size: ${theme.font.size.sm};
					min-height: 36px;
				`
			: css`
					padding: ${theme.spacing['3']} ${theme.spacing['4']};
					font-size: ${theme.font.size.base};
					min-height: 44px;
				`}

	&::placeholder {
		color: ${({ theme }) => theme.colors.textMuted};
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.amber};
		box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.amberLight};
	}

	&:focus-visible {
		${focusRing}
	}

	&:disabled {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.disabledText};
		cursor: not-allowed;
	}
`

interface FieldProps {
	children: React.ReactNode
	label: string
	htmlFor: string
	hint?: string
	error?: string
}

const FieldWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
`

const Label = styled.label`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const Hint = styled.p`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textMuted};
	margin: 0;
`

const ErrorText = styled.p`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.brick};
	margin: 0;
`

export function Field({ children, label, htmlFor, hint, error }: FieldProps) {
	return (
		<FieldWrapper>
			<Label htmlFor={htmlFor}>{label}</Label>
			{children}
			{hint && !error && <Hint>{hint}</Hint>}
			{error && <ErrorText role="alert">{error}</ErrorText>}
		</FieldWrapper>
	)
}
