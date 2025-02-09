/// <reference types="bun-types" />

import { l, g, d, err } from '../src/lib/utils/logger/logger-colors'
import { chromium, type Browser } from '@playwright/test'
import { Spinner } from './lib/spinner'
import { Cli } from './lib/cli'
import { resolve } from 'path'

const cli = new Cli({
	banner: [
		' ____   __   _  _  ____  _  _   __  ____ ',
		'(    \\ /  \\ ( \\/ )/ ___)/ )( \\ /  \\(_  _)',
		' ) D ((  O )/ \\/ \\\\___ \\) __ ((  O ) )(  ',
		'(____/ \\__/ \\_)(_/(____/\\_)(_/ \\__/ (__)',
	].join('\n'),
	// banner: 'DOMshot',
	description: '📸 Screenshot DOM nodes with transparency',
	cmd: 'domshot',
	examples: ['domshot .hero -o hero.png', 'domshot .hero --url http://localhost:5174 --out hero.png'],
	positionals: [],
	args: {
		query: {
			short: '-q',
			description: "Target node's CSS query selector",
			default: '.domshot',
			required: true,
		},
		url: {
			type: 'string',
			default: 'localhost:5173',
			short: 'u',
			description: 'Destination URL',
		},
		out: {
			type: 'string',
			default: 'domshot.png',
			short: 'o',
			description: 'Output filename',
		},
		headless: {
			type: 'boolean',
			default: true,
			short: 'h',
			description: 'Headless mode',
		},
		delay: {
			type: 'number',
			default: 1000,
			short: 'd',
			description: 'Delay timer (ms)',
		},
		scale: {
			type: 'number',
			default: 1,
			short: 's',
			description: 'Scale factor',
		},
		viewport: {
			type: 'string',
			default: '1280x720',
			short: 'v',
			description: 'Viewport size',
		},
	},
})

try {
	cli.run(async (values, positionals) => {
		const [selector] = positionals
		await takeScreenshot({ ...values, node: selector })
	})
} catch (e) {
	err(e)
}

// async function takeScreenshot(values: Record<string, any>) {
async function takeScreenshot(values: typeof cli.values) {
	let browser: Browser | null = null
	let spinner: Spinner | null = null

	try {
		const waitTime = values.delay
		const scaleValue = values.scale
		const [viewportWidth, viewportHeight] = values.viewport.split('x').map(Number)

		spinner = new Spinner('Spawning browser...')
		spinner.start()

		browser = await chromium.launch({ headless: values.headless })
		const page = await browser.newPage()
		await page.setViewportSize({ width: viewportWidth, height: viewportHeight })

		spinner.setText(' Loading page...')
		await page.goto(values.url, { waitUntil: 'networkidle' })

		await spinner.countdown(waitTime)

		spinner.setText(' 📸')

		// We need to make the body transparent
		await page.evaluate(() => {
			document.body.style.backgroundColor = 'transparent'
		})

		const element = page.locator(values.node).first()

		// Apply scaling via CSS transform if scale is not 1
		if (scaleValue !== 1) {
			await element.evaluate((el, scale) => {
				const originalTransform = getComputedStyle(el).transform
				const newTransform =
					originalTransform === 'none' ? `scale(${scale})` : `${originalTransform} scale(${scale})`
				el.style.transform = newTransform
			}, scaleValue)
		}

		await element.screenshot({
			path: values.out,
			omitBackground: true,
			animations: values.animations,
		})

		spinner.stop()

		l('📸', g('✔'), d(`${resolve(values.out)}`))
		console.log(d('⌞'))
	} catch (error) {
		spinner?.stop(true)
		await browser?.close()
		throw error
	}

	await browser?.close()
}
