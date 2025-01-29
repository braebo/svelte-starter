<!-- @component
	A gooey instance for debugging state.
	Press `1` to toggle visibility.
-->

<script lang="ts">
	import { nav_state } from '$lib/components/nav/nav_state.svelte'
	import { onDestroy, onMount } from 'svelte'
	import { page } from '$app/state'
	import { DEV } from 'esm-env'

	let gooey: import('gooey').Gooey

	onMount(async () => {
		if (!DEV) return
		const { Gooey } = await import('gooey')
		gooey = new Gooey({ title: 'nav', margin: { x: 16, y: 64 } })

		gooey.elements.wrapper.style.transform = 'scale(2)'
		gooey.hide(true)

		const nav_folder = gooey.addFolder('nav')
		nav_folder.bindMany(nav_state)

		const page_folder = gooey.addFolder('page')
		for (const key in page.data) {
			if (!Array.isArray(page.data[key])) {
				page_folder.bind(page.data, key)
			} else {
				page_folder.addText(JSON.stringify(page.data[key]))
			}
		}
	})

	onDestroy(() => gooey?.dispose())
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === '1') {
			gooey!.toggleHidden()
		}
	}}
/>
