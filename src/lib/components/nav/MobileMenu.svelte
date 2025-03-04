<script lang="ts">
	import type { TransitionConfig } from 'svelte/transition'
	import { router, type Route } from '$lib/router'

	import MobileSubMenu from './MobileSubMenu.svelte'
	import { expoOut, quintOut } from 'svelte/easing'
	import { afterNavigate } from '$app/navigation'
	import { trap } from '$lib/actions/trap'
	import { page } from '$app/state'
	import { tick } from 'svelte'
	import { DEV } from 'esm-env'
	import { Tween } from 'svelte/motion'

	interface Props {
		links: Route[]
		current: Route | undefined
		onclose: () => void
	}

	let { links, current, onclose }: Props = $props()

	let depth = $derived((current?.path.split('/')?.length || 0) - 2)

	let show_context_menu = $state(!!current?.children)

	let nav_context_instance: ReturnType<typeof MobileSubMenu> | undefined = $state()

	let universal_menu_inner_height = $state(0)
	let menu_height = $state(0)
	let ready = $state(false)

	let universal_menu: HTMLElement | undefined = $state()

	afterNavigate(onclose)

	$effect(() => {
		// Ensures the menu-background height is applied without an animation.
		setTimeout(() => {
			ready = true
			if (current) {
				show_context_menu = !!current?.children
			}
		})
	})

	function popup(node: HTMLElement, { duration = 400, easing = expoOut } = {}): TransitionConfig {
		const height = current ? node.clientHeight : universal_menu_inner_height

		return {
			css: (t, u) => `transform: translate3d(0, ${(height * u) / 0.9}px, 1px) scale(${0.9 + 0.1 * t})`,
			easing,
			duration,
		}
	}

	let parent = $derived(router.getParent(current?.path))

	let parts = $derived.by(() => {
		const parts = current?.path.split('/').filter(Boolean)

		let path = ''
		let routes = [] as Route[]

		for (const part of parts ?? []) {
			path += '/' + part
			const route = router.get(path)
			if (route) {
				routes.push(route)
			}
		}

		return routes
	})
	// let parts_string = $derived(JSON.stringify($state.snapshot(parts.map(p => p.path)), null, 2))

	let scroll_left = new Tween(0, { duration: 1000, easing: quintOut })
	let viewport: HTMLElement | undefined = $state()
	function scroll(node: HTMLElement, i: number) {
		if (!viewport) return

		if (parts.length > 1) {
			const target = viewport.querySelector(`[data-index="${i}"]`) as HTMLElement
			scroll_left.set(target.offsetLeft)
		}
	}

	$effect(() => {
		scroll_left.current
		if (!viewport) return
		viewport.scrollLeft = scroll_left.current
	})
</script>

<!-- {#if DEV}
	<span class="depth">{depth}</span>
	<div>
		{parent?.title}
	</div>
	<pre style="position:fixed;top:-90vh;left:1rem;z-index:999;isolation:isolate;font-size:1.5rem;">{JSON.stringify($state.snapshot(parts.map(p => p.path)), null, 2)}</pre>
{/if} -->

{#snippet link(link: Route, active: boolean)}
	{@const parent = current?.path.startsWith(link.path)}
	<li class:active class:parent>
		<a href={link.path} class:active={link.path === page.url.pathname || parent}>
			{link.title}
		</a>

		{#if link.children?.length}
			<button
				class="raised icon"
				onclick={async event => {
					event.preventDefault()

					if (current?.path.includes(link.path)) {
						if (parts.length > 1) {
							current = parts.at(-2)
							scroll_left.set(0)
						} else {
							current = undefined
							show_context_menu = false
							scroll_left.set(0)
						}

						return
					}

					current = link

					await tick()

					show_context_menu = true

					await tick()

					nav_context_instance?.scrollToActive()
				}}
				aria-label="Show {link.title} submenu"
			>
				<svg viewBox="0 0 24 24" width="100%" height="100%" overflow="visible">
					<path
						fill="none"
						stroke="currentColor"
						stroke-width="1"
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9.4 6l4.6 4.6q.15.15.213.325t.062.375q0 .2-.063.375t-.212.325L9.4 16.4"
					/>
				</svg>
			</button>
		{/if}
	</li>
{/snippet}

<div class="menu" use:trap={{ reset_focus: false }}>
	<div class="mobile-main-menu" transition:popup={{ duration: 200, easing: quintOut }}>
		<div class="menu-background" class:ready style:height="{menu_height}px"></div>
		<div
			class="clip"
			style:--height-difference="{menu_height - universal_menu_inner_height}px"
			ontransitionstart={e => {
				const target = e.target as HTMLElement

				if (!target?.classList.contains('viewport')) return
				if (e.propertyName !== 'transform') return

				// We need to apply a clip-path during the transition so that the contents
				// are constrained to the menu background, but only while the transition
				// is running, otherwise it prevents the contents from being scrolled.
				const a = 'calc(var(--height-difference) + 1px)'
				const b = '1px'

				const start = show_context_menu ? a : b
				const end = show_context_menu ? b : a

				const container = e.currentTarget

				container.style.clipPath = `polygon(0% ${start}, 100% ${start}, 100% 100%, 0% 100%)`

				setTimeout(() => {
					container.style.clipPath = `polygon(0% ${end}, 100% ${end}, 100% 100%, 0% 100%)`
				}, 0)
			}}
			ontransitionend={e => {
				const target = e.target as HTMLElement

				if (!target?.classList.contains('viewport')) return
				if (e.propertyName !== 'transform') return

				e.currentTarget.style.clipPath = ''

				// Whenever we transition from one menu to the other, we need to move focus to the first item in the new menu.
				if (!show_context_menu) {
					universal_menu?.querySelector('a')?.focus()
				}
			}}
		>
			<div
				class="viewport"
				class:offset={show_context_menu && current?.children?.length}
				bind:clientHeight={menu_height}
				bind:this={viewport}
				onscroll={e => {
					if (parts.length > 1) return
					e.preventDefault()
					e.currentTarget.scrollTo({ left: 0, behavior: 'smooth' })
				}}
			>
				<div class="universal" bind:this={universal_menu}>
					<div class="contents" bind:clientHeight={universal_menu_inner_height} class:current={true}>
						<ul>
							{#each links as l}
								{@render link(l, !!current?.path.includes(l.path))}
							{/each}
						</ul>

						<hr />

						<ul>
							<li>
								<a href="https://bsky.app/profile/braebo.dev">Bluesky</a>
							</li>
							<li>
								<a href="https://github.com/braebo/svelte-starter">GitHub</a>
							</li>
						</ul>
					</div>
				</div>

				{#each parts as part, i (part.path)}
					{#if part}
						<div
							data-index={i}
							data-path={part.path}
							use:scroll={i}
							class="context"
							style="left: {50 + 100 * i}%;"
							inert={!show_context_menu}
							style:height="{universal_menu_inner_height}px"
						>
							<ul class="children">
								{#each part.children ?? [] as child}
									{@render link(
										child,
										current?.path.includes(child.path) || part.path.includes(child.path),
									)}
								{/each}
							</ul>
						</div>
					{/if}
				{/each}

				{#if parts.length === 1}
					<div class="pad"></div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	// .menu {
	// 	outline: 1px solid hsla(0, 100%, 50%, 25%);
	// }
	// .viewport {
	// 	outline: 1px solid hsla(300, 47%, 75%, 25%);
	// 	outline-offset: -1px;
	// }
	// .universal {
	// 	outline: 1px solid hsla(240, 100%, 50%, 25%);
	// 	outline-offset: -2px;
	// }
	// .contents {
	// 	outline: 1px solid hsla(39, 100%, 50%, 25%);
	// 	outline-offset: -3px;
	// }
	// .context {
	// 	outline: 1px solid hsla(120, 100%, 25%, 25%);
	// 	outline-offset: -4px;
	// }

	.menu {
		// display: block;
		position: fixed;
		left: 0px;
		bottom: var(--bottom, var(--nav-height));

		width: 100%;
		// height: 70vh;

		border-radius: 1rem 1rem 0 0;
		// background: var(--background, var(--bg-b));

		filter: var(--shadow);
		transform: translate3d(0, 0, 0);

		overflow-y: hidden;
		overflow-x: hidden;
		pointer-events: none;
		z-index: 100;
	}

	.menu-background {
		position: absolute;
		left: 0;
		bottom: 0;

		width: 100%;
		height: 99.5%;

		border-radius: 1rem 1rem 0 0;
		background: var(--background, var(--bg-b));
		will-change: height;

		transition: 0.3s var(--quint-out);
		transition-property: none;

		&.ready {
			transition-property: height;
		}

		:root.dark & {
			border-top: solid 1px var(--bg-c);
		}
	}

	.mobile-main-menu {
		contain: layout paint;

		height: 100%;

		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.clip {
		width: 100%;
		height: 100%;

		transition: clip-path 0.3s cubic-bezier(0.23, 1, 0.32, 1);
		will-change: clip-path;
	}

	.viewport {
		position: relative;
		bottom: -1px;

		// display: grid;
		// grid-template-columns: 50% 50%;
		// grid-auto-rows: 100%;
		// grid-auto-columns: 50%;
		// grid-auto-flow: column;
		display: flex;

		width: 200%;
		// max-width: 200%;
		height: 100%;

		transition: 0.3s cubic-bezier(0.23, 1, 0.32, 1);

		// DELETEME
		overflow-x: scroll;
		scroll-snap-type: x mandatory;

		&.offset {
			width: 100%;
		}

		// & > * {
		// 	overflow-y: auto;
		// 	transition: inherit;
		// 	transition-property: transform, opacity;
		// }
	}

	.pad {
		min-width: 50%;
	}

	li .icon :global(svg) {
		transform-origin: center;
		transform: scale(0.75) translate(0, 0);
		transition: 1s cubic-bezier(0.23, 1, 0.32, 1);
	}

	li.active {
		a {
			outline-color: color-mix(in oklab, var(--bg-c), var(--bg-d) 50%) !important;
			background: color-mix(in oklab, var(--bg-b), var(--bg-c) 33%);
		}

		button {
			background: color-mix(in oklab, var(--bg-b), var(--bg-c) 66%);
			transform: scaleX(0.8) scaleY(0.6) translate(0.3rem, 0);
			&:hover {
				background: color-mix(in oklab, var(--bg-b), var(--bg-c) 90%);
			}
		}

		&:has(button) {
			a {
				outline-color: transparent !important;
				background: transparent;
			}
		}

		.icon svg {
			color: color-mix(in oklab, var(--bg-c), var(--bg-d) 66%);
			transform: scale(1, 1.2) translate(0.4rem, 0.2rem);
		}
		.icon {
			outline-color: transparent;

			--depth: 68%;
			--padding: 5%;

			// prettier-ignore
			clip-path: polygon(
				55% -5%,
				-5% -5%,
				-5% var(--padding),
				calc(100% - var(--depth)) 50%,
				-5% calc(105% - var(--padding)),
				-5% 105%,
				55% 105%,
				105% 50%
			);
			// clip-path: polygon(
			// 	45% -5%,
			// 	105% -5%,
			// 	105% var(--padding),
			// 	var(--depth) 50%,
			// 	105% calc(105% - var(--padding)),
			// 	105% 105%,
			// 	45% 105%,
			// 	-10% 50%
			// );
		}
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
	}

	li a {
		padding: 1rem 2rem;

		color: inherit;
		box-shadow: none;
		border-radius: var(--radius);
		outline: 1px solid var(--bg-c) !important;

		font: var(--font-ui-md);
	}

	li a:hover {
		background: color-mix(in oklab, var(--bg-b), var(--bg-c) 90%);
	}

	li.active:has(button) a {
		max-width: calc(100% - 2rem);
		margin-right: 2rem;
		background: color-mix(in oklab, var(--bg-b), var(--bg-c) 50%);
	}

	li:has(button):not(.active) a {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	li a.active,
	li.active a:active {
		color: var(--theme-a);
		background: color-mix(in oklab, var(--bg-b), var(--bg-c) 50%);
	}

	:root.light {
		li a.active,
		li.active a:active {
			background: color-mix(in oklab, var(--bg-d), var(--fg-d) 50%);
		}
	}

	.universal,
	.contents,
	.context {
		// position: absolute;
		// bottom: 0;

		// width: 50%;
		min-width: 50%;
		height: fit-content;
		max-height: 70vh;
		padding: 1rem;

		overflow-y: scroll;
	}

	button {
		padding: 0;
		width: 4rem;
		outline: 1px solid var(--bg-c);

		border-top-left-radius: 0;
		border-bottom-left-radius: 0;

		&:hover {
			background-color: var(--bg-c);
		}
	}

	.context {
		right: 0;

		// padding-bottom: 2rem;

		background-color: var(--bg-b);
		border-radius: 1rem 1rem 0 0;
	}

	.universal .contents,
	.context,
	.menu-background {
		pointer-events: all;
	}

	.universal,
	.context {
		ul {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		li {
			display: flex;
			margin-left: 0;

			a {
				flex: 1;
			}
		}
	}

	hr {
		margin: 0.5rem 0;
		height: 2rem;
		border: none;
	}

	.parent {
		a {
			color: red;
		}
	}
</style>
