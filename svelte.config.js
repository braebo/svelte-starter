import { createShikiLogger, processCodeblockSync, getOrLoadOpts } from '@samplekit/preprocess-shiki'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import mdsvexConfig from './mdsvex.config.mjs'
import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'

const opts = await getOrLoadOpts()
const preprocessorRoot = `${import.meta.dirname}/src/routes/`
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '')

const svelte_ignores = [
	'element_invalid_self_closing_tag',
	'no_static_element_interactions',
	'a11y_click_events_have_key_events',
]

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [
		processCodeblockSync({
			include: filename => filename.startsWith(preprocessorRoot),
			logger: createShikiLogger(formatFilename),
			opts,
		}),
		vitePreprocess({ script: true }),
		mdsvex(mdsvexConfig),
	],
	kit: {
		adapter: adapter(),
		// prerender: {
		// 	handleHttpError: ({ path, message }) => {
		// 		if (path === '/404') return

		// 		throw new Error(message)
		// 	},
		// },
	},
	vitePlugin: {
		inspector: {
			toggleButtonPos: 'bottom-left',
			toggleKeyCombo: 'meta-alt-control',
		},
	},
	onwarn: (warning, handler) => {
		if (svelte_ignores.includes(warning.code)) return
		handler(warning)
	},
	warningFilter: warning => {
		return !svelte_ignores.includes(warning.code)
	},
}

export default config
