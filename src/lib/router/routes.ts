import type { Route } from './router.types'

export type Routes = typeof routes

export const routes: Route[] = [
	{ path: '/', title: 'Home' },
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
] as const
