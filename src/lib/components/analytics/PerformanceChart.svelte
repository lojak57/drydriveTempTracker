<script lang="ts">
	import Chart from '$lib/components/charts/Chart.svelte';
	import { onMount } from 'svelte';
	
	export let title: string = 'Performance Trends';
	export let timeframe: '7d' | '30d' | '90d' = '30d';
	export let height: number = 400;
	
	let chartData: any;
	
	// Generate realistic performance data
	const generatePerformanceData = () => {
		const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
		const labels = [];
		const efficiencyData = [];
		const volumeData = [];
		const temperatureData = [];
		const lossData = [];
		
		const now = new Date();
		
		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
			labels.push(date.toLocaleDateString('en-US', { 
				month: 'short', 
				day: 'numeric' 
			}));
			
			// Generate realistic oil field performance metrics
			const baseEfficiency = 92 + Math.sin(i * 0.1) * 3; // 89-95% efficiency
			const efficiency = baseEfficiency + (Math.random() - 0.5) * 4;
			efficiencyData.push(Math.round(efficiency * 100) / 100);
			
			const baseVolume = 2500 + Math.sin(i * 0.15) * 300; // 2200-2800 barrels
			const volume = baseVolume + (Math.random() - 0.5) * 200;
			volumeData.push(Math.round(volume));
			
			const baseTemp = 85 + Math.sin(i * 0.2) * 8; // 77-93°F
			const temperature = baseTemp + (Math.random() - 0.5) * 6;
			temperatureData.push(Math.round(temperature * 10) / 10);
			
			const baseLoss = 2.1 + Math.sin(i * 0.12) * 0.8; // 1.3-2.9% loss
			const loss = baseLoss + (Math.random() - 0.5) * 0.6;
			lossData.push(Math.round(loss * 100) / 100);
		}
		
		return {
			labels,
			datasets: [
				{
					label: 'Fleet Efficiency (%)',
					data: efficiencyData,
					borderColor: '#10b981',
					backgroundColor: 'rgba(16, 185, 129, 0.1)',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					yAxisID: 'y'
				},
				{
					label: 'Daily Volume (bbls)',
					data: volumeData,
					borderColor: '#004E89',
					backgroundColor: 'rgba(0, 78, 137, 0.1)',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					yAxisID: 'y1'
				},
				{
					label: 'Avg Temperature (°F)',
					data: temperatureData,
					borderColor: '#FF6B35',
					backgroundColor: 'rgba(255, 107, 53, 0.1)',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					yAxisID: 'y2'
				},
				{
					label: 'Volume Loss (%)',
					data: lossData,
					borderColor: '#ef4444',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					yAxisID: 'y3'
				}
			]
		};
	};
	
	onMount(() => {
		chartData = generatePerformanceData();
	});
	
	// Update chart when timeframe changes
	$: if (timeframe) {
		chartData = generatePerformanceData();
	}
</script>

<div class="performance-chart">
	<div class="chart-header">
		<h3 class="chart-title">{title}</h3>
		<div class="timeframe-selector">
			<button 
				class="timeframe-btn {timeframe === '7d' ? 'active' : ''}"
				on:click={() => timeframe = '7d'}
			>
				7D
			</button>
			<button 
				class="timeframe-btn {timeframe === '30d' ? 'active' : ''}"
				on:click={() => timeframe = '30d'}
			>
				30D
			</button>
			<button 
				class="timeframe-btn {timeframe === '90d' ? 'active' : ''}"
				on:click={() => timeframe = '90d'}
			>
				90D
			</button>
		</div>
	</div>
	
	{#if chartData}
		<Chart 
			type="line" 
			data={chartData}
			{height}
			options={{
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				plugins: {
					legend: {
						position: 'top',
						labels: {
							usePointStyle: true,
							padding: 20,
							font: {
								size: 12,
								weight: '500'
							}
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: function(context: any) {
								const label = context.dataset.label || '';
								const value = context.parsed.y;
								
								if (label.includes('Efficiency')) {
									return `${label}: ${value}%`;
								} else if (label.includes('Volume')) {
									return `${label}: ${value.toLocaleString()} bbls`;
								} else if (label.includes('Temperature')) {
									return `${label}: ${value}°F`;
								} else if (label.includes('Loss')) {
									return `${label}: ${value}%`;
								}
								return `${label}: ${value}`;
							}
						}
					}
				},
				scales: {
					x: {
						display: true,
						grid: {
							color: 'rgba(0, 78, 137, 0.1)'
						},
						ticks: {
							color: '#ffffff'
						}
					},
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Efficiency (%)',
							color: '#10b981'
						},
						grid: {
							color: 'rgba(0, 78, 137, 0.1)'
						},
						ticks: {
							color: '#ffffff'
						}
					},
					y1: {
						type: 'linear',
						display: false,
						position: 'right',
						grid: {
							drawOnChartArea: false
						}
					},
					y2: {
						type: 'linear',
						display: false,
						position: 'right',
						grid: {
							drawOnChartArea: false
						}
					},
					y3: {
						type: 'linear',
						display: false,
						position: 'right',
						grid: {
							drawOnChartArea: false
						}
					}
				}
			}}
		/>
	{/if}
</div>

<style>
	.performance-chart {
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 20px;
		padding: 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
	}
	
	.chart-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24px;
	}
	
	.chart-title {
		font-size: 20px;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
	}
	
	.timeframe-selector {
		display: flex;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		padding: 4px;
		gap: 4px;
	}
	
	.timeframe-btn {
		padding: 8px 16px;
		border: none;
		background: transparent;
		border-radius: 8px;
		color: #6b7280;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.timeframe-btn:hover {
		background: rgba(255, 255, 255, 0.5);
		color: #1a1a1a;
	}
	
	.timeframe-btn.active {
		background: #004E89;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 78, 137, 0.3);
	}
</style> 