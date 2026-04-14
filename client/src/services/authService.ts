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
		return http.post<LoginResponse>('/auth/login', { email, password })
	},

	async register(email: string, password: string): Promise<LoginResponse> {
		return http.post<LoginResponse>('/auth/register', { email, password })
	},

	async getMe(): Promise<{ user: User }> {
		return http.get<{ user: User }>('/auth/me')
	},

	async logout(): Promise<void> {
		await http.post<void>('/auth/logout', {})
	},
}
