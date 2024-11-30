import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import mdsvexConfig from './mdsvex.config.mjs'
import adapter from '@sveltejs/adapter-auto'
import { mdsvex } from 'mdsvex'

import { createShikiLogger, processCodeblockSync, getOrLoadOpts } from '@samplekit/preprocess-shiki'
const opts = await getOrLoadOpts()
const preprocessorRoot = `${import.meta.dirname}/src/routes/`
const formatFilename = (/** @type {string} */ filename) => filename.replace(preprocessorRoot, '')

const ignoreWarnings = ['element_invalid_self_closing_tag']

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', ...mdsvexConfig.extensions],
	preprocess: [
		processCodeblockSync({
			include: (filename) => filename.startsWith(preprocessorRoot),
			logger: createShikiLogger(formatFilename),
			opts,
		}),
		vitePreprocess({ script: true }),
		mdsvex(mdsvexConfig),
	],
	kit: { adapter: adapter() },
	vitePlugin: {
		inspector: {
			toggleButtonPos: 'bottom-left',
			toggleKeyCombo: 'meta-alt-control',
		},
	},
	onwarn: (warning, handler) => {
		if (ignoreWarnings.includes(warning.code)) return
		handler(warning)
	},
	warningFilter: (warning) => {
		return !ignoreWarnings.includes(warning.code)
	},
}

export default config
