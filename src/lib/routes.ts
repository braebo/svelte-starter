import type { Route } from './router/router.types'

export type Routes = typeof routes

export const routes = [
	{
		path: '/design',
		title: 'Design',
		children: [
			{
				path: '/design/elements',
				title: 'Elements',
			},
			{
				path: '/design/inputs',
				title: 'Inputs',
			},
		],
	},
	{
		// TODO implement guard in +hooks
		dev: true,
		path: '/playground',
		title: 'Playground',
		children: [
			{
				path: '/playground/misc',
				title: 'Miscellaneous',
			},
		],
	},
] as const satisfies Route[]
