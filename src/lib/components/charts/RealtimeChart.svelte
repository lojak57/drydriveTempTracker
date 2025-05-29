<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import Chart from '$lib/components/charts/Chart.svelte';

	export let title: string = 'Real-time Data';
	export let color: string = '#004E89';
	export let height: number = 200;
	export let unit: string = '';
	export let animated: boolean = true;
	export let showGrid: boolean = true;
	export let maxDataPoints: number = 20;
	export let updateInterval: number = 4000; // milliseconds

	let chartData: any = null;
	let dataPoints: number[] = [];
	let labels: string[] = [];
	let updateTimer: number;
	let isLive = false;

	// Responsive settings with SSR-safe defaults
	let screenWidth = 1024; // Default fallback for SSR

	onMount(() => {
		if (browser) {
			screenWidth = window.innerWidth;
			
			// Update screen width on resize
			const handleResize = () => {
				screenWidth = window.innerWidth;
			};
			window.addEventListener('resize', handleResize);
			
			// Initialize chart data
			generateRealisticData();
			setupChartData();
			startLiveUpdates();
			
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	});

	onDestroy(() => {
		if (updateTimer) {
			clearInterval(updateTimer);
		}
	});

	function generateRealisticData() {
		// Generate realistic oil field data based on chart title
		const baseValue = getBaseValueFromTitle(title);
		const variance = baseValue * 0.1; // 10% variance
		
		// Initialize with historical data points
		for (let i = 0; i < maxDataPoints; i++) {
			const timestamp = new Date(Date.now() - (maxDataPoints - i) * updateInterval);
			const value = baseValue + (Math.random() - 0.5) * variance;
			
			dataPoints.push(Math.max(0, value));
			labels.push(timestamp.toLocaleTimeString([], { 
				hour: '2-digit', 
				minute: '2-digit',
				second: '2-digit'
			}));
		}
	}

	function getBaseValueFromTitle(title: string): number {
		const titleLower = title.toLowerCase();
		
		// Return realistic values based on common oil field metrics
		if (titleLower.includes('temperature')) return 85; // °F
		if (titleLower.includes('pressure')) return 120; // PSI
		if (titleLower.includes('flow')) return 450; // rate
		if (titleLower.includes('volume')) return 2500; // BBL
		if (titleLower.includes('h2s') || titleLower.includes('safety')) return 0.5; // PPM
		if (titleLower.includes('network') || titleLower.includes('health')) return 97; // %
		if (titleLower.includes('efficiency')) return 94; // %
		
		return 75; // Default fallback
	}

	function setupChartData() {
		chartData = {
			labels: labels,
			datasets: [{
				label: title,
				data: dataPoints,
				borderColor: color,
				backgroundColor: `${color}20`,
				borderWidth: 2,
				fill: true,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 4,
				pointHoverBackgroundColor: color,
				pointHoverBorderColor: '#ffffff',
				pointHoverBorderWidth: 2
			}]
		};
	}

	function startLiveUpdates() {
		if (!browser) return;
		
		isLive = true;
		updateTimer = setInterval(() => {
			addNewDataPoint();
			setupChartData();
		}, updateInterval);
	}

	function addNewDataPoint() {
		const baseValue = getBaseValueFromTitle(title);
		const variance = baseValue * 0.08; // Slightly smaller variance for more realistic data
		
		// Add some trending behavior
		const lastValue = dataPoints[dataPoints.length - 1] || baseValue;
		const trend = (Math.random() - 0.5) * 0.3; // Small trend component
		const noise = (Math.random() - 0.5) * variance; // Random noise
		
		const newValue = Math.max(0, lastValue + trend + noise);
		const newTimestamp = new Date().toLocaleTimeString([], { 
			hour: '2-digit', 
			minute: '2-digit',
			second: '2-digit'
		});
		
		// Add new point and remove old one if we're at max capacity
		dataPoints.push(newValue);
		labels.push(newTimestamp);
		
		if (dataPoints.length > maxDataPoints) {
			dataPoints.shift();
			labels.shift();
		}
	}

	// Responsive chart options
	$: chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			tooltip: {
				mode: 'index',
				intersect: false,
				backgroundColor: 'rgba(255, 255, 255, 0.95)',
				titleColor: '#1a1a1a',
				bodyColor: '#6b7280',
				borderColor: color,
				borderWidth: 1,
				cornerRadius: 8,
				padding: 8,
				titleFont: {
					size: screenWidth < 640 ? 11 : 12,
					weight: '600'
				},
				bodyFont: {
					size: screenWidth < 640 ? 10 : 11
				},
				callbacks: {
					label: function(context: any) {
						return `${context.parsed.y.toFixed(1)}${unit}`;
					}
				}
			}
		},
		interaction: {
			mode: 'nearest',
			axis: 'x',
			intersect: false
		},
		scales: {
			x: {
				display: true,
				grid: {
					display: showGrid,
					color: 'rgba(0, 78, 137, 0.1)'
				},
				ticks: {
					maxTicksLimit: screenWidth < 640 ? 3 : screenWidth < 1024 ? 4 : 6,
					color: '#6b7280',
					font: {
						size: screenWidth < 640 ? 9 : screenWidth < 1024 ? 10 : 11
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
					maxTicksLimit: screenWidth < 640 ? 4 : 6,
					color: '#6b7280',
					font: {
						size: screenWidth < 640 ? 9 : screenWidth < 1024 ? 10 : 11
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
	};
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
			options={chartOptions}
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