<script lang="ts">
	import type { Route } from '$lib/router'

	import { page } from '$app/state'
	import { onMount } from 'svelte'

	let { title, contents = [] }: { title: string; contents: Route['children'] } = $props()

	let nav = $state() as HTMLElement

	onMount(() => {
		scrollToActive()
	})

	export async function scrollToActive() {
		const active = nav.querySelector('[aria-current="page"]') as HTMLElement

		if (!active) {
			nav.scrollTop = 0
			return
		}

		const nav_center = nav.offsetHeight / 2
		const child_center = active.offsetHeight / 2
		const offset_top = active.offsetTop
		const scroll_position = offset_top - nav_center + child_center

		const update_scroll = () => (nav.scrollTop = scroll_position)

		requestAnimationFrame(update_scroll)
	}
</script>

<nav bind:this={nav}>
	<h3>{title}</h3>
	<br />
	<br />

	<ul>
		{#each contents as child}
			{#if !child.children?.length}
				<ul>
					<li>
						<a href={child.path} aria-current={child.path === page.url.pathname ? 'page' : undefined}>
							{child.title}
						</a>
					</li>
				</ul>
			{:else}
				<ul>
					{#each child.children ?? [] as { title }}
						<li>
							{#if title}
								<h3>
									{title}
								</h3>
							{/if}

							<ul>
								{#each child.children ?? [] as { path, title }}
									<li>
										<a href={path} aria-current={path === page.url.pathname ? 'page' : undefined}>
											{title}
										</a>
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}
		{/each}
	</ul>
</nav>

<style>
	h3 {
		position: sticky;
		top: 0;
		background-color: var(--bg-b);
		background-color: var(--bg-b);
	}

	nav {
		top: 0;
		margin-bottom: auto;
		overflow-y: auto;
		height: max-content;
	}

	ul {
		display: flex;
		flex-direction: column;
		list-style-type: none;
		margin: 0;
	}

	li {
		display: block;
	}

	a {
		display: flex;
		align-items: center;

		&[aria-current='page'] {
			color: var(--theme-a) !important;
		}
	}
</style>
