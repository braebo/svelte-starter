// import type { SvelteComponent } from 'svelte'

// import { l, r } from '@braebo/ansi'

// export const prerender = true
// export const ssr = false

// // Glob of all directories in the src/routes/playground/ with vites import.meta.glob
// const playground = import.meta.glob<{ default: () => typeof SvelteComponent }>('/src/routes/playground/**/*.svelte', {
// 	eager: true,
// })

// const pages = Object.keys(playground).map(path => {
// 	const route = path.replace('/src/routes/playground/', '').replace('.svelte', '')

// 	const component = playground[path]
// 	l(r('route'), route)
// 	l(r('component'), component)

// 	return {
// 		path: route,
// 		component,
// 	}
// })

// export const load = () => {
// 	return { pages }
// }
