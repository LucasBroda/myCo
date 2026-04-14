import { GlobalStyle } from '@/styles/GlobalStyle'
import { darkTheme, lightTheme } from '@/styles/theme'
import { ToastContainer } from '@components/ui/Toast'
import { useAuthStore } from '@store/authStore'
import { useUiStore } from '@store/uiStore'
import { Navigate, Outlet } from 'react-router'
import { ThemeProvider } from 'styled-components'

export default function RootLayout() {
	const isHydrated = useAuthStore(s => s.isHydrated)
	const themeMode = useUiStore(s => s.themeMode)

	if (!isHydrated) {
		return null
	}

	const theme = themeMode === 'dark' ? darkTheme : lightTheme

	return (
		<ThemeProvider theme={theme}>
			<GlobalStyle />
			<Outlet />
			<ToastContainer />
		</ThemeProvider>
	)
}

export function ProtectedRoute() {
	const user = useAuthStore(s => s.user)
	const isHydrated = useAuthStore(s => s.isHydrated)

	if (!isHydrated) return null
	if (!user) return <Navigate to="/login" replace />

	return <Outlet />
}

export function PublicOnlyRoute() {
	const user = useAuthStore(s => s.user)
	const isHydrated = useAuthStore(s => s.isHydrated)

	if (!isHydrated) return null
	if (user) return <Navigate to="/collections" replace />

	return <Outlet />
}
