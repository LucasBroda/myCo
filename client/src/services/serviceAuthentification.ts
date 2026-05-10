import { http } from './http'

interface User {
	id: string
	email: string
}

interface LoginResponse {
	accessToken: string
	user: User
}

export const authService = {
	async login(email: string, password: string): Promise<LoginResponse> {
		return http.post<LoginResponse>('/authentification/connexion', { email, password })
	},

	async register(email: string, password: string): Promise<LoginResponse> {
		return http.post<LoginResponse>('/authentification/inscription', { email, password })
	},

	async getMe(): Promise<{ user: User }> {
		return http.get<{ user: User }>('/authentification/moi')
	},

	async logout(): Promise<void> {
		await http.post<void>('/authentification/deconnexion', {})
	},
}
