import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import dts from 'vite-plugin-dts'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),

		// Génère les fichiers .d.ts pour TypeScript
		dts({
			insertTypesEntry: true,
			include: ['src/**/*'],
			exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
		}),

		// Vérifie TypeScript pendant le build
		// ESLint est désactivé ici (incompatibilité vite-plugin-checker 0.12 + ESLint 9)
		// Utilise `npm run lint` pour linter manuellement
		checker({
			typescript: true,
		}),
		// Polyfills Node.js pour le navigateur
		nodePolyfills({
			include: ['path', 'stream', 'util'],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
		}),
	],

	// Alias pour imports absolus
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components'),
			'@layout': path.resolve(__dirname, './src/layouts'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@services': path.resolve(__dirname, './src/services'),
			'@types': path.resolve(__dirname, './src/types'),
			'@store': path.resolve(__dirname, './src/store'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@assets': path.resolve(__dirname, './src/assets'),
		},
	},

	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:5000',
				changeOrigin: true,
			},
		},
	},
})
