<script lang="ts">
	import { AlertCircle, MapPin, Navigation } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleEmergencyContact() {
		dispatch('emergency-contact');
	}

	function handleCallDispatch() {
		dispatch('call-dispatch');
	}

	function handleOpenNavigation() {
		dispatch('open-navigation');
	}
</script>

<!-- Quick Actions -->
<div class="quick-actions">
	<button class="action-btn emergency tap-target" on:click={handleEmergencyContact}>
		<AlertCircle size={20} />
		<span>Emergency Contact</span>
	</button>
	<button class="action-btn dispatch tap-target" on:click={handleCallDispatch}>
		<MapPin size={20} />
		<span>Call Dispatch</span>
	</button>
	<button class="action-btn navigation tap-target" on:click={handleOpenNavigation}>
		<Navigation size={20} />
		<span>Open Navigation</span>
	</button>
</div>

<style>
	/* Quick Actions */
	.quick-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		padding: 20px 12px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	.action-btn {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 16px;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
		min-height: 44px;
	}

	.action-btn.emergency {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		border-color: rgba(239, 68, 68, 0.2);
	}

	.action-btn.dispatch {
		background: rgba(59, 130, 246, 0.1);
		color: #2563eb;
		border-color: rgba(59, 130, 246, 0.2);
	}

	.action-btn.navigation {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
		border-color: rgba(16, 185, 129, 0.2);
	}

	.action-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	/* Tap targets */
	.tap-target {
		min-height: 44px;
	}
</style> 