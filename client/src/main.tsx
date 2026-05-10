import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import AppLayout from '@layout/AppLayout'
import AuthLayout from '@layout/AuthLayout'
import RootLayout, { ProtectedRoute, PublicOnlyRoute } from '@layout/RootLayout'

import AllCollectionsPage from '@pages/AllCollectionsPage'
import MyCollectionsPage from '@pages/MyCollectionsPage'
import MyCardsPage from '@pages/MyCardsPage'
import MySalesPage from '@pages/MySalesPage'
import LoginPage from '@pages/LoginPage'
import MarketPage from '@pages/MarketPage'
import NotFoundPage from '@pages/NotFoundPage'
import ProfilePage from '@pages/ProfilePage'
import RegisterPage from '@pages/RegisterPage'
import SetDetailPage from '@pages/SetDetailPage'

const router = createBrowserRouter([
	{
		element: <RootLayout />,
		children: [
			{ index: true, element: <Navigate to="/my-collections" replace /> },

			{
				element: <PublicOnlyRoute />,
				children: [
					{
						element: <AuthLayout />,
						children: [
							{ path: '/login', element: <LoginPage /> },
							{ path: '/register', element: <RegisterPage /> },
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
							{ path: '/my-collections', element: <MyCollectionsPage /> },
							{ path: '/all-collections', element: <AllCollectionsPage /> },
							{ path: '/my-cards', element: <MyCardsPage /> },
							{ path: '/my-sales', element: <MySalesPage /> },
							{ path: '/collections', element: <Navigate to="/my-collections" replace /> },
							{ path: '/collections/:setId', element: <SetDetailPage /> },
							{ path: '/profile', element: <ProfilePage /> },
							{ path: '/market', element: <MarketPage /> },
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
