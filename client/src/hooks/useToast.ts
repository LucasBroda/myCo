/**
 * Hook personnalisé pour afficher des notifications toast
 * 
 * Les toasts sont des messages temporaires qui apparaissent à l'écran pour informer
 * l'utilisateur d'une action réussie, d'une erreur, ou d'une information.
 * 
 * Ce hook fournit des méthodes pratiques pour afficher différents types de toasts.
 */

import type { Toast } from '@store/uiStore'
import { useUiStore } from '@store/uiStore'
import { useCallback } from 'react'

/**
 * Hook de gestion des notifications toast
 * 
 * @returns Objet avec des méthodes pour afficher des toasts
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error, info } = useToast()
 *   
 *   const handleSave = async () => {
 *     try {
 *       await saveData()
 *       success('Données sauvegardées avec succès')
 *     } catch (err) {
 *       error('Erreur lors de la sauvegarde')
 *     }
 *   }
 * }
 * ```
 */
export function useToast() {
	// Récupère la fonction pushToast depuis le store UI
	const pushToast = useUiStore(s => s.pushToast)

	/**
	 * Affiche un toast avec un type spécifique
	 * 
	 * @param message - Message à afficher
	 * @param type - Type de toast ('info' | 'success' | 'error')
	 */
	const toast = useCallback(
		(message: string, type: Toast['type'] = 'info') => {
			pushToast({ message, type })
		},
		[pushToast]
	)

	/**
	 * Affiche un toast de succès (fond vert)
	 * 
	 * @param message - Message de succès
	 */
	const success = useCallback(
		(message: string) => toast(message, 'success'),
		[toast]
	)
	
	/**
	 * Affiche un toast d'erreur (fond rouge)
	 * 
	 * @param message - Message d'erreur
	 */
	const error = useCallback(
		(message: string) => toast(message, 'error'),
		[toast]
	)
	
	/**
	 * Affiche un toast d'information (fond bleu)
	 * 
	 * @param message - Message informatif
	 */
	const info = useCallback((message: string) => toast(message, 'info'), [toast])

	return { toast, success, error, info }
}
