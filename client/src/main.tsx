import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import AppLayout from '@layout/AppLayout'
import AuthLayout from '@layout/AuthLayout'
import RootLayout, { ProtectedRoute, PublicOnlyRoute } from '@layout/RootLayout'

import CollectionsPage from '@pages/CollectionsPage'
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
			{ index: true, element: <Navigate to="/collections" replace /> },

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
							{ path: '/collections', element: <CollectionsPage /> },
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
