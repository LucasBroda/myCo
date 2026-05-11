/**
 * Store Zustand pour la gestion de l'authentification
 * 
 * Ce store gère l'état global de l'authentification de l'application :
 * - Informations utilisateur
 * - Token d'accès JWT
 * - Persistance dans le localStorage
 * 
 * Utilise Zustand avec le middleware persist pour sauvegarder l'état
 * entre les sessions du navigateur.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Interface représentant un utilisateur authentifié
 */
interface User {
	id: string   // Identifiant unique de l'utilisateur
	email: string // Adresse email de l'utilisateur
}

/**
 * Interface de l'état du store d'authentification
 */
interface AuthState {
	user: User | null           // Utilisateur connecté (null si déconnecté)
	accessToken: string | null  // Token JWT d'accès (null si déconnecté)
	isHydrated: boolean         // Indique si le store a été réhydraté depuis localStorage
	
	/**
	 * Définit l'authentification (utilisateur + token)
	 */
	setAuth: (user: User, accessToken: string) => void
	
	/**
	 * Déconnecte l'utilisateur (efface user et token)
	 */
	logout: () => void
	
	/**
	 * Marque le store comme réhydraté (appelé automatiquement au chargement)
	 */
	setHydrated: () => void
}

/**
 * Store d'authentification avec persistance
 * 
 * Configuration de la persistance :
 * - name: 'myco-auth' - Clé de stockage dans localStorage
 * - partialize: Seuls user et accessToken sont persistés (pas isHydrated)
 * - onRehydrateStorage: Callback appelé après la réhydratation pour marquer le store comme prêt
 * 
 * Le flag isHydrated permet d'éviter les problèmes de rendu initial où le state
 * n'est pas encore chargé depuis localStorage.
 */
export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			user: null,
			accessToken: null,
			isHydrated: false,
			
			// Définit l'authentification avec les données utilisateur et le token
			setAuth: (user, accessToken) => set({ user, accessToken }),
			
			// Réinitialise l'authentification (déconnexion)
			logout: () => set({ user: null, accessToken: null }),
			
			// Marque le store comme chargé/réhydraté
			setHydrated: () => set({ isHydrated: true }),
		}),
		{
			name: 'myco-auth',
			// Spécifie quelles parties de l'état doivent être persistées
			partialize: state => ({
				user: state.user,
				accessToken: state.accessToken,
			}),
			// Hook appelé après la réhydratation depuis localStorage
			onRehydrateStorage: () => state => {
				state?.setHydrated()
			},
		}
	)
)
