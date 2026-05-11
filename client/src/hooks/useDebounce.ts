/**
 * Hook personnalisé pour le debouncing de valeurs
 * 
 * Le debouncing est une technique qui retarde la mise à jour d'une valeur jusqu'à ce qu'un
 * certain délai se soit écoulé sans changement. C'est très utile pour optimiser les
 * performances lors de recherches en temps réel, éviter trop d'appels API, etc.
 * 
 * Exemple d'utilisation :
 * ```tsx
 * function SearchBar() {
 *   const [searchTerm, setSearchTerm] = useState('')
 *   const debouncedSearch = useDebounce(searchTerm, 500)
 *   
 *   // Cette requête ne s'exécute que 500ms après que l'utilisateur arrête de taper
 *   useEffect(() => {
 *     if (debouncedSearch) {
 *       fetchResults(debouncedSearch)
 *     }
 *   }, [debouncedSearch])
 * }
 * ```
 */

import { useEffect, useState } from 'react'

/**
 * Hook de debouncing
 * 
 * @template T - Type de la valeur à debouncer
 * @param value - Valeur à debouncer (peut changer fréquemment)
 * @param delay - Délai en millisecondes avant mise à jour (défaut: 300ms)
 * @returns La valeur debounced (mise à jour uniquement après le délai)
 */
export function useDebounce<T>(value: T, delay = 300): T {
	// Stocke la valeur debounced dans un state local
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		// Crée un timer qui mettra à jour la valeur debounced après le délai
		const timer = setTimeout(() => setDebouncedValue(value), delay)
		
		// Fonction de nettoyage : annule le timer si la valeur change avant l'expiration
		// Cela permet de "restart" le timer à chaque changement
		return () => clearTimeout(timer)
	}, [value, delay])

	return debouncedValue
}
