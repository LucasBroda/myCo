/**
 * Hook personnalisé React pour la gestion de l'authentification
 * 
 * Ce hook fournit une interface simple pour :
 * - Vérifier si un utilisateur est connecté
 * - Connecter un utilisateur
 * - Déconnecter un utilisateur
 * - Accéder aux informations utilisateur
 * 
 * Il sert de pont entre les composants React et le store Zustand d'authentification.
 */

import { authService } from '@services/serviceAuthentification'
import { useAuthStore } from '@store/authStore'
import { useCallback } from 'react'

/**
 * Hook d'authentification
 * 
 * @returns Objet contenant l'état et les méthodes d'authentification
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthenticated, user, login, logout } = useAuth()
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={(email, pwd) => login(email, pwd)} />
 *   }
 *   
 *   return <div>Bonjour {user.email} <button onClick={logout}>Déconnexion</button></div>
 * }
 * ```
 */
export function useAuth() {
	// Sélecteurs Zustand pour extraire les données du store
	const user = useAuthStore(s => s.user)
	const accessToken = useAuthStore(s => s.accessToken)
	const setAuth = useAuthStore(s => s.setAuth)
	const logoutStore = useAuthStore(s => s.logout)

	// L'utilisateur est authentifié si user ET accessToken sont présents
	const isAuthenticated = !!user && !!accessToken

	/**
	 * Connecte un utilisateur avec email et mot de passe
	 * 
	 * Appelle le service d'authentification, puis met à jour le store
	 * avec les informations utilisateur et le token reçus.
	 * 
	 * @param email - Email de l'utilisateur
	 * @param password - Mot de passe
	 * @throws Error si les identifiants sont invalides
	 */
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

	/**
	 * Déconnecte l'utilisateur
	 * 
	 * Appelle le service backend pour invalider le token,
	 * puis efface les données locales du store.
	 * Utilise un bloc finally pour garantir le nettoyage local
	 * même si la requête backend échoue.
	 */
	const logout = useCallback(async () => {
		try {
			await authService.logout()
		} finally {
			// Efface toujours les données locales, même en cas d'erreur réseau
			logoutStore()
		}
	}, [logoutStore])

	return { user, isAuthenticated, login, logout }
}
