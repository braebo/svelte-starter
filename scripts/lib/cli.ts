import { l, d, em, bd, r, c, m, o, hex } from '../../src/lib/utils/logger/logger-colors'
import { parseArgs, type ParseArgsConfig } from 'util'

export interface PositionalArg {
	name: string
	description: string
	required?: boolean
	example?: string
}

export interface ArgDef<T extends string | boolean | number = string | boolean | number> {
	type: T extends boolean ? 'boolean' : T extends number ? 'number' : 'string'
	default?: T
	short?: string
	description: string
	required?: boolean
}

export type Args = Record<string, ArgDef<any>>

export interface CliConfig<T extends Args> {
	/**
	 * The name of the command/script used to run the CLI, e.g. `foobar`.
	 */
	cmd: string
	/**
	 * The description of the CLI.
	 */
	description: string
	/**
	 * Optional banner text printed at the top of the help screen.
	 */
	banner?: string
	/**
	 * An array of example commands.
	 * @example
	 * [
	 * 	'foobar --hello world -b true',
	 * 	'pnpm foobar -h 42',
	 * ]
	 */
	examples?: Array<
		| string
		| {
				name?: string
				cmd: string
		  }
	>
	/**
	 * TODO: How bad am I butchering this terminology?
	 * The arguments for the CLI flags.
	 */
	args: T
	/**
	 * TODO: Fix or remove (currently only supports the position directly after the cmd, before any options).
	 */
	positionals?: PositionalArg[]
	/**
	 * TODO: Kinda pointless, no?
	 */
	autorun?: (values: InferArgs<T>, positionals: string[]) => void | Promise<void>
	/**
	 * The CLI theme color.
	 * @default
	 * '#ff7f50'
	 */
	color?: string
}

type InferArgType<T extends ArgDef> = T extends ArgDef<infer U> ? U : never

type InferArgs<T extends Args> = {
	[K in keyof T]: InferArgType<T[K]>
}

export class Cli<T extends Args> {
	config: CliConfig<T>
	values = {} as InferArgs<T> & { help?: boolean }
	positionals = [] as string[]
	args = [] as string[]

	#DEBUG_ENABLED = false
	#debug = (...args: any[]) => {
		if (this.#DEBUG_ENABLED) console.log(d(m(...args)))
	}

	#color = '#ff7f50' as NonNullable<CliConfig<T>['color']>
	/**
	 * Wraps a string in the theme color.
	 */
	#c = hex(this.#color)
	/**
	 * Hex color for the CLI theme.
	 * @default
	 * '#ff7f50'
	 */
	get color(): string {
		return this.#color
	}
	set color(c: string) {
		this.#color = c
		this.#c = hex(c)
	}

	/**
	 * The width of the first column.
	 */
	#col1: number
	/**
	 * The width of the second column.
	 */
	#col2: number

	constructor(config: CliConfig<T>) {
		this.config = {
			...config,
			args: {
				...config.args,
				help: {
					type: 'boolean',
					// short: 'h',
					description: 'Help screen',
				},
			},
		}

		if (config.autorun) {
			this.run()
		}
	}

	run(callback?: (values: InferArgs<T>, positionals: string[]) => void | Promise<void>) {
		try {
			this.args = process.argv.slice(2)

			const { values, positionals } = this.#parseArgs()

			this.values = (values ?? {}) as InferArgs<T> & { help?: boolean }
			this.positionals = positionals

			if (this.values.help || this.args.length + this.positionals.length === 0) {
				this.help()
				return
			}

			if (!this.#checkPositionals()) {
				return
			}

			if (!this.#requiredCheck()) {
				return
			}

			callback?.(this.values, this.positionals)
		} catch (error) {
			if (error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
				const optionRegex = /'(-{1,2}[a-zA-Z][a-zA-Z0-9-]*)'/
				const option = error.message.match(optionRegex)?.[1]

				this.error(`${d('Unknown option:')} ${option}`)

				return
			}
			throw error
		}
	}

	/**
	 * Calls `util.parseArgs` while preserving numbers.
	 * @returns The parsed arguments.
	 */
	#parseArgs() {
		// Hide numbers from parseArgs or it'll blow up.
		const options: ParseArgsConfig['options'] = Object.entries(this.config.args).reduce((acc, [key, def]) => {
			return {
				...acc,
				[key]: {
					type: def.type === 'number' ? 'string' : def.type,
					default: typeof def.default === 'number' ? def.default.toString() : def.default,
					...(def.short && { short: def.short }),
				},
			}
		}, {})

		const args = parseArgs({
			args: this.args,
			options,
			strict: true,
			allowPositionals: true,
		})

		this.#generateOptions()

		// Restore numbers.
		if (Object.keys(args.values).length) {
			for (const [key, value] of Object.entries(args.values)) {
				if (this.config.args[key].type === 'number' || typeof this.config.args[key].default === 'number') {
					try {
						let number = Number(value)
						if (!isNaN(number)) {
							// @ts-expect-error
							args.values[key] = number
						}
					} catch (error) {
						this.error(`Invalid number: ${value}`)
					}
				}
			}
		}

		return args
	}

	/**
	 * Returns false if any required arguments are missing.
	 */
	#requiredCheck() {
		this.#debug('requiredCheck()')

		let ok = true

		for (const [key, def] of Object.entries(this.config.args)) {
			if (def.required && typeof this.values[key] === 'undefined') {
				ok = false
				// Skip the error if no args are provided.
				if (!this.args.length) continue

				this.error(`Missing argument: ${this.#c('--' + key)}`, false)

				l(d('Required:'))
				for (const required of this.#options_strings_required) {
					if (required.includes(this.#c('--' + key))) {
						l(required, '👀')
					} else {
						l(required)
					}
				}
				l()
			}
		}

		return ok
	}

	/**
	 * Returns false if any required positional arguments are missing.
	 */
	#checkPositionals(): boolean {
		this.#debug('checkPositionals()')

		if (!this.config.positionals?.length) return true

		const required = this.config.positionals.filter(p => p.required)

		let missing: string[] = []
		for (const pos of required) {
			if (!this.positionals.includes(pos.name)) {
				missing.push(pos.name)
			}
		}

		if (!missing.length) return true

		missing.forEach(m => this.error(`Missing argument: ${this.#c(`${m}`)}`, false))

		this.#printUsage()
		this.#printPositionals()
		this.#printOptions()

		return false
	}

	help() {
		this.#debug('help()')
		this.#intro()
		this.#printUsage()
		this.#printPositionals()
		this.#printOptions()
		this.#printExamples()

		// console.log(d('⌞'))
		// console.log(d('⟔'))
		// console.log(d('⠼'))
		// console.log(d('⎼'))
		// console.log(d('⌜'))
		console.log(d('↵'))
	}

	/**
	 * Prints an error message.
	 * @param message - The error message to print.
	 * @param printOptions - Whether to print the options.
	 */
	error(message: string, printOptions = true) {
		l()
		l(r(bd('ERROR')))
		l(`  ${message}`)
		// l()
		if (printOptions) {
			this.#printOptions()
		}
	}

	#intro() {
		this.#debug('intro()')

		console.log(d('↴'))

		if (this.config.banner) {
			l()
			this.config.banner.split('\n').forEach(line => l(this.#c(bd(line))))
			l()
			if (this.config.description) {
				l(em(d(` ${this.config.description}`)))
			}
		}
		// 	l(bd(this.config.name))
		// 	l()
		// }
	}

	#printUsage() {
		this.#debug('printUsage()')
		l()
		l()
		l(bd('Usage'))
		l()

		let str = bd(`  ${this.config.cmd}`)

		for (const pos of this.config.positionals ?? []) {
			str += ' ' + this.#c(pos.name)
		}

		if (Object.keys(this.config.args).length) {
			str += d(this.#c(` [options]`))
			// str += ' ' + d(this.#c('[')) + this.#c('options') + d(this.#c(']'))
		}

		l(str)
	}

	#printPositionals() {
		this.#debug('printPositionals()')
		if (!this.#positionals) return

		// l()
		// l(this.#positionals_header)
		l()
		for (const str of Object.values(this.#positionals)) {
			// l(d(em('  required:')) + str)
			l(str)
		}

		// if (this.#positionals_example) {
		// 	l()
		// 	l(this.#positionals_example)
		// }
	}

	/**
	 * Prints the options
	 */
	#printOptions() {
		this.#debug('printOptional()')
		const opts = this.#options

		l()
		l()
		l(bd('Options'))
		// l()

		// l()
		l(this.#options_header)
		l()
		for (const str of Object.values(opts)) {
			l(str)
		}
		// l()
	}

	#printExamples() {
		if (this.config.examples?.length) {
			l()
			l()
			l(bd('Example' + (this.config.examples.length > 1 ? 's' : '')))
			for (const example of this.config.examples) {
				let eg = ''
				let title = ''
				if (typeof example === 'object') {
					eg = example.cmd
					title = example.name ?? ''
				} else {
					eg = example
				}

				const args = eg.split(' ')

				let cmd = [] as string[]
				if (this.config.cmd) {
					cmd.push(this.config.cmd)
				}
				for (const arg of args) {
					if (arg.startsWith('-')) {
						break
					} else {
						if (arg.includes(this.config.cmd)) continue
						if (!cmd.length) {
							cmd.push(arg)
						} else {
							cmd.push(d(arg))
						}
					}
				}

				const coloredArgs = args.map((arg, i) => {
					if (i < cmd.length) {
						return ''
					}
					if (arg.startsWith('--') || arg.startsWith('-')) {
						return this.#c(arg)
					}
					if (['true', 'false'].includes(arg)) {
						return c(arg)
					}

					const n = tryNumber(arg)
					if (typeof n === 'number') {
						return c(n)
					}

					return arg
				})

				l('')

				if (title) {
					l(` ${title}`)
					l(`  ${cmd.join(' ')} ${coloredArgs.join(' ').trim()}`)
				} else {
					l(`  ${cmd.join(' ')} ${coloredArgs.join(' ').trim()}`)
				}
			}
			// l()
		}
	}

	#options_header = ''
	#options_strings_required = [] as string[]
	#options_strings = {} as Record<keyof T, string>
	get #options() {
		if (!Object.keys(this.#options_strings).length) this.#generateOptions()
		return this.#options_strings
	}

	#generateOptions() {
		this.#debug('generateOptions()')
		const longestFlag = Math.max(...Object.keys(this.config.args).map(key => key.length))
		const longestDescription = Math.max(...Object.values(this.config.args).map(def => def.description.length))
		this.#col1 = longestFlag + 4 // col 1 padding
		this.#col2 = longestDescription - 6 // col 2 padding

		this.#options_header = em(
			d(`  flag${' '.repeat(this.#col1)}description${' '.repeat(this.#col2 - 2)}${d('default')}`),
		)

		this.#options_strings = {} as Record<keyof T, string>

		for (const [key, def] of Object.entries(this.config.args)) {
			const flag = `--${key}`
			const short = def.short ? `-${def.short}` : '  '

			let str = '  ' + this.#c(flag)
			str += ' '.repeat(this.#col1 - flag.length)
			str += d(this.#c(short)) + '  '
			// let str = '  ' + this.#c(d(short)) + '  '
			// str += this.#c(flag)
			// str += ' '.repeat(this.#col1 - flag.length)
			str += def.description
			str += ' '.repeat(this.#col2 - def.description.length + 'description'.length - 2)
			str += d(def.default?.toString() ?? '')

			// @ts-expect-error
			this.#options_strings[key] = str

			if (def.required) {
				this.#options_strings_required.push(str)
			}
		}
	}

	#positionals_strings = {} as Record<string, string>
	// #positionals_example = ''
	get #positionals() {
		if (!Object.keys(this.#positionals_strings).length) this.#generatePositionals()
		return this.#positionals_strings
	}

	#generatePositionals() {
		this.#debug('generatePositionals()')

		this.#positionals_strings = {} as Record<string, string>

		const gap = 3
		const longestName = Math.max(...(this.config.positionals ?? []).map(p => p.name.length))
		const longestDescription = Math.max(...(this.config.positionals ?? []).map(p => p.description.length))

		// let example = ''

		for (const pos of this.config.positionals ?? []) {
			let str = '  '
			str += em(pos.name)
			str += ' '.repeat(longestName - pos.name.length + gap)
			str += d(pos.description)
			str += ' '.repeat(longestDescription - pos.description.length + gap)
			// if (pos.example) {
			// 	// str += d(em(pos.example))
			// 	example += ' ' + pos.example
			// }
			this.#positionals_strings[pos.name] = str
		}

		// if (example) {
		// 	this.#positionals_example = d(em('  e.g.  ')) + this.config.usage + example
		// }
	}
}

function tryNumber(value: string | number) {
	try {
		const n = Number(value)
		if (!isNaN(n)) {
			return n
		}
	} catch (error) {
		return value
	}
}

if (import.meta.main) {
	const cli = new Cli({
		banner: 'Foobar',
		description: 'A test instance of CLI running in Bun test.',
		cmd: 'bun test scripts/lib/cli.test.ts',
		examples: [
			{
				name: 'simple',
				cmd: 'bun test scripts/lib/cli.test.ts --hello "world" --boolean true --fake_number 10',
			},
			{
				name: 'solve world hunger',
				cmd: 'bun test scripts/lib/cli.test.ts --hunger false',
			},
		],
		args: {
			hello: { type: 'string', description: 'some string', default: 'world', short: 's' },
			hunger: { type: 'boolean', description: 'solve world hunger', default: true, short: 'h' },
		},
	})

	cli.run(v => {
		console.log('foo')
		console.log({ v })
	})
}
