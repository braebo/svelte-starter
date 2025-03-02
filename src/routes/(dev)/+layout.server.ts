import { error } from '@sveltejs/kit'
import { DEV } from 'esm-env'

export const prerender = false

export const load = async ({ url }) => {
	if (!DEV) {
		error(404, 'Not found')
	}

	return {}
}
