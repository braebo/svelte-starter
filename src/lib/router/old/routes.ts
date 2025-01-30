import type { RouteTree } from './router.object.types'

export const routes = {
	Home: {
		path: '/',
	},
	Design: {
		path: '/design',
		children: {
			Elements: {
				path: '/design/elements',
			},
			Inputs: {
				path: '/design/inputs',
			},
		},
	},
} as const satisfies RouteTree
