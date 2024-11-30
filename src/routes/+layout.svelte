<script lang="ts">
	import Header from '$lib/components/Header/Header.svelte'
	import PageTitle from '$lib/components/PageTitle.svelte'
	import { onMount } from 'svelte'
	import '../styles/app.scss'

	onMount(() => {})
</script>

<PageTitle />

<Header />

<br-md />

<slot />
