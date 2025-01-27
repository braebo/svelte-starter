import { routes } from '$lib/routes'

export const prerender = true

export const load = async ({ url, locals }) => {
	const title = routes.find((link) => link.path === url.pathname.split('/')[1]!)?.title ?? ''

	return {
		title,
		routes,
		theme: locals.theme,
	}
}
