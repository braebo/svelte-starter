import { Logger } from './logger/logger'
import { DEV } from 'esm-env'

class Device {
	/**
	 * Mobile breakpoint in pixels.
	 * @default 1000
	 */
	public breakpoint = $state(1000)
	/** `window.innerWidth` */
	public width = $state(900)
	/** `window.innerHeight` */
	public height = $state(900)
	/** true if `window.innerWidth` < {@link breakpoint|`breakpoint`} */
	public mobile = $derived.by(() => this.width < this.breakpoint)
	/**  `window.scrollY` */
	public scrollY = $state(0)
	/** Client coordinates of the mouse or touch point. */
	public mouse = $state({ x: 0, y: 0 })

	#log?: Logger
	#initialized = false

	constructor(
		/**
		 * Mobile breakpoint in pixels.
		 * @default 1000
		 */
		breakpoint?: number,
	) {
		if (!globalThis.window || this.#initialized) return
		this.#initialized = true

		if (breakpoint) this.breakpoint = breakpoint

		this.#onResize()
		this.#onScroll()

		addEventListener('resize', this.#onResize)
		addEventListener('scroll', this.#onScroll)
		addEventListener('pointermove', this.#onPointerMove)

		if (DEV) this.#log = new Logger('Device', { fg: 'plum' })
	}

	#onResize = (): void => {
		this.width = globalThis.window.innerWidth || 0
		this.height = globalThis.window.innerHeight || 0
	}

	#onScroll = (): void => {
		this.scrollY = globalThis.window.scrollY || 0
	}

	#frame = 0
	#onPointerMove = (e?: PointerEvent): void => {
		cancelAnimationFrame(this.#frame)
		this.#frame = requestAnimationFrame(() => {
			this.mouse.x = e?.clientX || 1
			this.mouse.y = e?.clientY || 1
		})
	}
}

/**
 * Reactive window / pointer wrapper with a dispose method.
 *
 * Available properties:
 * - `breakpoint` - _mobile breakpoint in pixels_
 * - `width` - _window width in pixels_
 * - `height` - _window height in pixels_
 * - `mobile` - _true if width < breakpoint_
 * - `scrollY` - _scroll position in pixels_
 * - `mouse` { x, y } - _client coordinates of the mouse or touch point_
 */
export const device = new Device()

type EventCallback = (e?: Event | PointerEvent) => void
