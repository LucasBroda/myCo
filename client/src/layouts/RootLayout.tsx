/**
 * Layout racine de l'application
 * 
 * Ce composant englobe toute l'application et fournit :
 * - Le ThemeProvider pour styled-components (thème clair/sombre)
 * - Les styles globaux CSS
 * - Le conteneur des notifications toast
 * - La gestion de l'hydration (rechargement depuis localStorage)
 * 
 * Il est le parent de tous les autres layouts et routes.
 */

import { GlobalStyle } from '@/styles/GlobalStyle'
import { darkTheme, lightTheme } from '@/styles/theme'
import { ToastContainer } from '@components/ui/Toast'
import { useAuthStore } from '@store/authStore'
import { useUiStore } from '@store/uiStore'
import { Navigate, Outlet } from 'react-router'
import { ThemeProvider } from 'styled-components'

/**
 * Composant Layout racine
 * 
 * Attend que l'hydration soit complète avant d'afficher l'application
 * pour éviter le flash de contenu non authentifié.
 */
export default function RootLayout() {
	// Vérifie si le store d'authentification a fini de charger depuis localStorage
	const isHydrated = useAuthStore(s => s.isHydrated)
	// Récupère le mode de thème actuel (persisté dans localStorage)
	const themeMode = useUiStore(s => s.themeMode)

	// Tant que l'hydration n'est pas terminée, n'affiche rien
	// Cela évite les redirections indésirables pendant le chargement
	if (!isHydrated) {
		return null
	}

	// Sélectionne le thème approprié selon la préférence utilisateur
	const theme = themeMode === 'dark' ? darkTheme : lightTheme

	return (
		<ThemeProvider theme={theme}>
			{/* Styles globaux (reset CSS, typographie, etc.) */}
			<GlobalStyle />
			
			{/* Outlet = point d'injection des routes enfants */}
			<Outlet />
			
			{/* Conteneur des notifications toast (position fixed) */}
			<ToastContainer />
		</ThemeProvider>
	)
}

/**
 * Composant de protection de routes
 * 
 * Redirige vers /connexion si l'utilisateur n'est pas authentifié.
 * Utilisé pour protéger toutes les pages nécessitant une authentification.
 * 
 * @example
 * Dans le routeur :
 * ```tsx
 * {
 *   element: <ProtectedRoute />,
 *   children: [
 *     { path: '/mes-cartes', element: <MyCardsPage /> },
 *     // ...
 *   ]
 * }
 * ```
 */
export function ProtectedRoute() {
	const user = useAuthStore(s => s.user)
	const isHydrated = useAuthStore(s => s.isHydrated)

	// Attend l'hydration complète
	if (!isHydrated) return null
	
	// Si pas d'utilisateur connecté, redirige vers la page de connexion
	if (!user) return <Navigate to="/connexion" replace />

	// Utilisateur authentifié : affiche les routes enfants
	return <Outlet />
}

/**
 * Composant de routes publiques uniquement
 * 
 * Redirige vers /mes-collections si l'utilisateur est déjà connecté.
 * Utilisé pour les pages d'authentification (connexion, inscription).
 * 
 * @example
 * Dans le routeur :
 * ```tsx
 * {
 *   element: <PublicOnlyRoute />,
 *   children: [
 *     { path: '/connexion', element: <LoginPage /> },
 *     { path: '/inscription', element: <RegisterPage /> },
 *   ]
 * }
 * ```
 */
export function PublicOnlyRoute() {
	const user = useAuthStore(s => s.user)
	const isHydrated = useAuthStore(s => s.isHydrated)

	// Attend l'hydration complète
	if (!isHydrated) return null
	
	// Si utilisateur déjà connecté, redirige vers l'app
	if (user) return <Navigate to="/mes-collections" replace />

	// Pas d'utilisateur : affiche les routes publiques (connexion/inscription)
	return <Outlet />
}
