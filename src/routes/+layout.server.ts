import { routes } from '$lib/router'

export const prerender = true

export const load = async ({ url, locals }) => {
	const title =
		Object.entries(routes).find(
			([_, link]) => link.path === url.pathname.split('/')[1]!,
		)?.[0] ?? ''

	return {
		title,
		routes,
		theme: locals.theme,
	}
}
