<script lang="ts">
	import DispatchHub from '$lib/components/dispatch/DispatchHub.svelte';
	import { BarChart3 } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Master Dispatch View - Oil Field Temp Tracker</title>
</svelte:head>

<div class="master-dispatch-dashboard">
	<!-- Header -->
	<div class="dashboard-header">
		<div class="header-content">
			<div class="header-icon">
				<BarChart3 size={32} />
			</div>
			<div class="header-text">
				<h1 class="header-title">Master Dispatch View</h1>
				<p class="header-subtitle">Hierarchical fleet intelligence: Fleet → Yard → Truck → Haul Tickets</p>
			</div>
		</div>
	</div>

	<!-- Master Dispatch Content -->
	<div class="dispatch-content">
		<DispatchHub />
	</div>
</div>

<style>
	.master-dispatch-dashboard {
		min-height: 100vh;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
		padding: 20px;
	}

	.dashboard-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		margin-bottom: 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.header-icon {
		font-size: 48px;
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #475569 0%, #334155 100%);
		border-radius: 20px;
		color: white;
		box-shadow: 0 8px 25px rgba(71, 85, 105, 0.3);
	}

	.header-text h1 {
		font-size: 32px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 8px 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.header-text p {
		font-size: 16px;
		color: #64748b;
		margin: 0;
	}

	.dispatch-content {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 20px;
		padding: 32px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	}

	/* Mobile Responsiveness */
	@media (max-width: 768px) {
		.master-dispatch-dashboard {
			padding: 16px;
		}

		.dashboard-header {
			padding: 24px 20px;
			margin-bottom: 20px;
		}

		.header-content {
			flex-direction: column;
			text-align: center;
			gap: 16px;
		}

		.header-icon {
			font-size: 40px;
			width: 60px;
			height: 60px;
		}

		.header-text h1 {
			font-size: 24px;
		}

		.header-text p {
			font-size: 14px;
		}

		.dispatch-content {
			padding: 24px 16px;
		}
	}
</style> 