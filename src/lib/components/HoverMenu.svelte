<script lang="ts">
	import type { Snippet } from 'svelte'

	let { active, children }: { active?: boolean; children: Snippet } = $props()
</script>

<div class="hover-menu-outer" class:active>
	{@render children()}
</div>

<style lang="scss">
	.hover-menu-outer {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: row;

		&.active {
			text-decoration: 1px underline var(--theme-a);
		}

		:global(a),
		:global(button) {
			display: block;

			width: 100%;
			padding: 1rem 1.5rem;

			color: inherit;

			font: var(--font-ui-md);
			text-decoration: none;
			line-height: 1;
			text-align: left;
		}

		// :global(a:hover),
		// :global(button:hover) {
		// 	box-shadow: inset 0 -1px 0 0 var(--theme-a);
		// }
	}
</style>
