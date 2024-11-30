<script lang="ts">
	import Header from '$lib/components/Header/Header.svelte'
	import PageTitle from '$lib/components/PageTitle.svelte'
	import '../styles/app.scss'

	let { children } = $props()
</script>

<PageTitle />

<Header />

<br-md />

{@render children?.()}
