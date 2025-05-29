<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from './Chart.svelte';

	export let title: string;
	export let data: number[] = [];
	export let labels: string[] = [];
	export let color: string = '#004E89';
	export let height: number = 300;
	export let maxDataPoints: number = 20;
	export let unit: string = '';
	export let showGrid: boolean = true;
	export let animated: boolean = true;

	let chartData: any;
	let updateInterval: number;

	// Generate realistic oil field data if no data provided
	const generateRealtimeData = () => {
		const now = new Date();
		const newLabels = [];
		const newData = [];
		
		for (let i = maxDataPoints - 1; i >= 0; i--) {
			const time = new Date(now.getTime() - i * 30000); // 30 second intervals
			newLabels.push(time.toLocaleTimeString('en-US', { 
				hour12: false, 
				hour: '2-digit', 
				minute: '2-digit',
				second: '2-digit'
			}));
			
			// Generate realistic oil field data with some variation
			const baseValue = title.toLowerCase().includes('temp') ? 85 : 
							 title.toLowerCase().includes('pressure') ? 120 :
							 title.toLowerCase().includes('flow') ? 450 :
							 title.toLowerCase().includes('volume') ? 2500 : 100;
			
			const variation = baseValue * 0.1; // 10% variation
			const value = baseValue + (Math.random() - 0.5) * variation;
			newData.push(Math.round(value * 100) / 100);
		}
		
		return { labels: newLabels, data: newData };
	};

	// Update chart data
	const updateChartData = () => {
		let currentLabels = labels.length > 0 ? [...labels] : [];
		let currentData = data.length > 0 ? [...data] : [];
		
		// If no data provided, generate realistic data
		if (currentData.length === 0) {
			const generated = generateRealtimeData();
			currentLabels = generated.labels;
			currentData = generated.data;
		} else {
			// Add new data point
			const now = new Date();
			const newLabel = now.toLocaleTimeString('en-US', { 
				hour12: false, 
				hour: '2-digit', 
				minute: '2-digit',
				second: '2-digit'
			});
			
			// Generate new data point with realistic variation
			const lastValue = currentData[currentData.length - 1] || 100;
			const variation = lastValue * 0.05; // 5% variation
			const newValue = lastValue + (Math.random() - 0.5) * variation;
			
			currentLabels.push(newLabel);
			currentData.push(Math.round(newValue * 100) / 100);
			
			// Keep only the last maxDataPoints
			if (currentLabels.length > maxDataPoints) {
				currentLabels = currentLabels.slice(-maxDataPoints);
				currentData = currentData.slice(-maxDataPoints);
			}
		}
		
		chartData = {
			labels: currentLabels,
			datasets: [{
				label: title,
				data: currentData,
				borderColor: color,
				backgroundColor: `${color}20`,
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: color,
				pointBorderColor: '#ffffff',
				pointBorderWidth: 2
			}]
		};
	};

	onMount(() => {
		// Initialize chart data first
		updateChartData();
		
		// Only start animation if data is properly initialized
		if (animated && chartData && chartData.datasets && chartData.datasets.length > 0) {
			updateInterval = setInterval(() => {
				updateChartData();
			}, 4000);
		}
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	// Update when props change
	$: if (data || labels) {
		updateChartData();
	}
</script>

<div class="realtime-chart">
	<div class="chart-header">
		<h3 class="chart-title">{title}</h3>
		<div class="chart-status">
			<div class="status-indicator {animated ? 'live' : 'static'}"></div>
			<span class="status-text">{animated ? 'Live' : 'Static'}</span>
		</div>
	</div>
	
	{#if chartData && chartData.datasets && chartData.datasets.length > 0}
		<Chart 
			type="line" 
			data={chartData}
			{height}
			options={{
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: function(context: any) {
								return `${context.dataset.label}: ${context.parsed.y}${unit}`;
							}
						}
					}
				},
				scales: {
					x: {
						display: true,
						grid: {
							display: showGrid,
							color: 'rgba(0, 78, 137, 0.1)'
						},
						ticks: {
							maxTicksLimit: window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 6 : 8,
							color: '#6b7280',
							font: {
								size: window.innerWidth < 640 ? 9 : window.innerWidth < 1024 ? 10 : 11
							}
						}
					},
					y: {
						display: true,
						grid: {
							display: showGrid,
							color: 'rgba(0, 78, 137, 0.1)'
						},
						ticks: {
							maxTicksLimit: window.innerWidth < 640 ? 4 : 6,
							color: '#6b7280',
							font: {
								size: window.innerWidth < 640 ? 9 : window.innerWidth < 1024 ? 10 : 11
							},
							callback: function(value: any) {
								return value + unit;
							}
						}
					}
				},
				animation: animated ? {
					duration: 750,
					easing: 'easeInOutQuart'
				} : false
			}}
		/>
	{:else}
		<div class="chart-loading" style="height: {height}px;">
			<div class="loading-content">
				<div class="loading-spinner"></div>
				<p>Loading chart data...</p>
			</div>
		</div>
	{/if}
</div>

<style>
	.realtime-chart {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
		transition: all 0.3s ease;
		overflow: hidden;
	}
	
	.realtime-chart:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
	}
	
	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		flex-wrap: wrap;
		gap: 8px;
	}
	
	.chart-title {
		font-size: 14px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.3;
	}
	
	.chart-status {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	
	.status-indicator {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #6b7280;
	}
	
	.status-indicator.live {
		background: #10b981;
		animation: pulse 2s infinite;
	}
	
	.status-text {
		font-size: 10px;
		font-weight: 500;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.chart-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		border: 1px dashed rgba(255, 255, 255, 0.3);
	}
	
	.loading-content {
		text-align: center;
		color: #6b7280;
	}
	
	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid rgba(107, 114, 128, 0.2);
		border-top: 2px solid #6b7280;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 8px;
	}
	
	.loading-content p {
		font-size: 12px;
		margin: 0;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Mobile optimizations */
	@media (max-width: 640px) {
		.realtime-chart {
			padding: 12px;
			border-radius: 12px;
		}
		
		.chart-header {
			margin-bottom: 8px;
			gap: 6px;
		}
		
		.chart-title {
			font-size: 12px;
		}
		
		.chart-status {
			padding: 3px 6px;
			border-radius: 6px;
			gap: 4px;
		}
		
		.status-indicator {
			width: 4px;
			height: 4px;
		}
		
		.status-text {
			font-size: 8px;
		}
		
		.loading-content p {
			font-size: 10px;
		}
		
		.loading-spinner {
			width: 20px;
			height: 20px;
		}
		
		.realtime-chart:hover {
			transform: none;
		}
	}
	
	/* Tablet optimizations */
	@media (min-width: 641px) and (max-width: 1024px) {
		.realtime-chart {
			padding: 18px;
		}
		
		.chart-title {
			font-size: 16px;
		}
		
		.status-text {
			font-size: 11px;
		}
	}
</style> 