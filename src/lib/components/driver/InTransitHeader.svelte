<script lang="ts">
	import { ArrowLeft, Shield } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let job: any; // Job details from parent
	export let alertLevel: string = 'normal'; // 'normal' | 'caution' | 'warning'

	function exitTransitView() {
		dispatch('exit-transit');
	}
</script>

<!-- Header -->
<div class="transit-header">
	<button class="back-btn tap-target" on:click={exitTransitView}>
		<ArrowLeft size={20} />
		<span>Exit Transit</span>
	</button>
	<div class="transit-title">
		<span class="transit-status">IN TRANSIT</span>
		<span class="job-id">#{job.id}</span>
	</div>
	<div class="safety-indicator {alertLevel}">
		<Shield size={18} />
	</div>
</div>

<style>
	/* Header */
	.transit-header {
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(20px);
		padding: 12px 16px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 10px;
		position: relative;
		z-index: 100;
	}

	.back-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 8px;
		color: #60a5fa;
		padding: 10px 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
	}

	.back-btn:hover {
		background: rgba(59, 130, 246, 0.2);
	}

	.transit-title {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.transit-status {
		font-size: 16px;
		font-weight: 700;
		color: #3b82f6;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.job-id {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #64748b;
	}

	.safety-indicator {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.safety-indicator.normal {
		background: rgba(34, 197, 94, 0.2);
		border: 2px solid #22c55e;
		color: #22c55e;
	}

	.safety-indicator.caution {
		background: rgba(245, 158, 11, 0.2);
		border: 2px solid #f59e0b;
		color: #f59e0b;
	}

	.safety-indicator.warning {
		background: rgba(239, 68, 68, 0.2);
		border: 2px solid #ef4444;
		color: #ef4444;
		animation: pulse-warning 2s infinite;
	}

	@keyframes pulse-warning {
		0%, 100% {
			box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
		}
		50% {
			box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
		}
	}

	/* Tap targets for better mobile usability */
	.tap-target {
		min-height: 44px;
		min-width: 44px;
	}

	/* Tablet and desktop adjustments */
	@media (min-width: 768px) {
		.transit-header {
			padding: 16px 20px;
			border-radius: 12px;
		}

		.back-btn {
			padding: 12px 16px;
			font-size: 15px;
		}

		.transit-status {
			font-size: 18px;
		}

		.job-id {
			font-size: 12px;
		}
	}

	@media (min-width: 1024px) {
		.transit-header {
			padding: 20px 24px;
		}

		.back-btn {
			padding: 14px 18px;
			font-size: 16px;
		}
	}
</style> 