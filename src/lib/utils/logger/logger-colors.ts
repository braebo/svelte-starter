import { isFirefox, isSafari } from '../ua'

export const CONSOLE_COLOR_CODES = {
	reset: '\x1b[0m',
	// Foreground colors
	black: '\x1b[30m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
	gray: '\x1b[90m',
	// Background colors
	bgBlack: '\x1b[40m',
	bgRed: '\x1b[41m',
	bgGreen: '\x1b[42m',
	bgYellow: '\x1b[43m',
	bgBlue: '\x1b[44m',
	bgMagenta: '\x1b[45m',
	bgCyan: '\x1b[46m',
	bgWhite: '\x1b[47m',
	// Styles
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	italic: '\x1b[3m',
	underline: '\x1b[4m',
} as const

type AnsiKeyword = keyof typeof CONSOLE_COLOR_CODES

// Simple hex to RGB conversion
const hexToRgb = (hex: string): [number, number, number] | null => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result
		? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
		: null
}

// Function to create hex color
export const hex = (hexColor: string) => (str: string) => {
	if (isSafari() || isFirefox()) return str

	const rgb = hexToRgb(hexColor)
	if (!rgb) return str

	return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m${str}\x1b[0m`
}

/**
 * Wraps a string in an ANSI color code.
 * @param colorName The name of the color to wrap the string in.
 * @returns A function that takes arguments (like `console.log`) and returns the wrapped string.
 */
export const color_wrap = (colorName: AnsiKeyword) => {
	if (isSafari() || isFirefox()) return (...args: any[]) => args.join('')

	return (...args: any[]) =>
		`${CONSOLE_COLOR_CODES[colorName]}${args.join('')}${CONSOLE_COLOR_CODES.reset}`
}

/** Wraps args in ansi red. */
export const r = color_wrap('red')
/** Wraps args in ansi green. */
export const g = color_wrap('green')
/** Wraps args in ansi yellow. */
export const y = color_wrap('yellow')
/** Wraps args in ansi blue. */
export const b = color_wrap('blue')
/** Wraps args in ansi magenta. */
export const m = color_wrap('magenta')
/** Wraps args in ansi cyan. */
export const c = color_wrap('cyan')
/** Wraps args in ansi gray. */
export const gr = color_wrap('gray')
/** Wraps args in ansi dim. */
export const d = color_wrap('dim')
/** Wraps args in ansi orange. */
export const o = hex('#ff7f50')
