import { useAuthStore } from '@store/authStore'

interface ApiError extends Error {
	status?: number
}

async function request<T>(
	method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
	path: string,
	body?: unknown
): Promise<T> {
	const accessToken = useAuthStore.getState().accessToken

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	}
	if (accessToken) {
		headers['Authorization'] = `Bearer ${accessToken}`
	}

	const res = await fetch(`/api${path}`, {
		method,
		headers,
		credentials: 'include',
		body: body !== undefined ? JSON.stringify(body) : undefined,
	})

	if (res.status === 401) {
		useAuthStore.getState().logout()
		const err: ApiError = new Error(
			'Session expirée, veuillez vous reconnecter'
		)
		err.status = 401
		throw err
	}

	if (!res.ok) {
		let message = `Erreur ${res.status}`
		try {
			const data = (await res.json()) as { error?: string }
			if (data.error) message = data.error
		} catch {
			// ignore
		}
		const err: ApiError = new Error(message)
		err.status = res.status
		throw err
	}

	return res.json() as Promise<T>
}

export const http = {
	get: <T>(path: string) => request<T>('GET', path),
	post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
	delete: <T>(path: string) => request<T>('DELETE', path),
	patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
}
