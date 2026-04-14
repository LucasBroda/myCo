import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
	id: string
	email: string
}

interface AuthState {
	user: User | null
	accessToken: string | null
	isHydrated: boolean
	setAuth: (user: User, accessToken: string) => void
	logout: () => void
	setHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			user: null,
			accessToken: null,
			isHydrated: false,
			setAuth: (user, accessToken) => set({ user, accessToken }),
			logout: () => set({ user: null, accessToken: null }),
			setHydrated: () => set({ isHydrated: true }),
		}),
		{
			name: 'myco-auth',
			partialize: state => ({
				user: state.user,
				accessToken: state.accessToken,
			}),
			onRehydrateStorage: () => state => {
				state?.setHydrated()
			},
		}
	)
)
