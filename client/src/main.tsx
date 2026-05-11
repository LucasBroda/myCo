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
import DispositionApp from '@layout/AppLayout'
import DispositionAuth from '@layout/AuthLayout'
import DispositionRacine, { RouteProtegee, RoutePubliqueUniquement } from '@layout/RootLayout'

// Pages
import PageToutesCollections from '@pages/PageToutesCollections'
import PageMesCollections from '@pages/PageMesCollections'
import PageMesCartes from '@pages/PageMesCartes'
import PageMesVentes from '@pages/PageMesVentes'
import PageConnexion from '@pages/PageConnexion'
import PageMarche from '@pages/PageMarche'
import PageNonTrouvee from '@pages/PageNonTrouvee'
import PageProfil from '@pages/PageProfil'
import PageInscription from '@pages/PageInscription'
import PageDetailsCollection from '@pages/PageDetailsCollection'

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
		element: <DispositionRacine />,
		children: [
			// Redirection de la racine vers /mes-collections
			{ index: true, element: <Navigate to="/mes-collections" replace /> },

			// Routes publiques (accessibles uniquement si NON connecté)
			{
				element: <RoutePubliqueUniquement />,
				children: [
					{
						element: <DispositionAuth />,
						children: [
							{ path: '/connexion', element: <PageConnexion /> },
							{ path: '/inscription', element: <PageInscription /> },
						],
					},
				],
			},

			// Routes protégées (nécessitent une authentification)
			{
				element: <RouteProtegee />,
				children: [
					{
						// Layout principal avec navigation
						element: <DispositionApp />,
						children: [
							// Page : Mes collections suivies
							{ path: '/mes-collections', element: <PageMesCollections /> },
							
							// Page : Toutes les collections disponibles
							{ path: '/toutes-collections', element: <PageToutesCollections /> },
							
							// Page : Mes cartes acquises
							{ path: '/mes-cartes', element: <PageMesCartes /> },
							
							// Page : Mes ventes planifiées
							{ path: '/mes-ventes', element: <PageMesVentes /> },
							
							// Redirection pour compatibilité
							{ path: '/collections', element: <Navigate to="/mes-collections" replace /> },
							
							// Page : Détails d'une édition spécifique
							{ path: '/collections/:setId', element: <PageDetailsCollection /> },
							
							// Page : Profil utilisateur
							{ path: '/profil', element: <PageProfil /> },
							
							// Page : Marché (recherche et achats planifiés)
							{ path: '/marche', element: <PageMarche /> },
						],
					},
				],
			},

			// Catch-all pour les routes non trouvées (404)
			{ path: '*', element: <PageNonTrouvee /> },
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
