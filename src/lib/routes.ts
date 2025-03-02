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
				children: [],
			},
			{
				path: '/design/inputs',
				title: 'Inputs',
				children: [],
			},
		],
	},
	{
		path: '/about',
		title: 'About',
		children: [],
	},
	{
		dev: true,
		path: '/playground',
		title: 'Playground',
		children: [
			{
				path: '/playground/misc',
				title: 'Miscellaneous',
				children: [
					{
						path: '/playground/misc/nested',
						title: 'Nested',
						children: [],
					},
				],
			},
		],
	},
] as const satisfies Route[]

const ROUTE_MAP = new Map<string, Route>()

function addRoutes(routes: Route[] | undefined) {
	for (const route of routes ?? []) {
		ROUTE_MAP.set(route.path, route)
		addRoutes(route.children)
	}
}

addRoutes(routes)

export function get_route(path: InferPaths<typeof routes> | ({} & string)) {
	return ROUTE_MAP.get(path)
}

type InferPaths<T> = T extends Route[]
	? T[number]['path'] | (T[number]['children'] extends infer C ? InferPaths<C> : never)
	: T extends Route
		? T['path'] | (T['children'] extends infer C ? InferPaths<C> : never)
		: never
