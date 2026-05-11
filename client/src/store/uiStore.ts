/**
 * Store Zustand pour la gestion de l'interface utilisateur
 * 
 * Gère les éléments d'UI globaux :
 * - Notifications toast (messages temporaires)
 * - Modales (fenêtres contextuelles)
 * - État de la sidebar (barre latérale)
 * - Thème visuel (clair/sombre)
 * 
 * Seul le thème est persisté dans localStorage pour conserver la préférence utilisateur.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Interface représentant une notification toast
 */
export interface Toast {
	/** Identifiant unique du toast */
	id: string
	/** Message à afficher */
	message: string
	/** Type de notification (détermine la couleur) */
	type: 'success' | 'error' | 'info'
}

/**
 * Mode de thème visuel
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Interface de l'état du store UI
 */
interface UiState {
	/** Liste des toasts actuellement affichés */
	toasts: Toast[]
	/** Nom de la modale actuellement ouverte (null si aucune) */
	activeModal: string | null
	/** État d'ouverture de la sidebar */
	sidebarOpen: boolean
	/** Mode de thème actuel (persisté) */
	themeMode: ThemeMode
	
	/**
	 * Ajoute un nouveau toast à la liste
	 * Le toast disparaît automatiquement après 4 secondes
	 * 
	 * @param toast - Données du toast (sans l'ID, généré automatiquement)
	 */
	pushToast: (toast: Omit<Toast, 'id'>) => void
	
	/**
	 * Retire un toast de la liste
	 * 
	 * @param id - Identifiant du toast à supprimer
	 */
	dismissToast: (id: string) => void
	
	/**
	 * Ouvre une modale
	 * 
	 * @param name - Nom/identifiant de la modale
	 */
	openModal: (name: string) => void
	
	/** Ferme la modale actuellement ouverte */
	closeModal: () => void
	
	/**
	 * Définit l'état d'ouverture de la sidebar
	 * 
	 * @param open - true pour ouvrir, false pour fermer
	 */
	setSidebarOpen: (open: boolean) => void
	
	/**
	 * Définit le mode de thème
	 * 
	 * @param mode - 'light' ou 'dark'
	 */
	setThemeMode: (mode: ThemeMode) => void
	
	/** Bascule entre thème clair et sombre */
	toggleTheme: () => void
}

/**
 * Compteur global pour générer des IDs uniques de toast
 * Incrémenté à chaque nouveau toast
 */
let toastCounter = 0

/**
 * Store UI global
 */
export const useUiStore = create<UiState>()(
	persist(
		set => ({
			toasts: [],
			activeModal: null,
			sidebarOpen: false,
			themeMode: 'dark', // Dark mode par défaut

			/**
			 * Ajoute un toast avec auto-dismiss après 4 secondes
			 * Génère automatiquement un ID unique
			 */
			pushToast: toast => {
				const id = `toast-${++toastCounter}`
				// Ajoute le toast à la liste
				set(state => ({ toasts: [...state.toasts, { ...toast, id }] }))
				
				// Programme la suppression automatique après 4 secondes
				setTimeout(() => {
					set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }))
				}, 4000)
			},

			/**
			 * Supprime immédiatement un toast par son ID
			 * Utile pour fermer manuellement un toast avant l'auto-dismiss
			 */
			dismissToast: id =>
				set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

			openModal: name => set({ activeModal: name }),
			closeModal: () => set({ activeModal: null }),
			setSidebarOpen: open => set({ sidebarOpen: open }),
			setThemeMode: mode => set({ themeMode: mode }),
			
			/**
			 * Inverse le thème actuel
			 * light → dark, dark → light
			 */
			toggleTheme: () =>
				set(state => ({ themeMode: state.themeMode === 'light' ? 'dark' : 'light' })),
		}),
		{
			// Configuration de persistence
			name: 'ui-storage',
			// Seul le thème est sauvegardé (pas les toasts ni l'état de la modale/sidebar)
			partialize: state => ({ themeMode: state.themeMode }),
		}
	)
)
