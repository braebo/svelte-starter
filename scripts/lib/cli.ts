import { l, d, em, bd, r, c, m, err } from '../../src/lib/utils/logger/logettes'
import { hex } from '../../src/lib/utils/logger/logger-colors'
import { parseArgs, type ParseArgsConfig } from 'util'

export interface PositionalArg {
	name: string
	description: string
	required?: boolean
	example?: string
}

export interface ArgDef<T extends string | boolean | number = string | boolean | number> {
	default: T
	description: string
	/**
	 * Short form of the flag.
	 * @example
	 * args: {
	 *   foo: {
	 *     default: 'bar',
	 *     short: '-f'
	 *   }
	 * }
	 */
	short?: string
	required?: boolean
	/**
	 * Optional override for the arg parser.  By default, this is inferred from the value of
	 * {@link default}.
	 */
	type?: T extends boolean ? 'boolean' : T extends number ? 'number' : 'string'
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

	constructor(public config: CliConfig<T>) {
		// @ts-expect-error
		this.config.args.help ??= {
			type: 'boolean',
			description: 'Help screen',
		}

		// Avoid adding `-h` to the help flag if it's already taken.
		if (Object.values(config.args).some(a => a.short === 'h')) {
			this.config.args.help.short = 'h'
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

			// this.#intro()
			this.#log_args()

			callback?.(this.values, this.positionals)
		} catch (e) {
			console.log('asdf')
			if (e.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
				const optionRegex = /'(-{1,2}[a-zA-Z][a-zA-Z0-9-]*)'/
				const option = e.message.match(optionRegex)?.[1]

				this.error(`${d('Unknown option:')} ${option}`)
				this.#log_options()

				return
			}

			if (e.code === 'ERR_INVALID_ARG_VALUE') {
				this.error(`${d('Invalid value:')} ${e.message}`)
				this.#log_options()
				return
			}

			if (e.code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE') {
				e.code = 'Invalid option value'

				if (e.message.match('Did you forget to specify the option argument for')) {
					e.message = e.message.replace(
						/Option '--([^']+)' argument is ambiguous\./,
						"Option '--$1' argument is ambiguous.\nIf '--$1' is a boolean, set `type: \"boolean\"` or `default: true|false`.",
					)
				}

				err(e.message)
			}

			if (e.code) this.error(e.code)
			this.#log_options()
			this.#log_outro()

			throw e
		}
	}

	/**
	 * Calls `util.parseArgs` while preserving numbers.
	 * @returns The parsed arguments.
	 */
	#parseArgs() {
		// Hide numbers from parseArgs or it'll blow up.
		const options: ParseArgsConfig['options'] = Object.entries(this.config.args).reduce((acc, [key, def]) => {
			let short = def.short ?? key[0]
			if (short.startsWith('-')) {
				short = short.slice(1)
			}

			let type = (def.type as string | undefined) ?? typeof def.default
			if (['number', 'undefined'].includes(type)) {
				type = 'string'
			}

			let defaultValue = def.default
			if (typeof defaultValue === 'number') {
				defaultValue = defaultValue.toString()
			}

			return {
				...acc,
				[key]: {
					type,
					...(short && { short }),
					...(defaultValue && { default: defaultValue }),
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

				this.error(`Missing argument: ${this.#c('--' + key)}`)
				this.#log_options()

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

		missing.forEach(m => this.error(`Missing argument: ${this.#c(`${m}`)}`))

		this.#log_usage()
		this.#log_positionals()
		this.#log_options()

		return false
	}

	help() {
		this.#debug('help()')
		this.#log_intro()
		this.#log_usage()
		this.#log_positionals()
		this.#log_options()
		this.#log_examples()

		this.#log_outro()
	}

	/**
	 * Prints an error message.
	 * @param message - The error message to print.
	 * @param printOptions - Whether to print the options.
	 */
	error(message: string) {
		l()
		l(r(bd('ERROR')))
		l(`  ${message}`)
		// if (printOptions) {
		// 	this.#log_options()
		// }
	}

	#log_banner() {
		if (this.config.banner) {
			l()
			this.config.banner.split('\n').forEach(line => l(this.#c(bd(line))))
		}
	}

	#log_description() {
		if (this.config.description) {
			l()
			l(em(d(` ${this.config.description}`)))
		}
	}

	#log_intro() {
		this.#debug('intro()')

		console.log(d('↴'))

		this.#log_banner()
		this.#log_description()
	}

	#log_outro() {
		console.log(d('↵'))
	}

	#log_usage() {
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
		}

		l(str)
	}

	#log_positionals() {
		this.#debug('printPositionals()')
		if (!this.#positionals) return

		l()
		for (const str of Object.values(this.#positionals)) {
			l(str)
		}
	}

	/**
	 * Prints the options
	 */
	#log_options() {
		this.#debug('printOptional()')
		const opts = this.#options

		l()
		l()
		l(bd('Options'))

		l(this.#options_header)
		l()
		for (const str of Object.values(opts)) {
			l(str)
		}
	}

	#log_examples() {
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

	#log_args() {
		this.#debug('log_args()')
		this.#log_banner()
		l()
		// l()
		// l(bd('Args'))
		// l()
		// for (const [k, v] of Object.entries(this.args)) {
		// 	l(k, v)
		// }
		const longestFlag = Math.max(...Object.keys(this.config.args).map(key => key.length))
		const padding = ' '.repeat(longestFlag - 2)
		for (const [k, v] of Object.entries(this.values)) {
			l(this.#c(d(`--${k}`)), padding, v)
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

		for (const pos of this.config.positionals ?? []) {
			let str = '  '
			str += em(pos.name)
			str += ' '.repeat(longestName - pos.name.length + gap)
			str += d(pos.description)
			str += ' '.repeat(longestDescription - pos.description.length + gap)
			this.#positionals_strings[pos.name] = str
		}
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
