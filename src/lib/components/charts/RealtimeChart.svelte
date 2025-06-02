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
	
	// External positioning controls
	export let paddingLeft: number = 15;
	export let paddingRight: number = 15;
	export let paddingTop: number = 15;
	export let paddingBottom: number = 50;

	let chartData: any = null;
	let chartOptions: any = null;
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
				chartOptions = createChartOptions(); // Recreate options with new screen width
			};
			window.addEventListener('resize', handleResize);
			
			// Initialize chart
			initializeChart();
			
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

	function initializeChart() {
		// Generate initial data
		generateRealisticData();
		
		// Create chart options
		chartOptions = createChartOptions();
		
		// Setup chart data
		setupChartData();
		
		// Start live updates
		startLiveUpdates();
	}

	function generateRealisticData() {
		// Clear existing data
		dataPoints = [];
		labels = [];
		
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

	function createChartOptions() {
		return {
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: {
					left: paddingLeft,
					right: paddingRight,
					top: paddingTop,
					bottom: paddingBottom
				}
			},
			plugins: {
				legend: {
					display: false
				},
				tooltip: {
					mode: 'index',
					intersect: false,
					backgroundColor: 'rgba(0, 0, 0, 0.8)',
					titleColor: '#ffffff',
					bodyColor: '#ffffff',
					borderColor: color,
					borderWidth: 1,
					cornerRadius: 8,
					displayColors: false,
					callbacks: {
						label: function(context: any) {
							return `${context.parsed.y.toFixed(1)}${unit}`;
						}
					}
				}
			},
			scales: {
				x: {
					display: true, // Force display
					position: 'bottom',
					grid: {
						display: showGrid,
						color: 'rgba(0, 0, 0, 0.1)',
						lineWidth: 1
					},
					ticks: {
						display: true, // Force display
						maxTicksLimit: screenWidth > 768 ? 5 : 3,
						color: '#374151',
						font: {
							size: 12,
							weight: 500,
							family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
						},
						padding: 10, // More padding
						maxRotation: 0,
						minRotation: 0
					},
					border: {
						display: true,
						color: '#d1d5db'
					}
				},
				y: {
					display: showGrid,
					position: 'left',
					grid: {
						display: showGrid,
						color: 'rgba(0, 0, 0, 0.1)',
						lineWidth: 1
					},
					ticks: {
						display: true,
						maxTicksLimit: 5,
						color: '#374151',
						font: {
							size: 12,
							weight: 500,
							family: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
						},
						callback: function(value: any) {
							return `${value}${unit}`;
						},
						padding: 10
					},
					border: {
						display: true,
						color: '#d1d5db'
					}
				}
			},
			interaction: {
				intersect: false,
				mode: 'index'
			},
			animation: animated ? {
				duration: 750,
				easing: 'easeInOutQuart'
			} : false,
			elements: {
				line: {
					tension: 0.4
				},
				point: {
					radius: 0,
					hoverRadius: 4
				}
			}
		};
	}
</script>

<div class="realtime-chart-container" style="height: {height}px;">
	<div class="chart-header">
		<div class="chart-title-container">
			<h3 class="chart-title">{title}</h3>
			{#if isLive}
				<div class="live-indicator">
					<div class="live-dot"></div>
					<span class="live-text">LIVE</span>
				</div>
			{/if}
		</div>
	</div>
	
	<div class="chart-wrapper">
		{#if chartData && chartOptions}
			<Chart 
				type="line" 
				data={chartData} 
				options={chartOptions}
				height={Math.max(height - 80, 320)}
			/>
		{:else}
			<div class="chart-loading">
				<div class="loading-spinner"></div>
				<span>Loading chart data...</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.realtime-chart-container {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		padding: 20px;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.realtime-chart-container:hover {
		transform: translateY(-2px);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.15),
			0 4px 12px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.chart-header {
		margin-bottom: 12px;
	}

	.chart-title-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}

	.chart-title {
		font-size: 16px;
		font-weight: 600;
		color: #ffffff;
		margin: 0;
		line-height: 1.2;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 8px;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 12px;
	}

	.live-dot {
		width: 6px;
		height: 6px;
		background: #10b981;
		border-radius: 50%;
		animation: livePulse 2s infinite;
	}

	@keyframes livePulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.2);
		}
	}

	.live-text {
		font-size: 10px;
		font-weight: 600;
		color: #10b981;
		letter-spacing: 0.5px;
	}

	.chart-wrapper {
		height: calc(100% - 45px); /* More space for chart */
		position: relative;
		min-height: 450px; /* Increased from 420px to match safety modal container */
		overflow: visible; /* Ensure labels aren't clipped */
	}

	.chart-loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #6b7280;
		gap: 12px;
	}

	.loading-spinner {
		width: 24px;
		height: 24px;
		border: 2px solid #e5e7eb;
		border-top: 2px solid #7CB342;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.realtime-chart-container {
			padding: 16px;
		}

		.chart-title {
			font-size: 14px;
		}

		.live-text {
			font-size: 9px;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.realtime-chart-container {
			background: rgba(30, 30, 30, 0.95);
			border-color: rgba(255, 255, 255, 0.1);
		}

		.chart-title {
			color: #f3f4f6;
		}

		.chart-loading {
			color: #9ca3af;
		}
	}

	/* Debug positioning controls */
	.debug-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.position-controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.horizontal-controls {
		display: flex;
		gap: 4px;
	}

	.pos-btn {
		width: 24px;
		height: 24px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: #ffffff;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pos-btn:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.padding-display {
		font-size: 10px;
		color: rgba(255, 255, 255, 0.7);
		font-family: monospace;
	}
</style> 