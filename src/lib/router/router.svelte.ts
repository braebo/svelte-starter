import type { Route, ExtractPaths, GetRouteByPath } from './router.types'
import type { page } from '$app/state'

import { routes } from './routes'

/**
 * @internal
 */
export class Router<const T extends Route[]> {
	readonly routes: T
	readonly repo_url = 'https://github.com/braebo/svelte-starter' as const
	readonly repo = `${this.repo_url}/tree/main` as const

	constructor(routes: T) {
		this.routes = routes
	}

	/**
	 * Returns `true` if a given path is the same as the current page's.
	 */
	public isActive(path: ExtractPaths<T>, page_state: typeof page) {
		return page_state.url.pathname === path
	}

	/**
	 * Returns `true` if the current page is a child of a given path.
	 *
	 * @example
	 * ```ts
	 * // localhost:5173/foo/bar
	 *
	 * import { page } from '$app/state'
	 *
	 * router.childActive('/foo', page) // true
	 * router.childActive('/foo/baz', page) // false
	 * ```
	 */
	public childActive(path: ExtractPaths<T>, page_state: typeof page) {
		return page_state.url.pathname.startsWith(path) && page_state.url.pathname !== path
	}

	/**
	 * Returns `true` if the current page is a parent of a given path.
	 *
	 * @example
	 * ```ts
	 * // localhost:5173/foo
	 *
	 * import { page } from '$app/state'
	 *
	 * router.parentActive('/foo/bar', page) // true
	 * router.parentActive('/baz', page) // false
	 * ```
	 */
	public parentActive(path: ExtractPaths<T>, page_state: typeof page) {
		const current = page_state.url.pathname
		return path.startsWith(current) && path !== current
	}

	/**
	 * Returns the {@link Route route} for a given path.
	 *
	 * @example
	 * ```ts
	 * router.get('/foo/bar') // { path: '/foo/bar', title: 'Bar', children: [] }
	 * ```
	 */
	public get<P extends ExtractPaths<typeof this.routes>>(
		path: P,
	): GetRouteByPath<typeof this.routes, P> {
		const findRoute = (
			routes: Route[],
			targetPath: string,
		): Array<Route>[number] | undefined => {
			const direct = routes.find((route) => route.path === targetPath)
			if (direct) return direct

			for (const route of routes) {
				if ('children' in route && route.children) {
					const found = route.children.find((child) => child.path === targetPath)
					if (found) return found
				}
			}
		}

		const found = findRoute(this.routes, path)
		if (!found) throw new Error(`Route not found: ${path}`)
		return found as GetRouteByPath<typeof this.routes, P>
	}

	/**
	 * Helper for linking to source files on GitHub.
	 */
	public gh<T extends string>(path: T extends `/${string}` ? never : T) {
		return `${this.repo}/${path}` as const
	}
}

export const router = new Router(routes)
