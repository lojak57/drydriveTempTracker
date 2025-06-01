<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function callEmergency() {
		console.log('Emergency call initiated');
		dispatch('emergency-call');
	}

	function callDispatch() {
		console.log('Calling dispatch for transit support');
		dispatch('dispatch-call');
	}

	function reportSafetyIssue() {
		console.log('Reporting safety issue during transit');
		dispatch('safety-report');
	}
</script>

<!-- Emergency Actions -->
<div class="emergency-actions">
	<button class="emergency-btn dispatch tap-target" on:click={callDispatch}>
		<span>Dispatch</span>
	</button>
	<button class="emergency-btn safety tap-target" on:click={reportSafetyIssue}>
		<span>Safety Alert</span>
	</button>
	<button class="emergency-btn emergency tap-target" on:click={callEmergency}>
		<span>Emergency</span>
	</button>
</div>

<style>
	/* Emergency Actions */
	.emergency-actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 12px;
		background: rgba(15, 23, 42, 0.9);
		border: 1px solid rgba(59, 130, 246, 0.1);
		border-radius: 10px;
		margin-top: auto;
	}

	.emergency-btn {
		padding: 14px 8px;
		border: none;
		border-radius: 8px;
		font-weight: 700;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.emergency-btn.dispatch {
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		border: 1px solid #2563eb;
	}

	.emergency-btn.dispatch:hover {
		background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}

	.emergency-btn.safety {
		background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
		color: white;
		border: 1px solid #f59e0b;
	}

	.emergency-btn.safety:hover {
		background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
	}

	.emergency-btn.emergency {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		border: 1px solid #ef4444;
		animation: pulse-emergency 3s infinite;
	}

	.emergency-btn.emergency:hover {
		background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
		animation: none;
	}

	@keyframes pulse-emergency {
		0%, 100% {
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		}
		50% {
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 4px rgba(239, 68, 68, 0.3);
		}
	}

	/* Tap targets for better mobile usability */
	.tap-target {
		min-height: 44px;
		min-width: 44px;
	}

	/* Tablet and desktop adjustments */
	@media (min-width: 768px) {
		.emergency-actions {
			padding: 16px;
			gap: 12px;
		}

		.emergency-btn {
			padding: 16px 12px;
			font-size: 13px;
		}
	}

	@media (min-width: 1024px) {
		.emergency-actions {
			border-radius: 12px;
		}

		.emergency-btn {
			padding: 18px 16px;
			font-size: 14px;
		}
	}
</style> 