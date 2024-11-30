<script lang="ts">
	import Logo from './Header/Logo.svelte'

	const title = 'svelte starter'
	function transition(node: HTMLElement, { i }: { i: number }) {
		node.animate(
			{
				// opacity: 1,
				transform: 'translateY(0)',
			},
			{
				duration: Math.max(1500, 1000 + i * 75),
				// delay: Math.pow(i * 0.05, 0.5 / i) * 100,
				delay: Math.pow(i * 0.05, 0.5 / i) * 100,
				fill: 'forwards',
				// easing: 'cubic-bezier(.54,.08,.15,.88)',
				// easing: 'cubic-bezier(.54,.08,.17,1.18)',
				easing: 'cubic-bezier(.99,-0.29,.07,1.34)',
			},
		)
	}
</script>

<div class="word">
	{#each title as letter, i}
		{@const pct = (100 / title.length) * i}
		<span
			class="letter"
			use:transition={{ i }}
			style:color="color-mix(in srgb, var(--fg-a), var(--fg-c) {pct}%)"
		>
			{#if letter !== ' '}
				{letter}
			{:else}
				<div class="logo">
					<Logo active={false} />
				</div>
			{/if}
		</span>
	{/each}
</div>

<style lang="scss">
	.word {
		display: flex;
		position: relative;

		width: fit-content;
		margin: 0 auto;
		padding: 0 1rem;

		font-size: var(--font-xxxl);
		font-family: var(--font-a);
		font-variation-settings: 'wght' 200;
		text-align: center;
		line-height: 0.75;

		overflow: hidden;
	}

	.letter {
		transform: translateY(3.8rem);
	}

	.logo {
		width: 6rem;
		transform: translate(2.1rem, -0.9rem);
		scale: 1.4;
	}
</style>
