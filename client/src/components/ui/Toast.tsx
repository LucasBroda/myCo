import type { Toast } from '@store/uiStore'
import { useUiStore } from '@store/uiStore'
import styled, { keyframes } from 'styled-components'

const slideIn = keyframes`
	from { transform: translateX(100%); opacity: 0; }
	to   { transform: translateX(0);    opacity: 1; }
`

const Container = styled.div`
	position: fixed;
	bottom: ${({ theme }) => theme.spacing['6']};
	right: ${({ theme }) => theme.spacing['4']};
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
	z-index: 9999;
	max-width: 360px;
	width: calc(100vw - ${({ theme }) => theme.spacing['8']});

	@media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
		width: 360px;
	}
`

const Item = styled.div<{ $type: Toast['type'] }>`
	display: flex;
	align-items: flex-start;
	gap: ${({ theme }) => theme.spacing['3']};
	padding: ${({ theme }) => `${theme.spacing['3']} ${theme.spacing['4']}`};
	border-radius: ${({ theme }) => theme.radii.lg};
	box-shadow: ${({ theme }) => theme.shadows.md};
	animation: ${slideIn} 200ms ease;
	font-size: ${({ theme }) => theme.font.size.sm};
	background-color: ${({ theme, $type }) =>
		$type === 'success'
			? theme.colors.forestLight
			: $type === 'error'
				? theme.colors.brickLight
				: theme.colors.surfaceElevated};
	border-left: 3px solid
		${({ theme, $type }) =>
			$type === 'success'
				? theme.colors.forest
				: $type === 'error'
					? theme.colors.brick
					: theme.colors.amber};
	color: ${({ theme }) => theme.colors.textPrimary};

	@media (prefers-reduced-motion: reduce) {
		animation: none;
	}
`

const Message = styled.p`
	flex: 1;
	line-height: ${({ theme }) => theme.font.lineHeight};
`

const DismissButton = styled.button`
	border: none;
	background: none;
	color: ${({ theme }) => theme.colors.textMuted};
	cursor: pointer;
	padding: 0;
	font-size: ${({ theme }) => theme.font.size.lg};
	line-height: 1;
	flex-shrink: 0;

	&:hover {
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

export function ConteneurToast() {
	const toasts = useUiStore(s => s.toasts)
	const dismiss = useUiStore(s => s.dismissToast)

	if (toasts.length === 0) return null

	return (
		<Container role="status" aria-live="polite" aria-label="Notifications">
			{toasts.map(t => (
				<Item key={t.id} $type={t.type}>
					<Message>{t.message}</Message>
					<DismissButton
						type="button"
						onClick={() => dismiss(t.id)}
						aria-label="Fermer la notification"
					>
						×
					</DismissButton>
				</Item>
			))}
		</Container>
	)
}
