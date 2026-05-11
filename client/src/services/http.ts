/**
 * Client HTTP centralisé pour les requêtes API
 * 
 * Ce module fournit une abstraction autour de fetch() avec :
 * - Injection automatique du token JWT
 * - Gestion centralisée des erreurs
 * - Déconnexion automatique en cas d'erreur 401 (non autorisé)
 * - Typage TypeScript des réponses
 */

import { useAuthStore } from '@store/authStore'

/**
 * Interface étendant Error pour inclure le code de statut HTTP
 */
interface ApiError extends Error {
	status?: number
}

/**
 * Fonction interne pour effectuer une requête HTTP avec gestion d'erreurs
 * 
 * Cette fonction :
 * 1. Récupère le token d'accès depuis le store
 * 2. Construit les en-têtes avec le token si disponible
 * 3. Effectue la requête fetch
 * 4. Gère les erreurs HTTP (401, autres erreurs)
 * 5. Parse et retourne le JSON
 * 
 * @template T - Type de la réponse attendue
 * @param method - Méthode HTTP à utiliser
 * @param path - Chemin de l'API (sera préfixé par /api)
 * @param body - Corps de la requête (optionnel, pour POST/PATCH)
 * @returns Promise résolue avec les données de réponse
 * @throws ApiError en cas d'erreur HTTP
 */
async function request<T>(
	method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
	path: string,
	body?: unknown
): Promise<T> {
	// Récupère le token depuis le store Zustand
	const accessToken = useAuthStore.getState().accessToken

	// Construction des en-têtes HTTP
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}
	
	// Ajoute le token JWT dans l'en-tête Authorization si disponible
	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`
	}

	// Effectue la requête fetch
	const res = await fetch(`/api${path}`, {
		method,
		headers,
		credentials: 'include', // Inclut les cookies dans la requête
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})

	// Gestion spéciale pour 401 (non autorisé) : déconnexion automatique
	if (res.status === 401) {
		useAuthStore.getState().logout()
		const err: ApiError = new Error(
			'Session expirée, veuillez vous reconnecter'
		)
		err.status = 401
		throw err
	}

	// Gestion des autres erreurs HTTP
	if (!res.ok) {
		let message = `Erreur ${res.status}`
		
		// Tente d'extraire le message d'erreur du corps de la réponse
		try {
			const data = (await res.json()) as { error?: string }
			if (data.error) message = data.error
		} catch {
			// Ignore les erreurs de parsing JSON (utilise le message par défaut)
		}
		
		const err: ApiError = new Error(message)
		err.status = res.status
		throw err
	}

	// Parse et retourne le JSON de la réponse
	return res.json() as Promise<T>
}

/**
 * API publique du client HTTP
 * 
 * Fournit des méthodes pour chaque verbe HTTP avec typage TypeScript.
 * Chaque méthode accepte un type générique T pour le type de réponse attendu.
 */
export const http = {
	/** Effectue une requête GET */
	get: <T>(path: string) => request<T>('GET', path),
	
	/** Effectue une requête POST avec un corps JSON */
	post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
	
	/** Effectue une requête DELETE */
	delete: <T>(path: string) => request<T>('DELETE', path),
	
	/** Effectue une requête PATCH avec un corps JSON */
	patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
}
