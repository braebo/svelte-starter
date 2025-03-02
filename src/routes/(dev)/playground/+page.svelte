<script lang="ts">
	import Page from '$lib/components/Page.svelte'
	import { router } from '$lib/router'
</script>

<Page title="Playground">
	<div class="playground">
		{#each router.current.children ?? [] as child}
			<div>
				<h2>{child.path}</h2>
			</div>
		{/each}
	</div>
</Page>

<style lang="scss">
	.playground {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}
</style>
