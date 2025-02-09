// Color utils for one-off script.

// ANSI escape codes for colors and styles
const codes = {
	// Styles
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	italic: '\x1b[3m',
	underline: '\x1b[4m',
	inverse: '\x1b[7m',
	hidden: '\x1b[8m',
	strikethrough: '\x1b[9m',

	// Foreground colors
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',

	// Bright foreground colors
	brightBlack: '\x1b[90m',
	brightRed: '\x1b[91m',
	brightGreen: '\x1b[92m',
	brightYellow: '\x1b[93m',
	brightBlue: '\x1b[94m',
	brightMagenta: '\x1b[95m',
	brightCyan: '\x1b[96m',
	brightWhite: '\x1b[97m',

	// Background colors
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m',

	// Bright background colors
	bgBrightBlack: '\x1b[100m',
	bgBrightRed: '\x1b[101m',
	bgBrightGreen: '\x1b[102m',
	bgBrightYellow: '\x1b[103m',
	bgBrightBlue: '\x1b[104m',
	bgBrightMagenta: '\x1b[105m',
	bgBrightCyan: '\x1b[106m',
	bgBrightWhite: '\x1b[107m',
} as const

type ColorCode = keyof typeof codes

// Helper function to wrap text with ANSI codes
const color = (str: string, ...styles: ColorCode[]): string => {
	if (styles.length === 0) return str
	const prefix = styles.map((style) => codes[style]).join('')
	return `${prefix}${str}${codes.reset}`
}

// Create individual color functions
type ColorFunction = (str: string) => string
type Colors = { [K in ColorCode]: ColorFunction }

/**
 * A map of color functions for each color code.
 * @example
 * console.log(colors.green('Success!'));
 * console.log(colors.red('Error!'));
 * console.log(colors.yellow('Warning!'));
 */
export const colors = Object.keys(codes).reduce((acc, code) => {
	acc[code as ColorCode] = (str: string) => color(str, code as ColorCode)
	return acc
}, {} as Colors)

/**
 * A wrapper function that preserves string interpolation and nested styles.
 */
function wrap(style: ColorCode) {
	return (strings: TemplateStringsArray | any, ...values: any[]) => {
		// Handle both template literals and regular values.
		if (strings instanceof Array) {
			// Template literal case.
			const result = strings.reduce((acc, str, i) => {
				const value = values[i] || ''
				// If the interpolated value already has ANSI codes.
				if (typeof value === 'string' && value.includes('\x1b[')) {
					// Extract the reset code and add our style code after it.
					const parts = value.split(codes.reset)
					// There might be content after the reset code.
					const lastPart = parts[parts.length - 1]
					const processedValue =
						value.slice(0, -lastPart.length - codes.reset.length) +
						codes.reset +
						codes[style] +
						lastPart
					return acc + str + processedValue
				}
				return acc + str + value
			}, '')
			return color(result, style)
		}
		// Regular value case
		return color(String(strings), style)
	}
}

/** console.log */
export function l(...args: any[]) {
	console.log(color('|', 'dim'), ...args)
}

/** console.error */
export function err(...args: any[]) {
	console.error(color('| ERROR:', 'red'), ...args)
}

/** Wraps a string in ansi `red`: `\x1b[31m` */
export const r = wrap('red')
/** Wraps a string in ansi `green`: `\x1b[32m` */
export const g = wrap('green')
/** Wraps a string in ansi `yellow`: `\x1b[33m` */
export const y = wrap('yellow')
/** Wraps a string in ansi `blue`: `\x1b[34m` */
export const b = wrap('blue')
/** Wraps a string in ansi `magenta`: `\x1b[35m` */
export const m = wrap('magenta')
/** Wraps a string in ansi `cyan`: `\x1b[36m` */
export const c = wrap('cyan')
/** Wraps a string in ansi `dim`: `\x1b[2m` */
export const d = wrap('dim')
/** Wraps a string in ansi `reset`: `\x1b[0m` */
export const reset = wrap('reset')
/** Wraps a string in ansi `bold`: `\x1b[1m` */
export const bd = wrap('bold')
