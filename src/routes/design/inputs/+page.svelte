<script>
	import Page from '$lib/components/Page.svelte'
	import { router } from '$lib/router'
</script>

<Page title="Inputs">
	<p>Stock HTML input elements with basic styles.</p>

	<p>
		<sub
			>ℹ
			<a href={router.gh('src/styles/inputs.scss')} target="_blank" data-sveltekit-reload>
				inputs.scss
			</a>
		</sub>
	</p>

	<div class="br-lg"></div>

	<section style:gap="1.5rem">
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
</Page>
