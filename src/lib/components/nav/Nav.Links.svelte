<!-- @component
    Links section of the navigation bar containing the main navigation links.
-->

<script lang="ts">
	import { router, type Route } from '$lib/router'

	import HoverMenu from '$lib/components/HoverMenu.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import { page } from '$app/state'

	let { links }: { links: Route[] } = $props()

	let hoverId = $state<string | null>(null)

	function setActiveHoverId(hovering: boolean, path: string) {
		if (hovering) {
			hoverId = path
		} else if (hoverId === path) {
			hoverId = null
		}
	}
</script>

<div class="links">
	{#each links as link}
		{#if link.children?.[0]?.path}
			<!-- prettier-ignore -->
			<Dropdown
				onHover={e => setActiveHoverId(e, link.path)}
				force_open={
					!(hoverId && hoverId !== link.path) && 
					(router.isActive(link.path, page) ||
					router.isParent(link.path, page))
				}
			>
				<div class="link-wrapper">
					{@render anchor(link, 'primary')}
				</div>

				{#snippet dropdown()}
					<HoverMenu>
						{#each link.children ?? [] as child}
							{@render anchor(child, 'secondary')}
						{/each}
					</HoverMenu>
				{/snippet}
			</Dropdown>
		{:else}
			{@render anchor(link, 'primary')}
		{/if}
	{/each}
</div>

{#snippet anchor(link: Route, className: string)}
	{@const active = router.isActive(link.path, page)}
	{@const parent = router.isParent(link.path, page)}
	{@const child = router.isChild(link.path, page)}
	{@const sibling = router.isSibling(link.path, page)}

	<a
		class={className}
		href={link.path}
		data-text={link.title}
		aria-current={active ? 'page' : null}
		class:sibling
		class:active
		class:parent
		class:child
	>
		{link.title}
	</a>

	{#if className === 'primary' && link.children?.length}
		<div class="lip" class:active class:parent class:sibling></div>
	{/if}
{/snippet}

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

		.lip {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;

			width: 1rem;
			height: 0.2rem;
			margin: 0 auto;

			border-top-left-radius: var(--radius-sm);
			border-top-right-radius: var(--radius-sm);

			--bg1: var(--bg-b);
			--bg2: var(--bg-a);

			:root.light & {
				--bg1: color-mix(in oklch, var(--bg-b), var(--bg-c) 20%);
				--bg2: color-mix(in oklch, var(--bg-c), var(--bg-d) 10%);
			}

			&.active {
				&::before {
					opacity: 1;
					background-image: radial-gradient(
						ellipse at 50% 100% in oklch,
						var(--theme-a) -50%,
						color-mix(in srgb, var(--bg1), var(--theme-a) 10%) 50%,
						var(--bg2) 120%
					);
				}
			}

			&.parent {
				background: color-mix(in srgb, var(--theme-a), var(--bg-a) 33%);

				&::before {
					opacity: 1;
					background-image: radial-gradient(circle at 50% 250%, transparent 60%, var(--bg2) 100%);
				}
			}

			&::before {
				$width: 1.5rem;
				content: '';
				position: absolute;
				bottom: 0;
				left: calc($width * -0.175);

				width: $width;
				height: 0.6rem;
				margin: 0 auto;

				opacity: 0.5;
				background-image: radial-gradient(circle at 50% 150%, transparent 0%, var(--bg-a) 100%);
				border-top-left-radius: var(--radius-sm);
				border-top-right-radius: var(--radius-sm);

				z-index: -1;
			}
		}

		.primary:hover + .lip,
		.primary.active + .lip {
			opacity: 1;
			background-color: var(--theme-a);
			&::before {
				opacity: 1;
				background-image: radial-gradient(
					ellipse at 50% 100% in oklch,
					var(--theme-a) -50%,
					color-mix(in srgb, var(--bg1), var(--theme-a) 10%) 50%,
					var(--bg2) 120%
				);
			}
		}

		.primary:hover:not(.active) + .lip {
			opacity: 1;
			background-color: color-mix(in srgb, var(--theme-a), var(--bg-c) 50%);
		}

		a {
			box-sizing: content-box;

			position: relative;
			display: inline-flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;

			color: inherit;
			outline-offset: -2px;
			border-left: 1px solid transparent;
			border-right: 1px solid transparent;
			text-decoration: none;
			box-shadow: inset 0 -1px 0 0 transparent;

			font-family: var(--font-a);
			font-variation-settings: 'wght' 450;
			// font-size: var(--font);
			font-size: 1.6rem;
			white-space: nowrap;
			line-height: 1.5;
			letter-spacing: 0.05rem;

			transition: 0.1s;

			&.child:not(.active):not(:hover):not(:focus-visible) {
				color: var(--fg-c);
				font-variation-settings: 'wght' 450;
			}

			&::after {
				content: attr(data-text);
				content: attr(data-text) / '';
				height: 0;
				visibility: hidden;
				overflow: hidden;
				user-select: none;
				pointer-events: none;

				@media speech {
					display: none;
				}
			}

			&.active,
			&::after {
				font-variation-settings: 'wght' 620;
			}

			&:hover.secondary {
				background: light-dark(var(--bg-b), var(--bg-c));
			}

			&.active.secondary {
				box-shadow: inset 0 -1px 0 0 var(--theme-a);
			}

			&:not(.secondary) {
				box-sizing: content-box;
				padding: 0 1.5rem;
			}

			&.secondary {
				font-size: var(--font-sm);

				&:first-of-type {
					border-bottom-left-radius: var(--radius-sm);
				}
				&:last-of-type {
					border-bottom-right-radius: var(--radius-sm);
				}
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
