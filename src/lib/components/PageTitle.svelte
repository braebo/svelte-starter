<script lang="ts">
	import { page } from '$app/stores'

	$: pageTitle = () => {
		// Use status code if there's an error
		if ($page.error) return $page.status

		if ($page.url.pathname === '/') return 'Home'

		const title = $page.url.pathname.split('/')[1]
		const capilized = title.charAt(0).toUpperCase() + title.slice(1)

		return String(capilized) || ''
	}
</script>

<svelte:head>
	<title>svelte-starter · {pageTitle()}</title>
</svelte:head>
