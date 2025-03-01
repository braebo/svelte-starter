import type { CSSColorName } from './css-colors.ts'

import { CSS_COLORS, randomCSSColorName } from './css-colors'
import { stringify } from '$lib/utils/stringify'
import { r, y, gr, d } from './logettes'
import { hex } from './logger-colors.js'
import { defer } from '$lib/utils/defer'
import { tldr } from '$lib/utils/tldr'
import { DEV } from 'esm-env'

export interface LoggerOptions {
	/**
	 * Whether to use the styled logger or the regular console.log.
	 * @default true
	 */
	styled: boolean
	/**
	 * Whether to defer the log to the next idle state.
	 * @default true
	 */
	deferred: boolean
	/**
	 * The foreground color of the log.
	 * @default randomColor()
	 */
	fg: CSSColorName | (string & {})
	/**
	 * The background color of the log.
	 * @default transparent
	 */
	bg: CSSColorName | (string & {})
	/**
	 * Any additional CSS to apply to the log.
	 * @default ''
	 */
	css: string
	/**
	 * Whether to run the logger on the server.
	 * @default false
	 */
	server: boolean | 'dev'
	/**
	 * Whether to run the logger in the browser.  By default, only runs in dev.
	 * @default 'dev'
	 */
	browser: boolean | 'dev'
	/**
	 * Print's the url of the file that called the logger.
	 */
	callsite: boolean
	/**
	 * The title of the logger.  Prepended to all logs.
	 * @default ''
	 */
	title: string
	/**
	 * The level of the logger.
	 * @default 'info'
	 */
	level: keyof typeof LOG_LEVELS
}

// todo - How can we ensure the logger is stripped _completely_ from production builds?
const ENABLED = true

const LOG_LEVELS = {
	debug: 1,
	info: 2,
	warn: 3,
	error: 4,
	off: 5,
} as const

interface LogGroup {
	title: string
	messages: unknown[]
}

export class Logger {
	private static _BYPASS_STYLES = false
	private static _BYPASS_DEFER = true

	title = ''
	options: Partial<LoggerOptions>
	color: (str: string) => string

	#logger: (...args: unknown[]) => void

	#group: LogGroup | null = null

	#level!: keyof typeof LOG_LEVELS
	#log_info!: boolean
	#log_warn!: boolean
	#log_error!: boolean
	#log_debug!: boolean

	constructor(title: string, options?: Partial<LoggerOptions>)
	constructor(options: Partial<LoggerOptions>)
	constructor(titleOrOptions: string | Partial<LoggerOptions>, options?: Partial<LoggerOptions>) {
		if (typeof titleOrOptions === 'string') {
			this.title = titleOrOptions
			this.options = options ?? {}
		} else {
			this.title = titleOrOptions.title ?? ''
			this.options = titleOrOptions
		}

		this.level = this.options.level ?? 'info'

		const color = this.options.fg?.toLowerCase() ?? randomCSSColorName()
		this.options.fg = color
		const fg = color.startsWith('#') ? color : color in CSS_COLORS ? CSS_COLORS[color as CSSColorName] : color
		this.color = hex(fg)

		this.#logger = Logger.createLogger(this.title, this.options)

		return this
	}

	get deferred() {
		return !Logger._BYPASS_DEFER && this.options?.deferred
	}

	get level() {
		return this.#level
	}
	set level(level: keyof typeof LOG_LEVELS) {
		this.#level = level
		this.#log_info = LOG_LEVELS[level] <= LOG_LEVELS.info
		this.#log_warn = LOG_LEVELS[level] <= LOG_LEVELS.warn
		this.#log_error = LOG_LEVELS[level] <= LOG_LEVELS.error
		this.#log_debug = LOG_LEVELS[level] <= LOG_LEVELS.debug
	}

	/**
	 * Logs any args as well as any logs in the current buffer.
	 * @param args
	 */
	log = (...args: unknown[]) => {
		if (this.#group) {
			if (this.#group.messages.length) {
				this.#group.messages.push(this.color('\n ∟ '))
			}
			this.#group.messages.push(...args)
		} else {
			this.#logger(...args)
		}
	}

	static #i = hex('#426685')('ⓘ')
	info(...args: unknown[]) {
		if (this.#log_info) this.log(Logger.#i, ...args)
		return this
	}

	fn(str: string, ...args: unknown[]) {
		return this.info(Logger.fn(str, ...args))
	}

	warn(...args: unknown[]) {
		if (this.#log_warn) this.log(y('⚠'), ...args)
		return this
	}

	error(...args: unknown[]) {
		if (this.#log_error) this.log(r('⛔'), ...args)
		return this
	}

	debug(...args: unknown[]) {
		if (this.#log_debug) this.log(r('🐞'), ...args)
		return this
	}

	/**
	 * Replaces any sequentially repeating strings in the group buffer with a single instance and a count.
	 */
	consolidateBuffer() {
		if (!this.#group) return
		const buff = new Map<string, number>()

		for (const item of this.#group.messages) {
			const key = typeof item === 'object' ? stringify(item) : String(item)
			buff.set(key, (buff.get(key) ?? 0) + 1)
		}

		this.#group.messages = Array.from(buff).map(([item, count]) => (count > 1 ? `${item}x${d(`${count}`)}` : item))
	}

	/**
	 * Formats a string to display a more readable representation of a function call, including
	 * the name of the method being called and the arguments it's being called with.
	 * @returns The formatted string.
	 *
	 * @example
	 * ```typescript
	 * const logger = new Logger('Foo')
	 * logger.log(Logger.fn('bar', a))
	 * ```
	 */
	static fn(
		/**
		 * The name of the method being called.
		 */
		str: string,
		/**
		 * The arguments being passed to the method.
		 */
		...args: unknown[]
	) {
		return (
			gr(str) + gr('(') + args.map(a => gr(typeof a === 'object' ? stringify(a) : String(a))).join(', ') + gr(')')
		)
	}

	group(title: string, options?: LoggerOptions & { parens?: boolean }, ...args: unknown[]) {
		const newGroup: LogGroup = {
			title,
			messages: [],
		}

		this.#group = newGroup

		if (options?.parens ?? true) {
			title =
				title +
				gr('(') +
				args.map(a => gr(typeof a === 'object' ? stringify(a) : String(a))).join(', ') +
				gr(')')
		}
		if (options?.fg ?? true) {
			title = this.color(title)
		}

		this.log(this.color('▼ ') + title)
		return this
	}

	groupEnd() {
		if (this.#group) {
			this.#logger(...this.#group.messages)
			this.#group = null
		}
		return this
	}

	static createLogger(title: string, options?: Partial<LoggerOptions>) {
		if (!ENABLED) return () => void 0
		if (options?.browser === 'dev' && !DEV) return () => void 0

		options ??= {}

		const BROWSER = typeof globalThis.window !== 'undefined'
		const SERVER = !BROWSER

		if (!BROWSER || options.browser === false) return () => void 0
		if (SERVER && options.server !== true) return () => void 0

		const fg = options.fg || randomCSSColorName()
		const bg = options.bg || 'transparent'
		const css = options.css ?? ''

		options.styled ??= true
		const styled = options.styled && !Logger._BYPASS_STYLES

		options.deferred ??= true
		const deferred =
			options.deferred && !Logger._BYPASS_DEFER && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

		let messageConfigBase = '%c%s%c'

		const [t, ...rest] = title.split(' ')
		const restParts = [] as string[]
		if (rest.length) {
			for (const part of rest) {
				restParts.push(`color:#666;background:${bg};padding:0.1rem;filter:saturate(0.25);${css}`, ` ${part}`)
			}
			const i = restParts.indexOf(restParts.at(-1) ?? '')
			if (i >= 0) {
				restParts[i] = `${restParts[i]}\n`
			}
			messageConfigBase = '%c%s'.repeat(rest.length) + `${messageConfigBase}`
			title = t
		} else {
			title = `${title}\n`
		}

		const log = !styled
			? (...args: unknown[]) => {
					console.log(`| ${title} |`, ...args)
				}
			: (...args: unknown[]) => {
					let messageConfig = messageConfigBase

					args.forEach(argument => {
						const type = typeof argument
						switch (type) {
							case 'bigint':
							case 'number':
								messageConfig += '%d '
								break

							case 'string':
								messageConfig += '%s '
								break

							case 'object':
							case 'boolean':
							case 'undefined':
							default:
								messageConfig += '%o '
						}
					})

					console.log(
						messageConfig + '%c',
						`color:${fg};background:${bg};padding:0.1rem;${css}`,
						`${title}`,
						...restParts,
						`color:initial;background:${bg};padding:0.1rem;${css}`,
						...args.map(a => (import.meta?.env?.VITEST ? tldr(a, { maxDepth: 1, maxSiblings: 1 }) : a)),
						`color:#666;background:${bg};padding:0.1rem;${css};font-size:0.66rem;`,
					)
				}

		if (!deferred) return log

		return (...args: unknown[]) => defer(() => log(...args))
	}
}

export const logger = (title = 'LOG', options?: LoggerOptions) => {
	return Logger.createLogger(title, options)
}
