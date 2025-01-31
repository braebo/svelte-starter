import type { Action } from 'svelte/action'

/**
 * Calls `onHover` when the user hovers over the element.  When the user hovers out, it waits until
 * `delay` milliseconds have passed before calling `onHover` again with `hovering: false`.
 */
export const hover: Action<
	Element,
	| {
			/**
			 * Delay in milliseconds before releasing the hover state.
			 * @default 0
			 */
			delay?: number
	  }
	| undefined,
	{
		onhover?: (event: CustomEvent<{ hovering: boolean }>) => void
	}
> = (node, options) => {
	function enter(_e: Event) {
		clearTimeout(leaveTimer)
		node.dispatchEvent(new CustomEvent('hover', { detail: { hovering: true } }))
	}

	let leaveTimer: ReturnType<typeof setTimeout>
	function leave(_e: Event) {
		clearTimeout(leaveTimer)
		leaveTimer = setTimeout(() => {
			node.dispatchEvent(new CustomEvent('hover', { detail: { hovering: false } }))
		}, options?.delay ?? 0)
	}

	node.addEventListener('pointerleave', leave, true)
	node.addEventListener('pointerenter', enter, true)

	return {
		destroy() {
			clearTimeout(leaveTimer)
			node.removeEventListener('pointerleave', leave, true)
			node.removeEventListener('pointerenter', enter, true)
		},
	}
}
