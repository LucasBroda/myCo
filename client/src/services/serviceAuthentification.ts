/**
 * Service d'authentification côté client
 * 
 * Fournit des méthodes pour interagir avec l'API d'authentification :
 * - Connexion / Inscription
 * - Récupération du profil
 * - Déconnexion
 * 
 * Utilise le client HTTP centralisé qui gère automatiquement :
 * - L'ajout du token JWT dans les headers
 * - La déconnexion automatique en cas d'erreur 401
 */

import { http } from './http'

/**
 * Interface représentant un utilisateur
 */
interface User {
	/** Identifiant unique (UUID) */
	id: string
	/** Adresse email */
	email: string
}

/**
 * Réponse retournée lors de la connexion/inscription
 */
interface LoginResponse {
	/** Token d'accès JWT (valide 15 minutes) */
	accessToken: string
	/** Informations de l'utilisateur */
	user: User
}

/**
 * Service d'authentification
 * 
 * Objet exportant toutes les méthodes liées à l'authentification.
 */
export const authService = {
	/**
	 * Connecte un utilisateur avec email et mot de passe
	 * 
	 * @param email - Adresse email de l'utilisateur
	 * @param password - Mot de passe en clair (sera hashé côté serveur)
	 * @returns Promise avec le token d'accès et les infos utilisateur
	 * @throws Error si les identifiants sont incorrects (401)
	 */
	async login(email: string, password: string): Promise<LoginResponse> {
		return http.post<LoginResponse>('/authentification/connexion', { email, password })
	},

	/**
	 * Crée un nouveau compte utilisateur
	 * 
	 * @param email - Adresse email (doit être unique)
	 * @param password - Mot de passe (minimum 6 caractères recommandé)
	 * @returns Promise avec le token d'accès et les infos utilisateur
	 * @throws Error si l'email existe déjà (409 Conflict)
	 */
	async register(email: string, password: string): Promise<LoginResponse> {
		return http.post<LoginResponse>('/authentification/inscription', { email, password })
	},

	/**
	 * Récupère le profil de l'utilisateur authentifié
	 * 
	 * Nécessite un token JWT valide dans les headers (géré automatiquement par http).
	 * 
	 * @returns Promise avec les informations de l'utilisateur
	 * @throws Error si le token est invalide ou expiré (401)
	 */
	async getMe(): Promise<{ user: User }> {
		return http.get<{ user: User }>('/authentification/moi')
	},

	/**
	 * Déconnecte l'utilisateur
	 * 
	 * Invalide le refresh token côté serveur et supprime les cookies.
	 * Le store local est nettoyé par le composant appelant.
	 * 
	 * @returns Promise vide
	 */
	async logout(): Promise<void> {
		await http.post<void>('/authentification/deconnexion', {})
	},
}
