export interface Route {
	path: string
	title: string
	/**
	 * Hash-based sections
	 */
	sections?: Route[]
}

export const routes: Route[] = [
	{
		path: '/ui',
		title: 'UI',
		sections: [
			{ path: '/ui/elements', title: 'ELEMENTS' },
			{ path: '/ui/inputs', title: 'INPUTS' },
		],
	},
]
