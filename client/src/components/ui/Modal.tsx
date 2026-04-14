import { focusRing } from '@/styles/mixins'
import { useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
	from { opacity: 0; }
	to { opacity: 1; }
`

const slideUp = keyframes`
	from { opacity: 0; transform: translateY(16px) scale(0.98); }
	to { opacity: 1; transform: translateY(0) scale(1); }
`

const Backdrop = styled.div`
	position: fixed;
	inset: 0;
	background-color: ${({ theme }) => theme.colors.overlay};
	display: flex;
	align-items: center;
	justify-content: center;
	padding: ${({ theme }) => theme.spacing['4']};
	z-index: 100;
	animation: ${fadeIn} ${({ theme }) => theme.transitions.fast};

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`

const Dialog = styled.div`
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border-radius: ${({ theme }) => theme.radii.xl};
	box-shadow: ${({ theme }) => theme.shadows.lg};
	width: 100%;
	max-width: 480px;
	max-height: 90vh;
	overflow-y: auto;
	animation: ${slideUp} ${({ theme }) => theme.transitions.base};

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`

const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: ${({ theme }) => theme.spacing['6']};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const ModalTitle = styled.h2`
	font-size: ${({ theme }) => theme.font.size.lg};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0;
`

const CloseButton = styled.button`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	background: none;
	border-radius: ${({ theme }) => theme.radii.md};
	color: ${({ theme }) => theme.colors.textSecondary};
	cursor: pointer;
	font-size: ${({ theme }) => theme.font.size.lg};
	transition: background-color ${({ theme }) => theme.transitions.fast};

	&:hover {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	&:focus-visible {
		${focusRing}
	}
`

export const ModalBody = styled.div`
	padding: ${({ theme }) => theme.spacing['6']};
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['4']};
`

export const ModalFooter = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => theme.spacing['6']};
	border-top: 1px solid ${({ theme }) => theme.colors.border};
`

interface ModalProps {
	isOpen: boolean
	onClose: () => void
	title: string
	children: React.ReactNode
	initialFocusRef?: React.RefObject<HTMLElement | null>
}

export function Modal({
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
		} else {
			if (triggerRef.current instanceof HTMLElement) {
				triggerRef.current.focus()
			}
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
						✕
					</CloseButton>
				</ModalHeader>
				{children}
			</Dialog>
		</Backdrop>
	)
}
