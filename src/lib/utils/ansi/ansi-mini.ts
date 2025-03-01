import { ansiHex, ansiStyle } from './ansi-hex'
import { log } from './ansi-logger'

/**
 * @fileoverview ANSI Mini
 * Irresponsibly short ANSI code wrappers for the terminal / supported browsers (Chrome).
 * It's mostly a palette of ANSI True Color wrappers using `{@link ansiHex}` and `{@link ansiStyle}`.
 *
 * @example
 * ```ts
 * import { l, r, dim, bd, em } from '@braebo/ansi/mini'
 */

/** Wraps args in ansi red. */
export const r = ansiHex('#ff5347')
/** Wraps args in ansi green. */
export const g = ansiHex('#57ab57')
/** Wraps args in ansi blue. */
export const b = ansiHex('#4c4ce0')
/** Wraps args in ansi yellow. */
export const y = ansiHex('#e2e270')
/** Wraps args in ansi magenta. */
export const m = ansiHex('#d426d4')
/** Wraps args in ansi cyan. */
export const c = ansiHex('#2fdede')
/** Wraps args in ansi orange. */
export const o = ansiHex('#ff7f50')
/** Wraps args in ansi purple. */
export const p = ansiHex('#9542e7')
/** Wraps args in ansi gray. */
export const gr = ansiHex('#808080')

/** Wraps args in ansi dim. */
export const d = ansiStyle('dim')
/** Wraps args in ansi bold. */
export const bd = ansiStyle('bold')
/** Wraps args in ansi italic. */
export const em = ansiStyle('italic')
/** Wraps args in ansi underline. */
export const ul = ansiStyle('underline')
/** Wraps args in ansi inverse. */
export const inv = ansiStyle('inverse')
/** Wraps args in ansi strikethrough. */
export const s = ansiStyle('strikethrough')

/** Logs a new line `count` times. */
export function n(count = 1) {
	for (let i = 0; i < count; i++) {
		log()
	}
}

/** `console.log` shorthand. */
export function l(...args: any[]) {
	log(args)
}

/** `console.error` with prefix and ERROR label */
export function err(...args: any[]) {
	log(args, { label: r(bd('ERROR ')), logger: console.error })
}
