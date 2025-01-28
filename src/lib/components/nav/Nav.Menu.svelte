<!-- @component
    Menu section (right side) of the navigation bar containing external links and theme controls.
-->

<script lang="ts">
	import ThemeSwitch from '$lib/components/ThemeSwitch.svelte'
</script>

<div class="menu">
	<!-- <Search /> -->
	<div class="external-links">
		<a
			href="https://bsky.app/profile/braebo.dev"
			data-icon="bluesky"
			aria-label="braebo on Bluesky"
		></a>
		<a
			href="https://github.com/braebo/svelte-starter"
			data-icon="github"
			aria-label="GitHub Repo"
		></a>
	</div>

	<div class="controls">
		<ThemeSwitch />
	</div>
</div>

<style lang="scss">
	.menu {
		position: relative;
		display: flex;
		width: 100%;
		gap: 1.5rem;

		.external-links {
			display: flex;
			height: 100%;
			gap: 1rem;

			a {
				opacity: 0;
				transform: scale(0);
				animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;

				&:nth-of-type(1) {
					animation-delay: 0.4s;
				}

				&:nth-of-type(2) {
					animation-delay: 0.5s;
				}
			}
		}
	}

	@keyframes pop-in {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.menu .controls) {
		clip-path: inset(0 50% 0 50%);
		animation: clip-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.8s forwards !important;
	}

	@keyframes clip-in {
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	.controls {
		display: flex;
	}

	@media (max-width: 831px) {
		.menu {
			position: relative;
			display: none;
			width: 100%;
			background: var(--bg-a);
			padding: 1rem var(--padding-inset);
		}
	}

	@media (min-width: 832px) {
		.menu {
			display: flex;
			width: auto;
			height: 100%;
			align-items: center;
		}

		.menu:last-child {
			justify-content: end;
		}

		[data-icon] {
			background: no-repeat 50% 50%;
			background-size: calc(100% - 1rem) auto;
			padding: 0 0.5rem;
			height: 100%;
		}

		[data-icon='bluesky'] {
			width: 3rem;
			background-image: url('$lib/icons/bluesky-dark.svg');

			:global(:root.light) & {
				background-image: url('$lib/icons/bluesky-light.svg');
			}
		}

		[data-icon='github'] {
			width: 3rem;
			background-image: url('$lib/icons/github-dark.svg');

			:global(:root.light) & {
				background-image: url('$lib/icons/github-light.svg');
			}
		}
	}
</style>
