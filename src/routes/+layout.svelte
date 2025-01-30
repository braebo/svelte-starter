<script lang="ts">
	import { setupViewTransition } from 'sveltekit-view-transition'
	import Shell from '$lib/components/Shell.svelte'
	import Nav from '$lib/components/nav/Nav.svelte'
	import Gooey from '$lib/components/Gooey.svelte'
	import { BROWSER, DEV } from 'esm-env'
	import '../styles/app.scss'

	setupViewTransition()

	let { data, children: layout_children } = $props()
</script>

<Shell>
	{#snippet top_nav()}
		<Nav home_title="home" title={data.title} links={data.routes} />
		<div class="br-lg" />
	{/snippet}

	{#snippet children()}
		{@render layout_children()}
	{/snippet}
</Shell>

{#if DEV && BROWSER}
	<Gooey />
{/if}
