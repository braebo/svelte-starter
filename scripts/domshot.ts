/// <reference types="bun-types" />

import { l, o, g, d, em, bd, r } from '../src/lib/utils/logger/logger-colors'
import { chromium, type Browser } from '@playwright/test'
import { parseArgs, type ParseArgsConfig } from 'util'
import { Spinner } from './utils/spinner'
import { resolve } from 'path'

const args = {
	url: {
		type: 'string',
		default: 'localhost:5173',
		short: 'u',
	},
	node: {
		type: 'string',
		default: '.domshot',
		short: 'n',
	},
	out: {
		type: 'string',
		default: 'domshot.png',
		short: 'o',
	},
	headless: {
		type: 'boolean',
		default: true,
		short: 'h',
	},
	delay: {
		type: 'string',
		default: '1000',
		short: 'd',
	},
	scale: {
		type: 'string',
		default: '1',
		short: 's',
	},
	viewport: {
		type: 'string',
		default: '1280x720',
		short: 'v',
	},
	help: {
		type: 'boolean',
		default: false,
		short: 'h',
	},
} as const satisfies ParseArgsConfig['options']

// Show help by default if no arguments are provided
if (Bun.argv.length <= 2) {
	printHelp()
} else {
	await takeScreenshot()
}

async function takeScreenshot() {
	let browser: Browser | null = null
	let spinner: Spinner | null = null

	try {
		const { values } = parseArgs({
			args: Bun.argv,
			options: args,
			strict: true,
			allowPositionals: true,
		})

		if (values.help) {
			printHelp()
			return
		}

		const { url, node, out, headless, delay, scale, viewport } = values
		const waitTime = parseInt(delay)
		const scaleValue = parseFloat(scale)
		const [viewportWidth, viewportHeight] = viewport.split('x').map(Number)

		start(values)

		spinner = new Spinner('Spawning browser...')
		spinner.start()

		browser = await chromium.launch({ headless })
		const page = await browser.newPage()
		await page.setViewportSize({ width: viewportWidth, height: viewportHeight })

		spinner.setText(em(` Loading page...`))
		await page.goto(url, { waitUntil: 'networkidle' })

		await spinner.countdown(waitTime)

		spinner.setText(d(' 📸'))

		// We need to make the body transparent
		await page.evaluate(() => {
			document.body.style.backgroundColor = 'transparent'
		})

		const element = page.locator(node).first()

		// Apply scaling via CSS transform if scale is not 1
		if (scaleValue !== 1) {
			await element.evaluate((el, scale) => {
				const originalTransform = getComputedStyle(el).transform
				const newTransform =
					originalTransform === 'none'
						? `scale(${scale})`
						: `${originalTransform} scale(${scale})`
				el.style.transform = newTransform
			}, scaleValue)
		}

		await element.screenshot({
			path: out,
			omitBackground: true, // This preserves transparency
		})

		spinner.stop()

		l('📸', g('✔'), d(`${resolve(out)}`))
		console.log(d('⌞'))
	} catch (error) {
		spinner?.stop(true)
		await browser?.close()

		if (error.code === 'ERR_PARSE_ARGS_UNKNOWN_OPTION') {
			const optionRegex = /'(-{1,2}[a-zA-Z][a-zA-Z0-9-]*)'/
			const option = error.message.match(optionRegex)?.[1]
			if (!option) throw error

			l()
			l(r('ERROR'), `${d('Unknown option: ')}${option}`)
			l()
			printOptions()
		} else {
			throw error
		}
	}

	await browser?.close()
}

function intro() {
	console.log(d('⌜'))
	l(bd('domshot 📸'))
}

function start(values: Record<string, any>) {
	intro()
	l()
	const kv = (k: string, v: string) => l(`${d(k)} ${o(v)}`)
	kv('--node', `     ${values.node}`)
	kv('--headless', ` ${values.headless}`)
	kv('--delay', `    ${(values.delay / 1000).toFixed(1)}s`)
	kv('--out', `      ${values.out}`)
	kv('--scale', `    ${values.scale}`)
	kv('--viewport', ` ${values.viewport}`)
	l()
}

// prettier-ignore
function printOptions() {
	l('Options')
	l(em(d(`  flag           description          ${d('default')}`)))
	l()
	l(`  ${o('--delay', d(`    -${args.delay.short}`))}  Delay timer (ms)     ${d(args.delay.default)}`)
	l(`  ${o('--headless', d(` -${args.headless.short}`))}  Headless mode        ${d(args.headless.default)}`)
	l(`  ${o('--node', d(`     -${args.node.short}`))}  Target CSS selector  ${d(args.node.default)}`)
	l(`  ${o('--out', d(`      -${args.out.short}`))}  Output filename      ${d(args.out.default)}`)
	l(`  ${o('--scale', d(`    -${args.scale.short}`))}  Scale factor         ${d(args.scale.default)}`)
	l(`  ${o('--url', d(`      -${args.url.short}`))}  Destination URL      ${d(args.url.default)}`)
	l(`  ${o('--viewport', d(` -${args.viewport.short}`))}  Viewport size        ${d(args.viewport.default)}`)
	l(`  ${o('--help         ')}${`Print this message`}`)
	l()
}

// prettier-ignore
function printHelp() {
	intro()
	l(em(d('  Screenshot DOM nodes with transparency.')))
	l()
	l('Usage')
	l(`  ${d('bun scripts/domshot.ts [options]')}`)
	l()
	printOptions()
	l()
	l('Example')
	l(`  ${d(`bun scripts/domshot.ts`)} ${o('--node')} ${d(`".hero"`)} ${o('--out')} ${d(`hero.png`)}`)
	l()
    console.log(d('⌞'))
}
