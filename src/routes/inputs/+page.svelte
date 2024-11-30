<script>
	import { IN, OUT } from '$lib/utils/transitions'
	import { fade, fly } from 'svelte/transition'
</script>

<div class="br-md" />

<div class="page flex">
	<section
		style:gap="1.5rem"
		in:fly|global={{ ...IN, y: 7.5, duration: 300, delay: 150 }}
		out:fade|global={OUT}
	>
		<label>
			<div>text</div>
			<input type="text" placeholder="foo" />
		</label>

		<label>
			<div>textarea</div>
			<textarea placeholder="lorem ipsum dolor sit amet"></textarea>
		</label>

		<label>
			<div>number</div>
			<input type="number" placeholder="123" />
		</label>

		<label>
			<div>range</div>
			<input type="range" />
		</label>

		<label>
			<div>checkbox</div>
			<input type="checkbox" checked />
		</label>

		<label>
			<div>radio</div>
			<input type="radio" />
		</label>

		<label>
			<div>select</div>
			<select>
				<option>foo</option>
				<option>bar</option>
			</select>
		</label>
	</section>
</div>

<style lang="scss">
	section {
		width: 25rem;
	}
</style>
