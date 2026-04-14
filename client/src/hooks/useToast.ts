import type { Toast } from '@store/uiStore'
import { useUiStore } from '@store/uiStore'
import { useCallback } from 'react'

export function useToast() {
	const pushToast = useUiStore(s => s.pushToast)

	const toast = useCallback(
		(message: string, type: Toast['type'] = 'info') => {
			pushToast({ message, type })
		},
		[pushToast]
	)

	const success = useCallback(
		(message: string) => toast(message, 'success'),
		[toast]
	)
	const error = useCallback(
		(message: string) => toast(message, 'error'),
		[toast]
	)
	const info = useCallback((message: string) => toast(message, 'info'), [toast])

	return { toast, success, error, info }
}
