import type { Route, ExtractPaths, GetRouteByPath } from './router.types'
import { page, type page as Page } from '$app/state'

import { routes, type Routes } from '../routes'
import { l, r } from '@braebo/ansi'
import { DEV } from 'esm-env'

/**
 * @deprecated Use the {@link router} singleton.
 * @internal This class is only exported for testing purposes.
 */
export class Router<const T extends Route[] = Routes> {
	readonly routes: T
	readonly repo_url = 'https://github.com/braebo/svelte-starter' as const

	constructor(routes: T) {
		this.routes = routes
	}

	/**
	 * Returns `true` if a given path is the same as the current page's.
	 */
	isActive(path: ExtractPaths<T> | (string & {}), page: typeof Page): boolean {
		return page.url.pathname === path
	}

	/**
	 * Returns `true` if a given path is a parent of the current page.
	 *
	 * @example
	 * ```ts
	 * // localhost:5173/foo/bar
	 *
	 * import { page } from '$app/state'
	 *
	 * router.isParent('/foo', page) // true
	 * router.isParent('/foo/baz', page) // false
	 * ```
	 */
	isParent(path: ExtractPaths<T> | (string & {}), page: typeof Page): boolean {
		return page.url.pathname.startsWith(path) && !this.isActive(path, page)
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
	isChild(path: ExtractPaths<T> | (string & {}), page: typeof Page): boolean {
		const current = page.url.pathname
		if (current === '/' && path !== '/') return false
		if (path === current) return false
		return path.startsWith(current)
	}

	/**
	 * Returns `true` if the current page is a sibling of a given path.
	 *
	 * @example
	 * ```ts
	 * // localhost:5173/foo/bar
	 *
	 * import { page } from '$app/state'
	 *
	 * router.siblingActive('/foo/baz', page) // true
	 * router.siblingActive('/baz', page) // false
	 * ```
	 */
	isSibling(path: ExtractPaths<T> | (string & {}), page: typeof Page): boolean {
		const parent = path.split('/').slice(0, -1).join('/')
		return page.url.pathname.startsWith(parent) && page.url.pathname !== parent
	}

	get current(): Route {
		return this.get(page.url.pathname) as Route
	}

	/**
	 * Returns the {@link Route route} for a given path.
	 *
	 * @example
	 * ```ts
	 * router.get('/foo/bar') // { path: '/foo/bar', title: 'Bar', children: [] }
	 * ```
	 */
	get<P extends ExtractPaths<typeof this.routes>>(
		path: P | (string & {}),
	): GetRouteByPath<typeof this.routes, P> | null {
		const findRoute = (routes: Route[], targetPath: string): Array<Route>[number] | undefined => {
			const direct = routes.find(route => route.path === targetPath)
			if (direct) return direct

			for (const route of routes) {
				if ('children' in route && route.children) {
					const found = route.children.find(child => child.path === targetPath)
					if (found) return found
				}
			}
		}

		const found = findRoute(this.routes, path)
		if (DEV && !found) {
			// console.error(`Route not found: ${path}`)
			l(r(`Route not found:`), path)
		}

		return (found as GetRouteByPath<typeof this.routes, P>) ?? null
	}

	/**
	 * A type-safe way to link to a route that just returns the given path.
	 */
	link<const P extends ExtractPaths<typeof this.routes>>(path: P): P {
		return this.get(path)?.path ?? path
	}

	/**
	 * Helper for linking to source files on GitHub.
	 */
	gh<T extends string>(path: T extends `/${string}` ? never : T): `${typeof this.repo_url}/tree/main/${T}` {
		return `${this.repo_url}/tree/main/${path}`
	}
}

/**
 * A type-safe route manager with some helper methods.
 */
export const router = new Router(routes)
