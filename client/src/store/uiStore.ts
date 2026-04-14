import { create } from 'zustand'

export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info'
}

interface UiState {
	toasts: Toast[]
	activeModal: string | null
	sidebarOpen: boolean
	pushToast: (toast: Omit<Toast, 'id'>) => void
	dismissToast: (id: string) => void
	openModal: (name: string) => void
	closeModal: () => void
	setSidebarOpen: (open: boolean) => void
}

let toastCounter = 0

export const useUiStore = create<UiState>()(set => ({
	toasts: [],
	activeModal: null,
	sidebarOpen: false,

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
}))
