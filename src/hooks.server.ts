import type { Handle, HandleServerError } from '@sveltejs/kit'

import { redirect } from '@sveltejs/kit'
import { router } from '$lib/router'

import { parse } from 'cookie'
import { DEV } from 'esm-env'

export const handle: Handle = ({ event, resolve }) => {
	const cookies = parse(event.request.headers?.get('cookie') || '')
	event.locals.theme = <'dark' | 'light' | 'system'>cookies.theme || 'dark'

	const route = router.get(event.url.pathname)
	if (!DEV && (route as any)?.dev) {
		redirect(308, '/404')
	}

	let page = ''
	return resolve(event, {
		transformPageChunk: ({ html, done }) => {
			page += html
			if (done)
				return page.replace('__THEME__', event.locals.theme).replace('__COLOR_SCHEME__', event.locals.theme)
		},
	})
}

export const handleError: HandleServerError = ({ error, event }) => {
	console.error(error)

	if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
		if (event.url.pathname !== '/404') redirect(308, '/404')
	}
}
