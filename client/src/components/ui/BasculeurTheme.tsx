import { focusRing } from '@/styles/mixins'
import { useUiStore } from '@store/uiStore'
import styled from 'styled-components'

const ToggleContainer = styled.button`
	position: relative;
	width: 52px;
	height: 28px;
	border-radius: ${({ theme }) => theme.radii.full};
	border: 2px solid ${({ theme }) => theme.colors.border};
	background-color: ${({ theme }) => theme.colors.surface};
	cursor: pointer;
	padding: 0;
	transition: all ${({ theme }) => theme.transitions.base};
	flex-shrink: 0;

	&:hover {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus-visible {
		${focusRing}
	}
`

const ToggleSlider = styled.span<{ $isDark: boolean }>`
	position: absolute;
	top: 2px;
	left: ${({ $isDark }) => ($isDark ? '2px' : 'calc(100% - 22px)')};
	width: 20px;
	height: 20px;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.amber};
	transition: all ${({ theme }) => theme.transitions.base};
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 10px;
	box-shadow: ${({ theme }) => theme.shadows.sm};

	&::before {
		content: '${({ $isDark }) => ($isDark ? '🌙' : '☀️')}';
		display: block;
		line-height: 1;
	}
`

export default function BasculeurTheme() {
	const { themeMode, toggleTheme } = useUiStore()
	const isDark = themeMode === 'dark'

	return (
		<ToggleContainer
			type="button"
			onClick={toggleTheme}
			aria-label={`Basculer vers le thème ${isDark ? 'clair' : 'sombre'}`}
			title={isDark ? 'Mode clair' : 'Mode sombre'}
		>
			<ToggleSlider $isDark={isDark} />
		</ToggleContainer>
	)
}
