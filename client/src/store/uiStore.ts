import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
}

export type ThemeMode = 'light' | 'dark'

interface UiState {
	toasts: Toast[]
	activeModal: string | null
	sidebarOpen: boolean
	themeMode: ThemeMode
	pushToast: (toast: Omit<Toast, 'id'>) => void
	dismissToast: (id: string) => void
	openModal: (name: string) => void
	closeModal: () => void
	setSidebarOpen: (open: boolean) => void
	setThemeMode: (mode: ThemeMode) => void
	toggleTheme: () => void
}

let toastCounter = 0

export const useUiStore = create<UiState>()(
	persist(
		set => ({
			toasts: [],
			activeModal: null,
			sidebarOpen: false,
			themeMode: 'dark', // Dark mode par défaut

			pushToast: toast => {
				const id = `toast-${++toastCounter}`
				set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
				setTimeout(() => {
					set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
				}, 4000)
			},

			dismissToast: id =>
				set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

			openModal: name => set({ activeModal: name }),
			closeModal: () => set({ activeModal: null }),
			setSidebarOpen: open => set({ sidebarOpen: open }),
			setThemeMode: mode => set({ themeMode: mode }),
			toggleTheme: () =>
				set(state => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
		}),
		{
			name: 'ui-storage',
			partialize: state => ({ themeMode: state.themeMode }),
		}
	)
)
