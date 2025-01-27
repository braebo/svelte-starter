export interface Route {
	path: string
	title: string
	sections?: Route[]
}

export const routes: Route[] = [
	{ path: 'ui', title: 'UI' },
	{ path: 'ui/elements', title: 'ELEMENTS' },
	{ path: 'ui/inputs', title: 'INPUTS' },
]
