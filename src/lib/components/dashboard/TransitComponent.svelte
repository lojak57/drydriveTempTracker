<script lang="ts">
	import { onMount } from 'svelte';
	import { calculateExpectedLoss, type Haul } from '$lib/stores/haulStore';
	
	interface Props {
		haul: Haul | null;
	}
	
	let { haul }: Props = $props();
	
	let transitProgress = $state(0);
	let estimatedTimeRemaining = $state(120); // minutes
	let currentAmbient = $state(95.2);
	let currentInternal = $state(72.4);
	let expectedLoss = $state(0);
	
	// Simulate transit progress
	onMount(() => {
		if (!haul) return;
		
		const interval = setInterval(() => {
			if (haul && haul.status === 'transit') {
				transitProgress = Math.min(transitProgress + 1, 100);
				estimatedTimeRemaining = Math.max(0, estimatedTimeRemaining - 1);
				
				// Simulate temperature changes
				currentAmbient = 90 + Math.random() * 15;
				currentInternal = 70 + Math.random() * 8;
				
				// Calculate expected loss
				const transitTimeHours = (120 - estimatedTimeRemaining) / 60;
				expectedLoss = calculateExpectedLoss(
					haul.initialVolume,
					currentAmbient,
					currentInternal,
					transitTimeHours
				);
			}
		}, 1000);

		return () => clearInterval(interval);
	});
	
	function formatTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	}
</script>

{#if !haul}
	<div class="glass-card p-6 text-center">
		<div class="text-6xl mb-4 opacity-50">🚚</div>
		<h3 class="text-lg font-semibold text-oil-black mb-2">No Active Haul</h3>
		<p class="text-oil-gray">Start a haul to begin transit monitoring</p>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Route Map Simulation -->
		<div class="glass-card p-6">
			<div class="flex items-center justify-between mb-4">
				<h3 class="text-lg font-semibold text-oil-black">Route Progress</h3>
				<span class="text-sm text-oil-gray">{transitProgress}% Complete</span>
			</div>
			
			<!-- Simulated Map -->
			<div class="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 h-48 overflow-hidden">
				<!-- Route Line -->
				<div class="absolute inset-4 flex items-center">
					<div class="w-full h-1 bg-slate-300 rounded-full relative">
						<div 
							class="h-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full transition-all duration-1000"
							style="width: {transitProgress}%"
						></div>
						<!-- Truck Icon -->
						<div 
							class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-2xl transition-all duration-1000"
							style="left: {transitProgress}%"
						>
							🚚
						</div>
					</div>
				</div>
				
				<!-- Start and End Points -->
				<div class="absolute left-4 top-4 text-xs bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
					📍 {haul.onloadSite.name}
				</div>
				<div class="absolute right-4 bottom-4 text-xs bg-white/80 backdrop-blur-sm rounded-lg px-2 py-1">
					🎯 {haul.offloadSite.name}
				</div>
			</div>
			
			<!-- ETA -->
			<div class="mt-4 text-center">
				<span class="text-sm text-oil-gray">ETA: {formatTime(estimatedTimeRemaining)}</span>
			</div>
		</div>
		
		<!-- Temperature Monitoring -->
		<div class="glass-card p-6">
			<h3 class="text-lg font-semibold text-oil-black mb-4">Temperature Monitoring</h3>
			
			<div class="grid grid-cols-2 gap-4">
				<div class="bg-slate-50/50 rounded-xl p-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-oil-black">Ambient</span>
						<div class="status-dot {currentAmbient > 100 ? 'status-warning' : 'status-normal'}"></div>
					</div>
					<div class="metric-display text-orange-500">{currentAmbient.toFixed(1)}°F</div>
				</div>
				
				<div class="bg-slate-50/50 rounded-xl p-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-oil-black">Internal</span>
						<div class="status-dot status-normal"></div>
					</div>
					<div class="metric-display text-oil-blue">{currentInternal.toFixed(1)}°F</div>
				</div>
			</div>
		</div>
		
		<!-- Expected Loss Calculation -->
		<div class="glass-card p-6">
			<h3 class="text-lg font-semibold text-oil-black mb-4">Expected Loss Analysis</h3>
			
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<span class="text-oil-gray">Temperature Differential:</span>
					<span class="font-mono font-semibold">{(currentAmbient - currentInternal).toFixed(1)}°F</span>
				</div>
				
				<div class="flex justify-between items-center">
					<span class="text-oil-gray">Transit Time:</span>
					<span class="font-mono font-semibold">{formatTime(120 - estimatedTimeRemaining)}</span>
				</div>
				
				<div class="border-t border-slate-200 pt-4">
					<div class="flex justify-between items-center">
						<span class="text-oil-black font-semibold">Expected Loss:</span>
						<span class="metric-display text-red-500 !text-xl">{expectedLoss.toFixed(1)} gal</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if} 