import { describe, test, expect, expectTypeOf } from 'vitest'
import { Cli } from './cli'

// Test the type inference
const cli = new Cli({
	banner: 'Foobar',
	description: 'A test instance of CLI running in Bun test.',
	cmd: 'bun test scripts/lib/cli.test.ts',
	examples: ['bun test scripts/lib/cli.test.ts --string "Hello, world!" -b true'],
	args: {
		string: { type: 'string', description: 'some string', default: 'test', short: 's' },
		boolean: { type: 'boolean', description: 'a really cool boolean', default: false, short: 'b' },
		number: { type: 'number', description: 'not a number', default: 5, short: 'n' },
	},
})

cli.run()

const booleanType = cli.config.args.boolean.type // =>
const stringType = cli.config.args.string.type // =>
const numberType = cli.config.args.number.type // =>

describe('cli.config.args.type', () => {
	test('boolean', () => {
		expect(booleanType).toBe('boolean')
	})
	test('string', () => {
		expect(stringType).toBe('string')
	})
	test('number', () => {
		expect(numberType).toBe('number')
	})
	test('should equal typeof', () => {
		expect(typeof cli.values.string).toBe(cli.config.args.string.type)
		expect(typeof cli.values.boolean).toBe(cli.config.args.boolean.type)
		expect(typeof cli.values.number).toBe(cli.config.args.number.type)
	})
})

describe('parsed cli.values', () => {
	test('strings', () => {
		expect(cli.values.string).toBe('test')
		expectTypeOf(cli.values.string).toBeString()
	})
	test('booleans', () => {
		expect(cli.values.boolean).toBe(false)
		expectTypeOf(cli.values.boolean).toBeBoolean()
	})
	test('numbers', () => {
		expect(cli.values.number).toBe(5)
		expectTypeOf(cli.values.number).toBeNumber()
	})
	test('help', () => {
		expect(cli.values.help).toBeUndefined()
	})
})

// TODO:

// These should all show help:
// cli
// cli -h
// cli --help
// cli <command> -h
// cli <command> --help

// These should all show help:
// cli <command> -h
// cli <command> --help
// cli <command> help
// cli <command> help <subcommand>
// cli <command> <subcommand> -h
// cli <command> <subcommand> --help
