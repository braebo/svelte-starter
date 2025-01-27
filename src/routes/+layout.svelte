<script lang="ts">
	// import NavMobile from '$lib/components/header/navs/NavMobile.svelte'
	// import Header from '$lib/components/header/Header.svelte'
	import PageTitle from '$lib/components/PageTitle.svelte'
	// import { device } from '$lib/utils/device.svelte'
	import Nav from '$lib/components/nav/Nav.svelte'
	import '../styles/app.scss'

	let { data, children } = $props()
</script>

<PageTitle />

<!-- <Header /> -->

<br-md />

{@render children?.()}

<!-- {#if device.mobile}
	<NavMobile />
{/if} -->

<Nav home_title="home" title={data.title} links={data.routes} />
