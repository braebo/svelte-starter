import type { ExtractPaths, Route } from './router.types'
import type { page as Page } from '$app/state'

import { describe, expect, test } from 'vitest'
import { Router } from './router.svelte'

const routes = [
	{ path: '/', title: 'Home' },
	{
		path: '/foo',
		title: 'Foo',
		children: [
			{ path: '/foo/bar', title: 'Bar' },
			{ path: '/foo/baz', title: 'Baz' },
		],
	},
] as const satisfies Route[]

const router = new Router(routes)

const mock_page = <T extends string>(path: T) =>
	({ url: { pathname: path } }) as typeof Page & {
		url: { pathname: T }
	}

describe('router', () => {
	const page = mock_page('/foo')

	test('ExtractPaths inference', () => {
		type AllPaths = ExtractPaths<typeof routes>
		const path: AllPaths = '/'
		expect(path).toBe('/')
	})

	test('router.get()', () => {
		const route = router.get('/foo/bar')
		expect(route.path).toBe('/foo/bar')
		expect(route.title).toBe('Bar')
	})

	test('router.isActive()', () => {
		const isActive = router.isActive('/foo', page)
		expect(isActive).toBe(true)

		const isntActive = router.isActive('/foo/bar', page)
		expect(isntActive, 'Child path is active, but parent is not.').toBe(false)
	})

	test('router.childActive()', () => {
		const page = mock_page('/foo/bar')
		const hasActiveChild = router.childActive('/foo', page)
		expect(hasActiveChild, `'/foo' is not a child of ${page.url.pathname}`).toBe(true)
	})

	test('router.parentActive()', () => {
		const hasActiveParent = router.parentActive('/foo/baz', page)
		expect(hasActiveParent, `'/foo/baz' is not a parent of ${page.url.pathname}`).toBe(true)
	})

	test('router.children()', () => {
		const children = router.get('/foo').children
		expect(children).toHaveLength(2)
		expect(children[0].path).toBe('/foo/bar')
		expect(children[1].path).toBe('/foo/baz')
	})

	test('router.get()', () => {
		const homeRoute = router.get('/')
		expect(homeRoute.path).toBe('/')
		expect(homeRoute.title).toBe('Home')
	})

	test('router.gh()', () => {
		const githubUrl = router.gh('src/styles/inputs.scss')
		expect(githubUrl).toBe(
			'https://github.com/braebo/svelte-starter/tree/main/src/styles/inputs.scss',
		)
	})

	test('router.get()', () => {
		const inputsRoute = router.get('/foo/bar')
		expect(inputsRoute.path).toBe('/foo/bar')
		expect(inputsRoute.title).toBe('Bar')
	})
})
