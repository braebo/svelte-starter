<!-- @component
Top navigation bar for the application. It provides a slot for the left side, the right side, and the center.
-->

<script lang="ts">
	import type { Route } from '$lib/routes'

	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte'
	import FontToggle from '$lib/components/FontToggle.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { nav_state } from './nav_state.svelte'
	import MobileMenu from './MobileMenu.svelte'
	import { page } from '$app/state'
	import { tick } from 'svelte'

	let {
		links,
		title,
	}: {
		links: Route[]
		title: string | undefined
	} = $props()

	let current = $state<Route>()
	let menu_button: HTMLButtonElement | undefined

	$effect(() => {
		if (nav_state.open) {
			// Disable root from scrolling
			document.documentElement.style.overflow = 'hidden'
			document.documentElement.style.scrollbarGutter = 'stable'
			document.body.style.overflow = 'hidden'
		} else {
			// Enable root to scroll
			document.documentElement.style.overflow = ''
			document.documentElement.style.scrollbarGutter = ''
			document.body.style.overflow = ''
		}
	})
</script>

<svelte:window
	onkeydown={(e) => {
		if (nav_state.open && e.key === 'Escape') {
			nav_state.open = false
			// We only manage focus when Esc is hit otherwise, the navigation will reset focus.
			tick().then(() => menu_button?.focus())
		}
	}}
/>

{#if title}
	<div class="current-section mobile">
		{title}
	</div>
{/if}

<div class="mobile mobile-menu">
	<FontToggle />

	<ThemeSwitch />

	<button
		bind:this={menu_button}
		aria-label="Toggle menu"
		aria-expanded={nav_state.open}
		class="menu-toggle raised icon"
		class:open={nav_state.open}
		onclick={() => {
			nav_state.open = !nav_state.open

			if (nav_state.open) {
				const segment = page.url.pathname.split('/')[1]
				current = links.find((link) => link.title === segment)
			}
		}}
	>
		<Icon name={nav_state.open ? 'close' : 'menu'} size={24} />
	</button>
</div>

{#if nav_state.open}
	<div class="mobile">
		<MobileMenu {links} {current} onclose={() => (nav_state.open = false)} />
	</div>
{/if}

<style lang="scss">
	.mobile-menu {
		display: flex;
		flex: 1;
		justify-content: end;
		align-items: center;

		gap: calc(var(--padding) * 2);
	}

	button.menu-toggle {
		padding: calc(var(--padding) / 2);
	}

	.current-section {
		color: var(--theme-a);
	}

	.current-section {
		display: flex;
		align-items: center;
		color: inherit;
		margin-left: 0.4em;
	}

	@media (min-width: 832px) {
		.mobile {
			display: none;
		}
	}
</style>
