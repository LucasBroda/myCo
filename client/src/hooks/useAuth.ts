import { authService } from '@services/serviceAuthentification'
import { useAuthStore } from '@store/authStore'
import { useCallback } from 'react'

export function useAuth() {
	const user = useAuthStore(s => s.user)
	const accessToken = useAuthStore(s => s.accessToken)
	const setAuth = useAuthStore(s => s.setAuth)
	const logoutStore = useAuthStore(s => s.logout)

	const isAuthenticated = !!user && !!accessToken

	const login = useCallback(
		async (email: string, password: string) => {
			const { user: u, accessToken: token } = await authService.login(
				email,
				password
			)
			setAuth(u, token)
		},
		[setAuth]
	)

	const logout = useCallback(async () => {
		try {
			await authService.logout()
		} finally {
			logoutStore()
		}
	}, [logoutStore])

	return { user, isAuthenticated, login, logout }
}
