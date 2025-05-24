<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/ui/Navigation.svelte';
	let { children } = $props();
</script>

<div class="min-h-screen gradient-mesh">
	<Navigation />

	<!-- Main Content -->
	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="bg-oil-black/90 backdrop-blur-xl text-white mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<div class="text-center">
				<p class="text-sm opacity-75">© 2024 Oil Field Temp Tracker - Monitoring Critical Systems</p>
			</div>
		</div>
	</footer>
</div>
