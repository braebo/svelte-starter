<script lang="ts">
	let { children, showMenu = $bindable(false) } = $props()
</script>

<div class="fakeout" class:showMenu />

<div
	class="page-fill"
	class:showMenu
	onclick={() => (showMenu = false)}
	onkeydown={(e) => {
		if (e.key === 'Escape') showMenu = false
	}}
>
	{@render children?.()}
</div>

<style>
	.page-fill,
	.fakeout {
		position: fixed;
		bottom: 0;
		max-height: 0vh;
		height: 100vh;
		width: 100vw;

		background-color: var(--bg-b);

		overflow: hidden;
		clip-path: inset(100% 0 0 0);

		transition: 0.6s cubic-bezier(0.76, -0.2, 0, 1.08) 0.2s;
		z-index: 100;
	}

	.fakeout {
		background-color: var(--bg-c);
		transition: 0.6s cubic-bezier(0.76, -0.2, 0, 1.08) 0s;
		z-index: 99;
	}

	.showMenu {
		clip-path: inset(0 0 0 0);
		max-height: 100vh;
		/* transition:
			max-height 0.5s cubic-bezier(.76,-0.2,0,1.08),
			opacity 0.5s ease; */
	}
</style>
