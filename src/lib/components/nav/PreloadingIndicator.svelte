<script lang="ts">
	import { quadInOut } from 'svelte/easing'
	import { Tween } from 'svelte/motion'
	import { onMount } from 'svelte'

	const p = new Tween(0, {
		easing: quadInOut,
	})

	let visible = $state(false)

	onMount(() => {
		let timeout: any

		function next() {
			visible = true

			const remaining = 1 - p.current

			p.set(p.current + 0.1, {
				duration: remaining + 0.1 > 0.15 ? 250 : 500 / remaining,
			})

			if (remaining > 0.15) {
				timeout = setTimeout(next, 500 / remaining)
			}
		}

		timeout = setTimeout(next, 250)

		return () => clearTimeout(timeout)
	})
</script>

{#if visible}
	<div class="progress-container">
		<div class="progress" style="width: {p.current * 100}%"></div>
	</div>
{/if}

{#if p.current >= 0.4}
	<div class="fade"></div>
{/if}

<style>
	.progress-container {
		position: absolute;
		top: 0;
		left: 0;

		width: 100%;
		max-height: 4px;

		z-index: 999;
	}

	.progress {
		position: absolute;
		left: 0;
		top: 0;

		height: 100%;

		background-color: var(--fg-accent);
		transition: width 0.4s;
	}

	.fade {
		position: fixed;

		width: 100%;
		height: 100%;

		background-color: rgba(255, 255, 255, 0.3);
		animation: fade 0.4s;

		pointer-events: none;
		z-index: 998;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
