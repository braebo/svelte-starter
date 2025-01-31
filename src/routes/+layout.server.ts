import { router } from '$lib/router/router.svelte.js'
import { routes } from '$lib/routes'

export const prerender = true

export const load = async ({ url, locals }) => {
	const path = url.pathname
	const title = path === '/' ? 'Home' : router.get(path).title

	return {
		title,
		routes,
		theme: locals.theme,
	}
}
