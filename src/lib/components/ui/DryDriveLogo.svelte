<script lang="ts">
	export let size: number = 200;
</script>

<div class="drydrive-logo" style="width: {size}px;">
	<img 
		src="/logo.png" 
		alt="DryDrive Logo" 
		class="w-full h-auto"
		style="max-width: {size}px;"
	/>
</div>

<style>
	.drydrive-logo {
		display: inline-block;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
	}
	
	.drydrive-logo img {
		transition: all 0.3s ease;
	}
	
	.drydrive-logo:hover img {
		transform: scale(1.05);
		filter: drop-shadow(0 6px 12px rgba(124, 179, 66, 0.3));
	}
</style> 