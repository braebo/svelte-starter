<script>
	import { IN, OUT } from '$lib/utils/transitions'
	import { fade, fly } from 'svelte/transition'
	import Inputs from '../inputs/+page.svelte'
</script>

<div class="page">
	<h1 class="page-title">Elements</h1>

	<div class="br-xs"></div>

	<p>The most common HTML elements as they are styled by default, with a minimal CSS reset.</p>

	<section in:fly|global={{ ...IN, y: 7.5, duration: 300 }} out:fade|global={OUT}>
		<button>Button</button>

		<code>code</code>

		<!-- shiki-start
```ts
function syntaxHighlighting(): true {
	return true
}

console.log('some really long string that would usually cause a horizontal scroll when it overflows on the x axis because reasons');
```
		shiki-end -->
	</section>

	<section
		style:gap="1.5rem"
		in:fly|global={{ ...IN, y: 7.5, duration: 300, delay: 150 }}
		out:fade|global={OUT}
	>
		<!-- prettier-ignore -->
		<p>
			<!-- svelte-ignore a11y_invalid_attribute -->
			Paragraph canary danced beneath <a href="">azure skies</a>, while marble fountains sparkled with untold mysteries. Velvet shadows crept along ancient walls, whispering secrets to passing travelers who dared not linger.
		</p>

		<!-- svelte-ignore a11y_invalid_attribute -->
		<!-- prettier-ignore -->
		<blockquote> Blockquote golden leaves tumbled through forgotten courtyards, each one carrying <a href="">fragments of memories</a> long since scattered to the winds.</blockquote>

		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="">
			https://some.really-long-link-that-would-normally-cause-horizontal-overflow-but-it-wraps-instead
		</a>
	</section>

	<h1>Heading 1</h1>
	<h2>Heading 2</h2>
	<h3>Heading 3</h3>
	<h4>Heading 4</h4>
	<h5>Heading 5</h5>
	<h6>Heading 6</h6>

	<strong>bold</strong>

	<em>italic</em>

	<s>strikethrough</s>

	<small>small</small>

	<mark>mark</mark>

	<span>
		super
		<sup>script</sup>
	</span>

	<span>
		sub
		<sub>script</sub>
	</span>

	<ul>
		<li>
			list
			<ul>
				<li>
					list
					<ul>
						<li>list</li>
					</ul>
				</li>
				<li>
					list
					<ol>
						<li>list</li>
						<li>list</li>
					</ol>
				</li>
			</ul>
		</li>
	</ul>

	<Inputs />
</div>

<div class="br-lg" />

<style lang="scss">
	.page {
		display: flex;
		flex-direction: column;
		flex-wrap: wrap;
		gap: var(--gap);

		width: 100%;
		height: auto;
		margin: 0 auto;
	}
</style>
