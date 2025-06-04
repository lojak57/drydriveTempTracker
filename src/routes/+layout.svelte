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
			#fbfbfb 0%,           /* Clean white */
			#f8fafc 30%,          /* Soft blue-gray */
			#f1f5f9 60%,          /* Light slate */
			#f9fafb 100%          /* Cool gray */
		);
	}

	.main-content {
		flex: 1;
		padding: 12px;
		padding-top: 52px; /* Updated to 40px header + 12px padding */
		min-height: 100vh;
		overflow-x: auto;
		overflow-y: auto;
		/* Remove any background so layout gradient shows through */
		background: transparent;
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
			padding-top: 52px; /* Updated for new 40px header height */
		}
	}
</style>
