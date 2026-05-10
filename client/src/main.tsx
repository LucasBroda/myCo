import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import AppLayout from '@layout/AppLayout'
import AuthLayout from '@layout/AuthLayout'
import RootLayout, { ProtectedRoute, PublicOnlyRoute } from '@layout/RootLayout'

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

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ index: true, element: <Navigate to="/mes-collections" replace /> },

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

			{
				element: <ProtectedRoute />,
				children: [
					{
						element: <AppLayout />,
						children: [
							{ path: '/mes-collections', element: <MyCollectionsPage /> },
							{ path: '/toutes-collections', element: <AllCollectionsPage /> },
							{ path: '/mes-cartes', element: <MyCardsPage /> },
							{ path: '/mes-ventes', element: <MySalesPage /> },
							{ path: '/collections', element: <Navigate to="/mes-collections" replace /> },
							{ path: '/collections/:setId', element: <SetDetailPage /> },
							{ path: '/profil', element: <ProfilePage /> },
							{ path: '/marche', element: <MarketPage /> },
						],
					},
				],
			},

			{ path: '*', element: <NotFoundPage /> },
		],
	},
])

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
)
