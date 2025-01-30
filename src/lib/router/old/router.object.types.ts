export interface Route {
	path: string
	children?: Record<string, Route>
}

export type RouteTree = Record<string, Route>

/**
 * Gets all possible paths from a route tree.
 */
export type GetPaths<T extends RouteTree> = {
	[K in keyof T]: T[K] extends { path: string }
		? T[K]['path']
		| (T[K] extends { children: infer C }
				? C extends RouteTree
					? GetPaths<C>
					: never
				: never)
		: never
}[keyof T]

/**
 * Gets a route by its path, including the key as the title.
 */
export type GetRouteByPath<
	T extends RouteTree,
	P extends GetPaths<T>
> = {
	[K in keyof T]: T[K] extends { path: P }
		? { path: T[K]['path'], title: K & string }
		: T[K] extends { children: infer C }
			? C extends RouteTree
				? GetRouteByPath<C, P>
				: never
			: never
}[keyof T]
