/// <reference types="bun-types" />

import { l, n } from '../src/lib/utils/logger/logettes'
import { Cli } from './lib/cli'

const cli = new Cli({
	banner: 'Parse',
	description: 'Visualize how your flags are parsed',
	cmd: 'parse',
	examples: ['parse -q --foo bar --baz=qux'],
	args: {
		foo: {
			default: 'bar',
			short: '-f',
			description: 'The foo flag',
		},
		bar: {
			default: 'baz',
			short: '-b',
			description: 'The bar flag',
		},
		baz: {
			default: 'qux',
			short: '-z',
			description: 'The baz flag',
		},
	},
})

try {
	cli.run(async values => {
		n()
		l({ values })
	})
} catch (e) {
	console.log(e)
}
