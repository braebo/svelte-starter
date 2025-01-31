// Glob all of the directories in the src/routes/playground/ with vites import.meta.glob
const playground = import.meta.glob('src/routes/playground/**/*.svelte')

const pages = Object.keys(playground).map((path) => {
	const route = path.replace('src/routes/playground/', '').replace('.svelte', '')
	return {
		path: route,
		component: playground[path],
	}
})

export const load = async () => {
	console.log(pages)
	return { pages }
}
