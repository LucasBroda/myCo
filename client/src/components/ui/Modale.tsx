import { focusRing } from '@/styles/mixins'
import { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
	from { 
		opacity: 0; 
		backdrop-filter: blur(0px);
	}
	to { 
		opacity: 1; 
		backdrop-filter: blur(4px);
	}
`

const slideUp = keyframes`
	from { 
		opacity: 0; 
		transform: translateY(32px) scale(0.96); 
	}
	to { 
		opacity: 1; 
		transform: translateY(0) scale(1); 
	}
`

const Backdrop = styled.div`
	position: fixed;
	inset: 0;
	background: linear-gradient(
		135deg,
		rgba(28, 25, 23, 0.6) 0%,
		rgba(28, 25, 23, 0.7) 100%
	);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing['4']};
	z-index: 100;
	animation: ${fadeIn} ${({ theme }) => theme.transitions.base};

	@media (prefers-reduced-motion: reduce) {
		animation: none;
		backdrop-filter: none;
	}
`

const Dialog = styled.div`
	background: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.xl};
	box-shadow: 
		0 20px 60px rgba(0, 0, 0, 0.15),
		0 8px 24px rgba(0, 0, 0, 0.12),
		0 0 0 1px rgba(217, 119, 6, 0.1);
	width: 100%;
	max-width: 500px;
	max-height: 90vh;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	animation: ${slideUp} 350ms cubic-bezier(0.16, 1, 0.3, 1);

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		max-width: 100%;
		border-radius: ${({ theme }) => theme.radii.lg};
	}
`

const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['4']} 
	         ${({ theme }) => theme.spacing['3']};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	background: linear-gradient(
		to bottom,
		${({ theme }) => theme.colors.surfaceElevated} 0%,
		${({ theme }) => theme.colors.surface} 100%
	);
	position: relative;

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		padding: ${({ theme }) => theme.spacing['6']} ${({ theme }) => theme.spacing['6']} 
		         ${({ theme }) => theme.spacing['5']};
	}

	&::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: ${({ theme }) => theme.spacing['4']};
		right: ${({ theme }) => theme.spacing['4']};
		height: 2px;
		background: linear-gradient(
			to right,
			transparent 0%,
			${({ theme }) => theme.colors.amber} 50%,
			transparent 100%
		);
		opacity: 0.3;

		@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
			left: ${({ theme }) => theme.spacing['6']};
			right: ${({ theme }) => theme.spacing['6']};
		}
	}
`

const ModalTitle = styled.h2`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0;
	letter-spacing: -0.02em;
	line-height: 1.3;

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		font-size: ${({ theme }) => theme.font.size.xl};
	}
`

const CloseButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border: 1px solid transparent;
	background: none;
	border-radius: ${({ theme }) => theme.radii.md};
	color: ${({ theme }) => theme.colors.textSecondary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.font.size.xl};
	transition: all ${({ theme }) => theme.transitions.fast};
	position: relative;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: ${({ theme }) => theme.radii.md};
		background: ${({ theme }) => theme.colors.amber};
		opacity: 0;
		transition: opacity ${({ theme }) => theme.transitions.fast};
	}

	&:hover {
		background-color: ${({ theme }) => theme.colors.amberLight};
		color: ${({ theme }) => theme.colors.amber};
		border-color: ${({ theme }) => theme.colors.amberBorder};
		transform: scale(1.05);
	}

	&:active {
		transform: scale(0.95);
	}

	&:focus-visible {
		${focusRing}
		outline-offset: 3px;
	}

	span {
		position: relative;
		z-index: 1;
	}
`

export const ModalBody = styled.div`
	padding: ${({ theme }) => theme.spacing['5']} ${({ theme }) => theme.spacing['4']};
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};
	overflow-y: auto;
	flex: 1;

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		padding: ${({ theme }) => theme.spacing['8']} ${({ theme }) => theme.spacing['6']};
		gap: ${({ theme }) => theme.spacing['5']};
	}

	/* Scrollbar personnalisée */
	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: ${({ theme }) => theme.colors.surface};
		border-radius: ${({ theme }) => theme.radii.full};
	}

	&::-webkit-scrollbar-thumb {
		background: ${({ theme }) => theme.colors.border};
		border-radius: ${({ theme }) => theme.radii.full};
		
		&:hover {
			background: ${({ theme }) => theme.colors.borderStrong};
		}
	}
`

export const ModalFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['4']} ${({ theme }) => theme.spacing['4']} 
	         ${({ theme }) => theme.spacing['4']};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
	background: linear-gradient(
		to top,
		${({ theme }) => theme.colors.surfaceElevated} 0%,
		${({ theme }) => theme.colors.surface} 100%
	);

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		padding: ${({ theme }) => theme.spacing['5']} ${({ theme }) => theme.spacing['6']} 
		         ${({ theme }) => theme.spacing['6']};
	}

	@media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
		flex-direction: column-reverse;
		gap: ${({ theme }) => theme.spacing['2']};

		button {
			width: 100%;
		}
	}
`

interface ModalProps {
	readonly isOpen: boolean
	readonly onClose: () => void
	readonly title: string
	readonly children: React.ReactNode
	readonly initialFocusRef?: React.RefObject<HTMLElement | null>
}

export function Modale({
	isOpen,
	onClose,
	title,
	children,
	initialFocusRef,
}: ModalProps) {
	const closeButtonRef = useRef<HTMLButtonElement>(null)
	const triggerRef = useRef<Element | null>(null)

	useEffect(() => {
		if (isOpen) {
			triggerRef.current = document.activeElement
			const target = initialFocusRef?.current ?? closeButtonRef.current
			target?.focus()
		} else if (triggerRef.current instanceof HTMLElement) {
			triggerRef.current.focus()
		}
	}, [isOpen, initialFocusRef])

	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose()
		}
		if (isOpen) document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [isOpen, onClose])

	if (!isOpen) return null

	return (
		<Backdrop onClick={e => e.target === e.currentTarget && onClose()}>
			<Dialog role="dialog" aria-modal="true" aria-labelledby="modal-title">
				<ModalHeader>
					<ModalTitle id="modal-title">{title}</ModalTitle>
					<CloseButton
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						aria-label="Fermer la fenêtre"
					>
						<span>✕</span>
					</CloseButton>
				</ModalHeader>
				{children}
			</Dialog>
		</Backdrop>
	)
}
