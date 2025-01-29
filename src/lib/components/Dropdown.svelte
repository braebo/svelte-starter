<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		children,
		dropdown,
		force_open = $bindable(false),
		align = 'left',
	}: {
		children: Snippet
		dropdown: Snippet
		force_open?: boolean
		align?: 'left' | 'right'
	} = $props()

	let hovering = $state(force_open)

	let open = $derived(hovering || force_open)

	function smooth_hover(node: HTMLElement) {
		function smoothOver(_e: Event) {
			clearTimeout(outTimer)
			hovering = true
		}

		let outTimer: ReturnType<typeof setTimeout>
		function smoothOut(_e: Event, delay = 500) {
			clearTimeout(outTimer)
			outTimer = setTimeout(() => {
				hovering = false
			}, delay)
		}

		node.addEventListener('pointerleave', smoothOut, true)
		node.addEventListener('pointerenter', smoothOver, true)

		return {
			destroy() {
				hovering = false
				clearTimeout(outTimer)
				node.removeEventListener('pointerleave', smoothOut, true)
				node.removeEventListener('pointerenter', smoothOver, true)
			},
		}
	}
</script>

<div class="dropdown" class:open use:smooth_hover>
	{@render children()}

	<nav class="dropdown-content" class:align-right={align === 'right'}>
		{@render dropdown()}
	</nav>
</div>

<style lang="scss">
	.dropdown {
		position: relative;
		display: inline-block;
		height: 100%;
	}

	.dropdown-content {
		position: absolute;
		top: calc(var(--nav-height));

		border-radius: var(--border-radius);
		border-top-left-radius: 0;
		border-top-right-radius: 0;

		opacity: 0;
		clip-path: inset(0 0 100% 0);
		transition: 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);

		filter: var(--shadow);

		pointer-events: none;
		isolation: isolate;
		z-index: -1;

		&.align-right {
			left: auto;
			right: -1rem;
		}
	}

	.dropdown:hover,
	.dropdown:focus-within,
	.dropdown.open {
		.dropdown-content {
			opacity: 1;
			clip-path: inset(0);
			pointer-events: all;
		}
	}
</style>
