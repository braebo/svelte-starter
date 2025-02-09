#!/usr/bin/env bun

/**
 * @fileoverview
 * @build bun build ./scripts/choose.ts --compile --minify --outfile choose && chmod +x choose
 * @run echo "a b c" | ./choose 2
 * > b
 */

/// <reference types="bun-types" />

import { Cli } from './lib/cli'

const cli = new Cli({
	banner: 'choose',
	description: 'field selector',
	cmd: 'choose [options] field...',
	examples: [
		'echo "a b c" | choose 2',
		'ls -l | choose 9',
		'echo "1,2,3" | choose -f "," 1 3',
	],
	args: {
		'field-separator': {
			type: 'string',
			short: 'f',
			default: ' ',
			description: 'Field separator',
		},
		help: {
			type: 'boolean',
			short: 'h',
			description: 'Print this message',
		},
	},
})

const fields = cli.positionals.map(arg => {
	const field = parseInt(arg)
	if (isNaN(field)) {
		cli.error(`Invalid field number: ${arg}`)
	}
	return field - 1 // Convert to 0-based index
})

if (fields.length === 0) {
	cli.error('No fields specified')
}

// Process stdin
const chunks: Uint8Array[] = []
for await (const chunk of Bun.stdin.stream()) {
	chunks.push(chunk)
}
const input = Buffer.concat(chunks).toString('utf-8')

const separator = new RegExp(cli.values['field-separator'])

input
	.split('\n')
	.filter(line => line.trim())
	.forEach(line => {
		const parts = line.split(separator)
		const selected = fields.map(f => parts[f] || '').filter(Boolean)
		if (selected.length > 0) {
			console.log(selected.join(' '))
		}
	})
