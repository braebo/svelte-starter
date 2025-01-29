<!-- @component
    Links section of the navigation bar containing the main navigation links.
-->

<script lang="ts">
	import type { Route } from '$lib/routes'
	import HoverMenu from '$lib/components/HoverMenu.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { page } from '$app/state'

	let { links }: { links: Route[] } = $props()
</script>

<div class="links">
	{#each links as link}
		{@const active = page.url.pathname.startsWith(`${link.path}`)}

		{#if link.sections?.[0].path}
			<Dropdown force_open={active}>
				<div class="link-wrapper">
					<a href={link.path} aria-current={active ? 'page' : null} class:active>
						{link.title}
					</a>

					<div class="chevron">
						<Icon name="chevron-down" size={12} />
					</div>
				</div>

				{#snippet dropdown()}
					<HoverMenu>
						{#each link.sections! as section}
							{@const active =
								page.url.pathname === section.path ||
								page.url.pathname.startsWith(section.path)}

							<a
								class="secondary"
								href={section.path}
								aria-current={active ? 'page' : null}
								class:active
							>
								{section.title}
							</a>
						{/each}
					</HoverMenu>
				{/snippet}
			</Dropdown>
		{:else}
			<a href={link.path} aria-current={active ? 'page' : null} class:active>
				{link.title}
			</a>
		{/if}
	{/each}
</div>

<style lang="scss">
	.links {
		display: flex;
		width: 100%;
		align-items: center;

		opacity: 0;
		transform: translateX(-1rem);
		animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;

		.link-wrapper {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			height: 100%;
		}

		.chevron {
			display: flex;
			align-items: center;
			justify-content: center;

			min-width: 4rem;
			max-width: 4rem;
			width: 4rem;
			height: 60%;

			border-radius: var(--radius);

			cursor: pointer;

			&:hover {
				background: var(--bg-d);
			}
		}

		a {
			display: flex;
			align-items: center;
			text-decoration: none;

			height: 100%;

			color: inherit;
			outline-offset: -2px;

			font: var(--font-ui);
			white-space: nowrap;

			box-shadow: inset 0 -1px 0 0 transparent;
			transition: box-shadow 0.2s;

			&:hover {
				box-shadow: inset 0 -1px 0 0 var(--bg-c);
			}

			&[aria-current='page'] {
				color: var(--fg-a);
				box-shadow: inset 0 -1px 0 0 var(--theme-a);
			}

			&:not(.secondary) {
				padding: 0.1rem 0.8rem 0 0.8rem;
			}

			&.secondary {
				// box-shadow: none;
				font: var(--font-ui-sm);

				// &.active {
				// 	text-decoration: 1px underline var(--theme-a);
				// 	text-underline-offset: 1rem;
				// }
			}
		}
	}

	@keyframes fade-in {
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>
