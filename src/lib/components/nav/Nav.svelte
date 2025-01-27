<!-- @component
Top navigation bar for the application. It provides a slot for the left side, the right side, and the center.
-->

<script lang="ts">
	import type { Route } from '$lib/routes'

	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte'
	import FontToggle from '$lib/components/FontToggle.svelte'
	import HoverMenu from '$lib/components/HoverMenu.svelte'
	import Dropdown from '$lib/components/Dropdown.svelte'
	import { nav_state } from './nav_state.svelte'
	// import Search from '../search/Search.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import MobileMenu from './MobileMenu.svelte'
	import Logo from '../header/Logo.svelte'
	import { page } from '$app/state'
	import { tick } from 'svelte'

	interface Props {
		home_title?: string
		title: string | undefined
		links: Route[]
	}

	let { home_title = 'Homepage', title, links }: Props = $props()

	let visible = $state(true)

	// mobile nav stuff
	let open = $state(false)
	let current = $state.raw<Route | undefined>()
	let menu_button: HTMLButtonElement

	// Prevents navbar to show/hide when clicking in docs sidebar
	let hash_changed = false
	function handle_hashchange() {
		hash_changed = true
	}

	let last_scroll = 0
	function handle_scroll() {
		const scroll = window.scrollY
		if (!hash_changed) {
			visible = scroll === last_scroll ? visible : scroll < 50 || scroll < last_scroll
		}

		last_scroll = scroll
		hash_changed = false
	}

	$effect(() => {
		document.body.style.overflow = open ? 'hidden' : ''
	})
</script>

<svelte:window
	onscroll={handle_scroll}
	onhashchange={handle_hashchange}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') {
			open = false
			// we only manage focus when Esc is hit
			// otherwise, the navigation will reset focus
			tick().then(() => menu_button.focus())
		}
	}}
/>

<nav class:visible style:z-index={nav_state.open ? 80 : null} aria-label="Primary">
	<!-- <a class="home-link" href="/" title={home_title} aria-label="Svelte"></a> -->
	<a class="home-link" href="/" aria-label="Home">
		<Logo
			active={page.url.pathname === '/'}
			--width="3rem"
			--circle="transparent"
			--delay="0s"
		/>
	</a>

	{#if title}
		<div class="current-section mobile">
			{title}
		</div>
	{/if}

	<div class="desktop">
		<div class="links">
			{#each links as link}
				{#if link.sections?.[0].path}
					<Dropdown>
						<a
							href="/{link.path}"
							aria-current={page.url.pathname.startsWith(`/${link.path}`)
								? 'page'
								: undefined}
							class:active={page.url.pathname.startsWith(`/${link.path}`)}
						>
							{link.title}

							<Icon name="chevron-down" />
						</a>

						{#snippet dropdown()}
							<HoverMenu>
								{#each link.sections! as section}
									<a
										class="secondary"
										href={section.path}
										aria-current={page.url.pathname === section.path ||
										page.url.pathname.startsWith(section.path!)
											? 'page'
											: undefined}
									>
										{section.title}
									</a>
								{/each}
							</HoverMenu>
						{/snippet}
					</Dropdown>
				{:else}
					<a
						href="/{link.path}"
						aria-current={page.url.pathname.startsWith(`/${link.path}`) ? 'page' : null}
					>
						{link.title}
					</a>
				{/if}
			{/each}
		</div>

		<div class="menu">
			<!-- <Search /> -->

			<div class="external-links">
				<a
					href="https://bsky.app/profile/braebo.dev"
					data-icon="bluesky"
					aria-label="braebo on Bluesky"
				></a>
				<a
					href="https://github.com/braebo/svelte-starter"
					data-icon="github"
					aria-label="GitHub Repo"
				></a>
			</div>

			<div class="controls">
				<!-- <FontToggle /> -->

				<ThemeSwitch />
			</div>
		</div>
	</div>

	<div class="mobile mobile-menu">
		<FontToggle />

		<ThemeSwitch />

		<button
			bind:this={menu_button}
			aria-label="Toggle menu"
			aria-expanded={open}
			class="menu-toggle raised icon"
			class:open
			onclick={() => {
				open = !open

				if (open) {
					const segment = page.url.pathname.split('/')[1]
					current = links.find((link) => link.title === segment)
				}
			}}
		>
			<Icon name={open ? 'close' : 'menu'} size={16} />
		</button>
	</div>
</nav>

{#if open}
	<div class="mobile">
		<MobileMenu {links} {current} onclose={() => (open = false)} />
	</div>
{/if}

<style lang="scss">
	nav {
		position: fixed;
		display: flex;
		top: 0;
		left: 0;
		right: 0;

		gap: clamp(0rem, 5rem, 1.75vw);
		// font-size: var(--font-sm);

		z-index: 101;

		width: var(--nav-width);
		height: var(--nav-height);
		margin: 0 auto;
		// padding: 0 max(1.5rem, min(2.5rem, 1.75vw));
		padding: 0 clamp(1.5rem, 2.5rem, 1.75vw);

		background-color: var(--bg-a);

		user-select: none;
		isolation: isolate;

		&::after {
			content: '';
			position: absolute;
			left: 0;
			top: -4px;

			width: 100%;
			height: 4px;

			background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
		}

		:root.dark & {
			background-color: var(--bg-c);

			&::after {
				background: linear-gradient(to bottom, rgba(255, 255, 255, 0.05), transparent);
			}
		}
	}

	a {
		display: flex;
		align-items: center;
		justify-content: center;

		height: 100%;

		color: currentColor;

		text-decoration: none;

		transition: color 0.2s;
		pointer-events: all;
	}

	@keyframes fade-in {
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	a:hover {
		text-decoration: none;
	}

	.current-section {
		color: var(--theme-a);
	}

	.current-section {
		display: flex;
		align-items: center;
		color: inherit;
		margin-left: 0.4em;
		// font: var(--font-ui-md);
	}

	@media (max-width: 831px) {
		nav {
			transition: transform 0.2s;
		}

		nav:not(.visible):not(:focus-within) {
			transform: translate(0, calc(var(--nav-height)));
		}
	}

	.links {
		display: flex;
		width: 100%;
		align-items: center;
		gap: min(2rem, 1.75vw);

		opacity: 0;
		transform: translateX(-1rem);
		animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;

		a {
			display: flex;
			align-items: center;
			text-decoration: none;

			height: 100%;

			color: inherit;
			outline-offset: -2px;

			font: var(--font-ui-md);
			// font: var(--font-ui);
			white-space: nowrap;

			&:hover {
				box-shadow: inset 0 -1px 0 0 var(--fg-a);
			}

			&[aria-current='page'] {
				color: var(--fg-a);
				box-shadow: inset 0 -1px 0 0 var(--theme-a);
			}

			&:not(.secondary) {
				padding: 0.1rem 0.8rem 0 0.8rem;
			}

			&.secondary {
				box-shadow: none;
				line-height: 1;
			}
		}
	}

	:global(.menu .controls button.icon) {
		clip-path: inset(50% 0 50% 0);
		// transform: scale(0);
		animation: clip-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards !important;
	}
	:global(.menu .controls button.switch) {
		clip-path: inset(0 50% 0 50%);
		// transform: scale(0);
		animation: clip-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards !important;
	}

	@keyframes clip-in {
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	.menu {
		position: relative;
		display: flex;
		width: 100%;
		gap: 1rem;

		.external-links {
			display: flex;
			height: 100%;
			margin: 0 0.5rem;

			a {
				opacity: 0;
				transform: scale(0);
				animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

				&:nth-of-type(1) {
					animation-delay: 0.4s;
				}

				&:nth-of-type(2) {
					animation-delay: 0.5s;
				}
			}
		}
	}

	.menu {
		// all: unset !important;
		// opacity: 0;
		// transform: scale(0);
		// animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s forwards;
	}

	@keyframes pop-in {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.home-link {
		transform: translateY(2px);
		// width: 6rem;
		margin-right: 1rem;
	}
	// .home-link {
	// 	--padding-right: 1rem;
	// 	width: 3.4rem;
	// 	height: 100%;
	// 	/* background: url(../branding/svelte-logo.svg) no-repeat 0 50% /
	// 		calc(100% - var(--padding-right)) auto; */
	// 	padding: 0 var(--padding-right) 0 calc(var(--padding-inset) + 0rem);
	// }

	.mobile-menu {
		display: flex;
		flex: 1;
		justify-content: end;
		align-items: center;
		gap: 0.5rem; /* TODO tokenize */
	}

	.desktop {
		display: none;
	}

	nav :global(.small) {
		display: block;
	}

	@media (max-width: 831px) {
		nav {
			top: unset;
			bottom: 0;
		}

		.menu {
			position: relative;
			display: none;
			width: 100%;
			background: var(--bg-a);
			padding: 1rem var(--padding-inset);
		}

		nav :global(.large) {
			display: none;
		}
	}

	/* @media (min-width: 480px) {
		.home-link {
			width: 11.2rem;
			background: url(../branding/svelte.svg) no-repeat 0 50% /
				calc(100% - var(--padding-right)) auto;
			padding: 0 var(--padding-right) 0 calc(var(--padding-inset) + 0rem);

			:root.dark & {
				background-image: url(../branding/svelte-dark.svg);
			}
		}
	} */

	@media (min-width: 832px) {
		/* .home-link {
			--padding-right: 2rem;
			width: 13.2rem;
		} */

		nav {
			display: grid;
			grid-template-columns: auto 1fr 1fr;

			&::after {
				top: auto;
				bottom: -4px;
				background: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
			}
		}

		.menu {
			display: flex;
			width: auto;
			height: 100%;
			align-items: center;
		}

		.menu:last-child {
			justify-content: end;
		}

		.mobile {
			display: none;
		}

		.desktop {
			display: contents;

			[data-icon] {
				background: no-repeat 50% 50%;
				background-size: calc(100% - 1rem) auto;
				padding: 0 0.5rem;
				height: 100%;
			}

			[data-icon='bluesky'] {
				width: 3rem;

				background-image: url('$lib/icons/bluesky-dark.svg');

				:global(:root.light) & {
					background-image: url('$lib/icons/bluesky-light.svg');
				}
			}

			[data-icon='github'] {
				width: 3rem;

				background-image: url('$lib/icons/github-dark.svg');

				:global(:root.light) & {
					background-image: url('$lib/icons/github-light.svg');
				}
			}
		}

		nav :global(.small) {
			display: none;
		}
	}
</style>
