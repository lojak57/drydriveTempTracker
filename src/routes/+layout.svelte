<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/ui/Navigation.svelte';
</script>

<div class="app-layout">
	<Navigation />
	<main class="main-content">
		<slot />
	</main>
</div>

<style>
	.app-layout {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: linear-gradient(135deg, 
			rgba(248, 250, 252, 0.8) 0%, 
			rgba(241, 245, 249, 0.6) 50%,
			rgba(236, 254, 255, 0.8) 100%);
	}

	.main-content {
		flex: 1;
		padding: 12px;
		padding-top: 76px; /* Account for fixed mobile header */
		min-height: 100vh;
		overflow-x: auto;
		overflow-y: auto;
	}

	/* Desktop styles - enhance for larger screens */
	@media (min-width: 1025px) {
		.app-layout {
			flex-direction: row;
		}

		.main-content {
			margin-left: 280px;
			padding: 24px;
			padding-top: 24px; /* Remove mobile header offset */
		}
	}

	/* Tablet adjustments */
	@media (min-width: 641px) and (max-width: 1024px) {
		.main-content {
			padding: 16px;
			padding-top: 76px;
		}
	}
</style>
