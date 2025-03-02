import { error, type Handle } from '@sveltejs/kit'
import { router } from '$lib/router'

import { parse } from 'cookie'
import { DEV } from 'esm-env'

export const handle: Handle = ({ event, resolve }) => {
	const cookies = parse(event.request.headers?.get('cookie') || '')
	event.locals.theme = <'dark' | 'light' | 'system'>cookies.theme || 'dark'

	try {
		const route = router.get(event.url.pathname)
		if (route && (route as any)?.dev && !DEV) {
			error(404, 'Not found')
		}
	} catch (e) {
		console.error(e)
		error(404, 'Not found')
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
