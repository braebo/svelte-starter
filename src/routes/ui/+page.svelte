<script lang="ts">
	import Elements from './elements/+page.svelte'
	import Inputs from './inputs/+page.svelte'
</script>

<section class="page">
	<div class="br-md"></div>
	<h1>UI</h1>

	<div class="br-md"></div>

	<h2>HTML</h2>

	<p>
		Svelte Starter uses a minimal css reset, and somewhat opinionated default styles for vanilla
		HTML elements. <a href="/ui/elements">See all elements.</a>
	</p>

	<div class="br-md"></div>

	<h3>Tokens & Utilities</h3>

	<p>
		A typical workflow usually involves the composition of utility classes from the various
		design tokens available, like the theme colors, font definitions, and spacing scale.
	</p>

	<div class="br-md"></div>

	<br />

	<details>
		<summary>All Elements</summary>
		<div class="br-md"></div>
		<Elements />
	</details>

	<h2>Inputs</h2>

	<p>Styled inputs with a minimal CSS reset.</p>

	<Inputs />
</section>

<style lang="scss">
	p {
		margin-left: 1rem;
	}

	@supports (interpolate-size: allow-keywords) {
		:root {
			interpolate-size: allow-keywords;
		}

		details {
			max-height: 2.4rem;
			overflow: hidden;
			transition: 3s;
		}

		details[open] {
			max-height: 100%;
		}
	}
</style>
