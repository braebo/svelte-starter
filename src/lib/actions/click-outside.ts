import type { Action } from 'svelte/action'

/**
 * Calls a function when the user clicks outside the element.
 * @example
 * ```svelte
 * <div onOutClick={someFunction} use:clickOutside={{ whitelist: ['.burger'] }}>
 * ```
 */
export const clickOutside: Action<
	Element,
	| {
			/**
			 * Array of classnames.  If the click target element has one of these classes, it will not fire the `onOutClick` event.
			 */
			whitelist?: string[]
	  }
	| undefined,
	{
		onOutClick?: (
			event: CustomEvent<{
				target: HTMLElement
			}>,
		) => void
	}
> = (node, options) => {
	const handleClick = (event: MouseEvent) => {
		let disable = false

		for (const className of options?.whitelist || []) {
			if (event.target instanceof Element && event.target.classList.contains(className)) {
				disable = true
			}
		}

		if (!disable && node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(
				new CustomEvent('outclick', {
					detail: {
						target: event.target as HTMLElement,
					},
				}),
			)
		}
	}

	document.addEventListener('click', handleClick, true)

	return {
		update: (newOptions) => (options = { ...options, ...newOptions }),
		destroy() {
			document.removeEventListener('click', handleClick, true)
		},
	}
}
