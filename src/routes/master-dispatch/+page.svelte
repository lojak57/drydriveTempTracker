<script lang="ts">
	import DispatchHub from '$lib/components/dispatch/DispatchHub.svelte';
</script>

<svelte:head>
	<title>Fleet Intelligence Nexus - Oil Field Temp Tracker</title>
</svelte:head>

<div class="master-dispatch-dashboard">
	<!-- Fleet Intelligence Nexus Content - Full Page -->
	<div class="dispatch-content">
		<DispatchHub />
	</div>
</div>

<style>
	.master-dispatch-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
		padding: 12px;
	}

	.dispatch-content {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		height: calc(100vh - 24px);
		overflow: hidden;
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.master-dispatch-dashboard {
			padding: 8px;
		}

		.dispatch-content {
			height: calc(100vh - 16px);
			border-radius: 12px;
		}
	}
</style> 