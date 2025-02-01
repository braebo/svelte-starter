import { d, o, err } from '../../src/lib/utils/logger/logger-colors'
import { stdout } from 'node:process'

export class Spinner {
	#currentFrame = 0
	#interval = 80
	#running = false
	#timer = null as NodeJS.Timer | null

	constructor(
		private text = '',
		private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
	) {}

	start() {
		if (this.#running) return
		this.#running = true

		// Save cursor position and hide it.
		stdout.write('\x1B[?25l')

		this.#timer = setInterval(() => {
			const frame = this.frames[this.#currentFrame]
			// Clear the current line and move cursor to start.
			stdout.write('\r\x1B[K')
			stdout.write(`${d(frame)} ${this.text}`)
			this.#currentFrame = (this.#currentFrame + 1) % this.frames.length
		}, this.#interval)

		return this
	}

	stop(printErr = false) {
		if (!this.#running) return
		this.#running = false

		if (this.#timer) {
			clearInterval(this.#timer)
			this.#timer = null
		}

		// Clear line and restore cursor.
		stdout.write('\r\x1B[K\x1B[?25h')

		if (printErr) {
			err(this.text)
		}

		return this
	}

	async countdown(ms: number) {
		const progress = Array(30).fill('𝍌')
		const endTime = Date.now() + ms
		let remaining = Math.ceil(ms / 1000)

		return new Promise<void>(resolve => {
			const updateText = () => {
				const now = Date.now()
				const remainingMs = endTime - now

				remaining = Math.ceil(remainingMs / 1000)

				const progressLength = Math.ceil((remainingMs / ms) * 30)
				progress.length = progressLength

				this.setText(` ${o(remaining)} ${d(progress.join(''))}`)

				if (remainingMs <= 0) {
					clearInterval(countdownTimer)
					resolve()
				}
			}

			updateText()
			const countdownTimer = setInterval(updateText, 50)

			setTimeout(() => {
				clearInterval(countdownTimer)
				resolve()
			}, ms)
		})
	}

	setText(text: string) {
		this.text = text
		return this
	}

	setFrames(frames: string[]) {
		this.frames = frames
		return this
	}
}
