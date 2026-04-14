import 'styled-components'

export const theme = {
	colors: {
		bg: '#fafaf9',
		surface: '#f5f5f4',
		surfaceElevated: '#ffffff',
		border: '#e7e5e4',
		borderStrong: '#d6d3d1',
		textPrimary: '#1c1917',
		textSecondary: '#78716c',
		textMuted: '#a8a29e',
		textInverse: '#fafaf9',
		// Accents chauds — aucun bleu/violet
		amber: '#d97706',
		amberHover: '#b45309',
		amberLight: '#fef3c7',
		amberBorder: '#fcd34d',
		brick: '#b91c1c',
		brickHover: '#991b1b',
		brickLight: '#fee2e2',
		brickBorder: '#fca5a5',
		forest: '#15803d',
		forestHover: '#166534',
		forestLight: '#dcfce7',
		forestBorder: '#86efac',
		// États
		focus: '#d97706',
		disabled: '#d6d3d1',
		disabledText: '#a8a29e',
		overlay: 'rgba(28, 25, 23, 0.5)',
	},
	spacing: {
		'1': '4px',
		'2': '8px',
		'3': '12px',
		'4': '16px',
		'5': '20px',
		'6': '24px',
		'8': '32px',
		'10': '40px',
		'12': '48px',
		'16': '64px',
	},
	radii: {
		sm: '4px',
		md: '8px',
		lg: '12px',
		xl: '16px',
		full: '9999px',
	},
	shadows: {
		sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
		md: '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)',
		lg: '0 12px 32px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)',
	},
	font: {
		family: "'Inter', system-ui, -apple-system, sans-serif",
		size: {
			xs: '12px',
			sm: '14px',
			base: '16px',
			lg: '18px',
			xl: '20px',
			'2xl': '24px',
			'3xl': '30px',
			'4xl': '36px',
		},
		weight: {
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
		lineHeight: 1.5,
	},
	breakpoints: {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
	},
	transitions: {
		fast: '150ms ease',
		base: '200ms ease',
		slow: '300ms ease',
	},
} as const

export type Theme = typeof theme

declare module 'styled-components' {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface DefaultTheme extends Theme {}
}
