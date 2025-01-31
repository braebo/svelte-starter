<script lang="ts">
	import type { Snippet } from 'svelte'

	import { hover } from '$lib/actions/hover'

	let {
		children,
		dropdown,
		force_open = false,
		onHover = () => {},
	}: {
		children: Snippet
		dropdown: Snippet
		force_open?: boolean
		onHover?: (hovering: boolean) => void
	} = $props()
</script>

<div
	class="dropdown"
	class:open={force_open}
	use:hover={{ delay: 500 }}
	onhover={({ detail }) => {
		onHover(detail.hovering)
	}}
>
	{@render children()}

	<nav class="dropdown-content">
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
