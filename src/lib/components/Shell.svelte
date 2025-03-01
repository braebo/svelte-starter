<!-- @component
The main shell of the application. It provides a slot for the top navigation, the main content, and the bottom banner.
-->

<script lang="ts">
	import type { Snippet } from 'svelte'

	import PreloadingIndicator from '$lib/components/nav/PreloadingIndicator.svelte'
	import SkipLink from '$lib/components/nav/SkipLink.svelte'
	import ModalOverlay from './ModalOverlay.svelte'
	import { navigating } from '$app/state'
	import Icons from './Icons.svelte'

	let {
		nav_visible = true,
		top_nav,
		children,
	}: {
		nav_visible?: boolean
		top_nav?: Snippet
		children?: Snippet
	} = $props()
</script>

<Icons />

{#if navigating.from}
	<PreloadingIndicator />
{/if}

{#if nav_visible}
	<SkipLink href="#main" />

	{@render top_nav?.()}
{/if}

{@render children?.()}

<div class="br-xl" />

<ModalOverlay />
