/**
 * Creates an ANSI True Color _(24-bit RGB)_ formatter function from a hex color, falling back to
 * uncolored text in unsupported browsers _(Safari, Firefox)_.
 *
 * @example
 * ```ts
 * const red = ansiHex('#ff0000')
 * console.log(red('This text will be red'))
 * ```
 */
export function ansiHex(hex_color: `#${string}`, background = false) {
	return (...args: any[]) => {
		const str = args.join('')
		if (globalThis.navigator?.userAgent.match(/firefox|safari/i)) {
			return str
		}

		const rgb = hexToRgb(hex_color)
		if (!rgb) return str

		return `\x1b[${background ? '48' : '38'};2;${rgb[0]};${rgb[1]};${rgb[2]}m${str}\x1b[0m`
	}
}

/**
 * @internal
 * @see https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters
 */
export const ANSI_STYLE_CODES = {
	reset: 0,
	bold: 1,
	dim: 2,
	italic: 3,
	underline: 4,
	inverse: 7,
	hidden: 8,
	strikethrough: 9,
} as const

export type AnsiStyle = keyof typeof ANSI_STYLE_CODES

/**
 * Creates an {@link AnsiStyle|ANSI style} formatter function from a style name, falling back to
 * uncolored text in unsupported browsers (Safari, Firefox).
 *
 * @example
 * ```ts
 * const bold = ansiStyle('bold')
 * console.log(bold('This text will be bold'))
 * ```
 */
export function ansiStyle(style: AnsiStyle): (...args: any[]) => string {
	if (globalThis.navigator?.userAgent.match(/firefox|safari/i)) {
		return (...args: any[]) => args.join('')
	}

	const code = ANSI_STYLE_CODES[style]
	const styleCode = `\x1b[${code}m`
	const resetCode =
		code === 0
			? ''
			: code <= 2 // bold/dim
				? '\x1b[22m'
				: `\x1b[2${code}m`

	return (...args: any[]) => `${styleCode}${args.join('')}${resetCode}`
}

/**
 * Converts a hex color string into an `[r, g, b]` tuple in range `[0,255]`.
 */
export function hexToRgb(hex: string): [number, number, number] | null {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
	return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null
}
