export type Route = {
	path: string
	title: string
	children?: Route[]
	/**
	 * Whether the route is only reachable during development.
	 * @default false
	 */
	dev?: boolean
}

export type ExtractPaths<T extends Route[]> = T extends readonly (infer R)[]
	? R extends { path: string; children?: Route[] }
		? R['path'] | (R['children'] extends Route[] ? ExtractPaths<R['children']> : never)
		: never
	: never

export type GetRouteByPath<
	T extends Route[],
	P extends ExtractPaths<T>,
> = T extends readonly (infer R)[]
	? R extends { path: P; title: string }
		? R
		: R extends { children: Route[] }
			? GetRouteByPath<R['children'], P>
			: never
	: never
