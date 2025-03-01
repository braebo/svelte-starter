import { isFirefox, isSafari } from '../ua'

export const ANSI_COLOR_CODES = {
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
	gray: '\x1b[90m',

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

type AnsiKeyword = keyof typeof ANSI_COLOR_CODES

// Simple hex to RGB conversion
function hexToRgb(hex: string): [number, number, number] | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}

// Function to create hex color
export const hex =
	(hexColor: string) =>
	(...args: any[]) => {
		const str = args.join('')
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
export const color = (colorName: AnsiKeyword) => {
	if (isSafari() || isFirefox()) return (...args: any[]) => args.join('')

	// Use selective resets based on the type of style
	const resetCode = colorName.startsWith('bg')
		? '\x1b[49m' // Reset background.
		: colorName === 'bold' || colorName === 'dim'
			? '\x1b[22m' // Reset weight / intensity.
			: colorName === 'italic'
				? '\x1b[23m' // Reset italic.
				: colorName === 'underline'
					? '\x1b[24m' // Reset underline.
					: '\x1b[39m' // Reset foreground color.

	return (...args: any[]) => `${ANSI_COLOR_CODES[colorName]}${args.join('')}${resetCode}`
}
