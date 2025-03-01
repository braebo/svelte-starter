<!--@component
use an svg icon that was provided through `Icons.svelte` from
- https://github.com/jacobmischka/svelte-feather-icon
- https://feathericons.com/
-->
<script lang="ts">
	let {
		name,
		size = 20,
		stroke_width = 1.5,
	}: {
		name: string
		size?: string | number
		stroke_width?: string | number
	} = $props()
</script>

<svg width={size} height={size} stroke-width={stroke_width} style:--stroke-width={stroke_width}>
	<use xlink:href="#{name}" />
</svg>

<style>
	svg {
		position: relative;

		vertical-align: middle;
		-o-object-fit: contain;
		object-fit: contain;

		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: var(--stroke-width);

		-webkit-transform-origin: center center;
		transform-origin: center center;

		overflow: hidden;
	}
</style>
