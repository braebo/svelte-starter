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
		Svelte Starter comes with sane defaults for vanilla HTML elements with a minimal CSS reset.
	</p>

	<div class="br-md" />
	<h3>Tokens & Utilities</h3>

	<p>
		A typical workflow usually involves the composition of utility classes from the various
		design tokens available, like the theme colors, font definitions, and spacing scale.
	</p>

	<div class="br-md" />

	<h4>Stats</h4>

	<ul>
		<li>
			Vitality - <b>24</b>
		</li>
		<li>
			Vigor - <b>17</b>
		</li>
		<li>
			Capacity - <b>28</b>
		</li>
		<li>
			Motivity - <b>16</b>
		</li>
		<li>
			Technique - <b>40</b>
		</li>
		<li>
			Advance - <b>23</b>
		</li>
	</ul>
	<br />

	<h3>Elements</h3>

	<p>The most common HTML elements as they are styled by default, with a minimal CSS reset.</p>

	<Elements />

	<h2>Inputs</h2>

	<p>Styled inputs with a minimal CSS reset.</p>

	<Inputs />
</section>

<style lang="scss">
	p {
		margin-left: 1rem;
	}
</style>
