<script lang="ts">
	import HomeIcon from '$lib/components/Header/Logo.svelte'
	import { device } from '$lib/utils/device.svelte'
	import ThemeSwitch from '../ThemeSwitch.svelte'
	import { page } from '$app/stores'
	import Nav from './Nav/Nav.svelte'
</script>

<header>
	<div class="home">
		<a href="/">
			<HomeIcon active={$page.url.pathname === '/'} />
		</a>
	</div>

	<Nav />

	<div class="theme">
		{#if !device.mobile}
			<ThemeSwitch />
		{/if}
	</div>
</header>

<style lang="scss">
	header {
		position: relative;

		display: flex;
		justify-content: space-between;
		align-items: center;

		height: 5rem;
		padding: 0 1.5rem;

		z-index: 50;
	}

	.theme {
		position: relative;
		z-index: 30;
	}
</style>
