<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js/auto';

	export let size: 'small' | 'medium' | 'large' = 'medium';
	export let showLabels: boolean = true;

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart;

	// Kevin's updated consistency breakdown
	const consistencyBreakdown = [
		{ label: 'Good', value: 70, color: '#10b981' },
		{ label: 'Recommended Cal', value: 17, color: '#f59e0b' },
		{ label: 'Critical', value: 13, color: '#ef4444' }
	];

	const chartSizes = {
		small: { width: 200, height: 200 },
		medium: { width: 300, height: 300 },
		large: { width: 400, height: 400 }
	};

	onMount(() => {
		Chart.register(...registerables);
		
		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: consistencyBreakdown.map(item => item.label),
				datasets: [{
					data: consistencyBreakdown.map(item => item.value),
					backgroundColor: consistencyBreakdown.map(item => item.color),
					borderColor: consistencyBreakdown.map(item => item.color),
					borderWidth: 2,
					hoverBorderWidth: 4,
					hoverBorderColor: '#ffffff'
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: showLabels,
						position: 'bottom',
						labels: {
							color: '#64748b',
							font: {
								size: 12,
								family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
							},
							padding: 16,
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					tooltip: {
						backgroundColor: 'rgba(15, 23, 42, 0.95)',
						titleColor: '#ffffff',
						bodyColor: '#ffffff',
						borderColor: '#475569',
						borderWidth: 1,
						cornerRadius: 8,
						displayColors: true,
						callbacks: {
							label: function(context) {
								const label = context.label || '';
								const value = context.parsed;
								return `${label}: ${value}%`;
							}
						}
					}
				},
				cutout: '60%',
				animation: {
					animateRotate: true,
					duration: 1000,
					easing: 'easeOutCubic'
				},
				interaction: {
					intersect: false,
					mode: 'index'
				}
			}
		});

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	});

	// Calculate center text values
	$: totalGoodPercentage = consistencyBreakdown[0].value;
	$: criticalCount = Math.round((consistencyBreakdown[2].value / 100) * 45); // Assuming 45 total meters
</script>

<div class="smart-cal-container" style="width: {chartSizes[size].width}px; height: {chartSizes[size].height}px;">
	<div class="relative">
		<canvas
			bind:this={chartCanvas}
			width={chartSizes[size].width}
			height={chartSizes[size].height}
			class="smart-cal-chart"
		></canvas>
		
		<!-- Center content -->
		<div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
			<div class="text-center">
				<div class="text-2xl font-bold text-green-600">
					{totalGoodPercentage}%
				</div>
				<div class="text-xs text-gray-600 uppercase tracking-wide">
					Calibrated
				</div>
				<div class="text-xs text-red-600 mt-1">
					{criticalCount} Critical
				</div>
			</div>
		</div>
	</div>

	<!-- Summary cards below chart -->
	{#if showLabels}
		<div class="grid grid-cols-3 gap-2 mt-4">
			{#each consistencyBreakdown as item}
				<div class="text-center p-2 rounded-lg bg-gray-50 border">
					<div class="w-3 h-3 rounded-full mx-auto mb-1" style="background-color: {item.color}"></div>
					<div class="text-lg font-bold" style="color: {item.color}">
						{item.value}%
					</div>
					<div class="text-xs text-gray-600">
						{item.label}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.smart-cal-container {
		max-width: 100%;
		margin: 0 auto;
	}

	.smart-cal-chart {
		max-width: 100%;
		height: auto;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.smart-cal-container {
			transform: scale(0.9);
		}
		
		.grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 0.25rem;
		}
		
		.text-lg {
			font-size: 0.875rem;
		}
		
		.text-xs {
			font-size: 0.625rem;
		}
	}
</style> 