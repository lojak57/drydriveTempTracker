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
		min-height: 100vh;
		background: linear-gradient(135deg, 
			rgba(248, 250, 252, 0.8) 0%, 
			rgba(241, 245, 249, 0.6) 50%,
			rgba(236, 254, 255, 0.8) 100%);
	}

	.main-content {
		flex: 1;
		margin-left: 280px;
		padding: 24px;
		min-height: 100vh;
		overflow-x: auto;
		overflow-y: auto;
	}

	@media (max-width: 1024px) {
		.main-content {
			margin-left: 0;
			padding: 16px;
		}
	}

	@media (max-width: 640px) {
		.main-content {
			padding: 12px;
		}
	}
</style>
