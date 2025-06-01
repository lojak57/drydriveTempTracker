<script lang="ts">
	import { Gauge, Navigation, Clock, Truck } from 'lucide-svelte';

	// Props from parent
	export let totalBarrels: number;
	export let totalDistance: number; 
	export let totalHours: number;
	export let trailerNumber: string;

	function formatDuration(hours: number) {
		const h = Math.floor(hours);
		const m = Math.round((hours - h) * 60);
		return h > 0 ? `${h}h ${m}m` : `${m}m`;
	}
</script>

<!-- Summary Cards -->
<div class="summary-section">
	<div class="summary-cards mobile-grid">
		<div class="summary-card">
			<div class="card-icon barrels">
				<Gauge size={20} />
			</div>
			<div class="card-details">
				<span class="card-value">{totalBarrels.toLocaleString()}</span>
				<span class="card-label">EST. Total Barrels</span>
			</div>
		</div>
		<div class="summary-card">
			<div class="card-icon distance">
				<Navigation size={20} />
			</div>
			<div class="card-details">
				<span class="card-value">{totalDistance.toFixed(0)}</span>
				<span class="card-label">EST. Miles</span>
			</div>
		</div>
		<div class="summary-card">
			<div class="card-icon time">
				<Clock size={20} />
			</div>
			<div class="card-details">
				<span class="card-value">{formatDuration(totalHours)}</span>
				<span class="card-label">Est. Time</span>
			</div>
		</div>
		<div class="summary-card">
			<div class="card-icon truck">
				<Truck size={20} />
			</div>
			<div class="card-details">
				<span class="card-value">{trailerNumber}</span>
				<span class="card-label">Trailer</span>
			</div>
		</div>
	</div>
</div>

<style>
	/* Summary Cards */
	.summary-section {
		padding: 16px 12px;
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
	}

	@media (min-width: 640px) {
		.summary-cards {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.summary-card {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		align-items: center;
		gap: 12px;
		transition: all 0.2s ease;
	}

	.card-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		background: #6b7280;
	}

	.card-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.card-value {
		font-size: 16px;
		font-weight: 700;
		color: #1e293b;
	}

	.card-label {
		font-size: 12px;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
</style> 