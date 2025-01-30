import type { Route, RouteTree, GetPaths, GetRouteByPath } from './router.object.types'
import type { page } from '$app/state'

import { routes } from './routes'

export const REPO_URL = 'https://github.com/braebo/svelte-starter'

class Router {
	REPO_URL = 'https://github.com/braebo/svelte-starter' as const
	REPO = (this.REPO_URL + '/tree/main') as `${typeof REPO_URL}/tree/main`

	// #activePath = $derived(page.url.pathname)

	routes = routes

	isActive(path: string, page_state: typeof page) {
		return page_state.url.pathname === path
	}

	childActive(path: string, page_state: typeof page) {
		return page_state.url.pathname.startsWith(path) && page_state.url.pathname !== path
	}

	parentActive(path: string, page_state: typeof page) {
		const segments = path.split('/').filter(Boolean)
		const currentSegments = page_state.url.pathname.split('/').filter(Boolean)
		return currentSegments.slice(0, segments.length).join('/') === segments.join('/')
	}

	children(path: string): Record<string, Route> {
		const findRoute = (routes: RouteTree, targetPath: string): Route | undefined => {
			for (const route of Object.values(routes)) {
				if (route.path === targetPath) {
					return route
				}
				if (route.children) {
					const found = findRoute(route.children, targetPath)
					if (found) return found
				}
			}
		}

		const route = findRoute(this.routes, path)
		return route?.children ?? {}
	}

	get<P extends GetPaths<typeof this.routes>>(path: P): GetRouteByPath<typeof this.routes, P> {
		const findRouteAndKey = (
			routes: RouteTree,
			targetPath: string,
		): [string, Route] | undefined => {
			for (const [key, route] of Object.entries(routes)) {
				if (route.path === targetPath) {
					return [key, route]
				}
				if (route.children) {
					const found = findRouteAndKey(route.children, targetPath)
					if (found) return found
				}
			}
		}

		const found = findRouteAndKey(this.routes, path)
		if (!found) throw new Error(`Route not found: ${path}`)
		const [key, route] = found
		return { path: route.path, title: key } as GetRouteByPath<typeof this.routes, P>
	}

	gh<T extends string>(path: T extends `/${string}` ? never : T) {
		return `${this.REPO}/${path}` as const
	}
}

export const router = new Router()

type RouterPaths = GetPaths<typeof router.routes>

const fake_page = { url: { pathname: '/design' } } as typeof page

// Testing - these should all work with proper type inference
const _test1: RouterPaths = '/design/elements' //=>
const _test2 = router.get('/design/elements') //=>
const _test3 = router.isActive('/design', fake_page) //=>
const _test4 = router.childActive('/design', fake_page) //=>
const _test5 = router.parentActive('/design', fake_page) //=>
const _test6 = router.children('/design') //=>
const _test7 = router.get('/') //=>
const _test8 = router.gh('src/styles/inputs.scss') //=>
const _test9 = router.get('/design/inputs').title //=>
