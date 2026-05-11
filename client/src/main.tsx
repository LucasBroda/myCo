/**
 * Point d'entrée principal de l'application React
 * 
 * Ce fichier :
 * 1. Configure le routeur de l'application avec toutes les routes
 * 2. Définit la hiérarchie des layouts (auth, app, root)
 * 3. Gère les routes protégées et publiques
 * 4. Monte l'application dans le DOM
 * 
 * Structure de routage :
 * - RootLayout : Layout racine (toujours actif)
 *   - PublicOnlyRoute : Routes accessibles uniquement aux non-connectés
 *     - AuthLayout : Layout pour les pages d'authentification
 *       - /connexion
 *       - /inscription
 *   - ProtectedRoute : Routes nécessitant une authentification
 *     - AppLayout : Layout principal de l'application
 *       - /mes-collections
 *       - /toutes-collections
 *       - /mes-cartes
 *       - /mes-ventes
 *       - /profil
 *       - /marche
 *       - /collections/:setId
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

// Layouts
import AppLayout from '@layout/AppLayout'
import AuthLayout from '@layout/AuthLayout'
import RootLayout, { ProtectedRoute, PublicOnlyRoute } from '@layout/RootLayout'

// Pages
import AllCollectionsPage from '@pages/PageToutesCollections'
import MyCollectionsPage from '@pages/PageMesCollections'
import MyCardsPage from '@pages/PageMesCartes'
import MySalesPage from '@pages/PageMesVentes'
import LoginPage from '@pages/PageConnexion'
import MarketPage from '@pages/PageMarche'
import NotFoundPage from '@pages/PageNonTrouvee'
import ProfilePage from '@pages/PageProfil'
import RegisterPage from '@pages/PageInscription'
import SetDetailPage from '@pages/PageDetailsCollection'

/**
 * Configuration du routeur de l'application
 * 
 * Utilise createBrowserRouter (API moderne de React Router v6+) plutôt que
 * BrowserRouter pour bénéficier de fonctionnalités avancées comme :
 * - Data loading/fetching intégré
 * - Actions pour les mutations
 * - Meilleure gestion des erreurs
 * - Navigation programmatique améliorée
 */
const router = createBrowserRouter([
	{
		// Layout racine englobant toute l'application
		element: <RootLayout />,
		children: [
			// Redirection de la racine vers /mes-collections
			{ index: true, element: <Navigate to="/mes-collections" replace /> },

			// Routes publiques (accessibles uniquement si NON connecté)
			{
				element: <PublicOnlyRoute />,
				children: [
					{
						element: <AuthLayout />,
						children: [
							{ path: '/connexion', element: <LoginPage /> },
							{ path: '/inscription', element: <RegisterPage /> },
						],
					},
				],
			},

			// Routes protégées (nécessitent une authentification)
			{
				element: <ProtectedRoute />,
				children: [
					{
						// Layout principal avec navigation
						element: <AppLayout />,
						children: [
							// Page : Mes collections suivies
							{ path: '/mes-collections', element: <MyCollectionsPage /> },
							
							// Page : Toutes les collections disponibles
							{ path: '/toutes-collections', element: <AllCollectionsPage /> },
							
							// Page : Mes cartes acquises
							{ path: '/mes-cartes', element: <MyCardsPage /> },
							
							// Page : Mes ventes planifiées
							{ path: '/mes-ventes', element: <MySalesPage /> },
							
							// Redirection pour compatibilité
							{ path: '/collections', element: <Navigate to="/mes-collections" replace /> },
							
							// Page : Détails d'une édition spécifique
							{ path: '/collections/:setId', element: <SetDetailPage /> },
							
							// Page : Profil utilisateur
							{ path: '/profil', element: <ProfilePage /> },
							
							// Page : Marché (recherche et achats planifiés)
							{ path: '/marche', element: <MarketPage /> },
						],
					},
				],
			},

			// Catch-all pour les routes non trouvées (404)
			{ path: '*', element: <NotFoundPage /> },
		],
	},
])

/**
 * Montage de l'application React dans le DOM
 * 
 * Utilise StrictMode pour activer les vérifications supplémentaires en développement :
 * - Détection des effets de bord dans le rendu
 * - Avertissements sur les API dépréciées
 * - Double invocation des effets (pour détecter les problèmes de cleanup)
 */
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
)
