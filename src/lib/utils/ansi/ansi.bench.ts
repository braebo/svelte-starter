import { ansiStyle } from './ansi-hex.js'
import { bench } from 'vitest'

const opts: Parameters<typeof bench>[2] = {
	iterations: 10000,
	warmupIterations: 1000,
}

bench(
	'ansiStyle',
	() => {
		const style = ansiStyle('bold')
		style('Hello, world!')
	},
	opts,
)
