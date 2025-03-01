<script lang="ts">
	import { nav_state } from './nav/nav_state.svelte'
	import { onNavigate } from '$app/navigation'
	import { fade } from 'svelte/transition'

	function close() {
		nav_state.open = false
	}

	onNavigate(close)
</script>

{#if nav_state.open}
	<div transition:fade={{ duration: 100 }} class="modal-overlay" aria-hidden="true" onclick={close}></div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;

		width: 100%;
		height: 100%;
		height: 100dvh;

		opacity: 0.7;
		background: var(--bg-a);

		z-index: 50;
		contain: layout paint;
	}
</style>
