<script lang="ts">
	import { sites, type Haul } from '$lib/stores/haulStore';
	
	interface Props {
		haul: Haul | null;
	}
	
	let { haul }: Props = $props();
	
	let selectedOffloadSite = $state<string>('');
	let finalVolume = $state(0);
	let actualLoss = $state(0);
	
	let offloadSites = $derived($sites.filter(site => site.type === 'offload'));
	
	function calculateActualLoss() {
		if (haul && finalVolume > 0) {
			actualLoss = haul.initialVolume - finalVolume;
		}
	}
	
	function completeMeasurement() {
		if (!haul || finalVolume <= 0) return;
		
		calculateActualLoss();
		// In real app, this would update the haul status and save to backend
		alert(`Haul completed! Actual loss: ${actualLoss.toFixed(1)} gallons`);
	}
	
	function getVarianceStatus(): 'normal' | 'warning' | 'critical' {
		if (!haul || actualLoss === 0) return 'normal';
		
		const variance = Math.abs(actualLoss - haul.expectedLoss);
		const variancePercentage = (variance / haul.expectedLoss) * 100;
		
		if (variancePercentage > 20) return 'critical';
		if (variancePercentage > 10) return 'warning';
		return 'normal';
	}
</script>

{#if !haul}
	<div class="glass-card p-6 text-center">
		<div class="text-6xl mb-4 opacity-50">⚖️</div>
		<h3 class="text-lg font-semibold text-oil-black mb-2">Awaiting Haul</h3>
		<p class="text-oil-gray">Complete transit to begin offload measurements</p>
	</div>
{:else}
	<div class="space-y-6">
		<!-- Destination Site -->
		<div class="glass-card p-6">
			<h3 class="text-lg font-semibold text-oil-black mb-4">Destination Site</h3>
			
			<div>
				<label class="block text-sm font-semibold text-oil-black mb-2">Offload Location</label>
				<select 
					bind:value={selectedOffloadSite}
					class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
				>
					<option value="">Select destination...</option>
					{#each offloadSites as site}
						<option value={site.id}>{site.name}</option>
					{/each}
				</select>
			</div>
		</div>
		
		<!-- Coriolis Measurement -->
		<div class="glass-card p-6">
			<h3 class="text-lg font-semibold text-oil-black mb-4">Final Measurement</h3>
			
			<div class="space-y-4">
				<div>
					<label class="block text-sm font-semibold text-oil-black mb-2">Final Volume (gallons)</label>
					<input 
						type="number"
						bind:value={finalVolume}
						min="0"
						max="10000"
						step="0.1"
						oninput={calculateActualLoss}
						class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
						placeholder="Enter Coriolis reading..."
					/>
				</div>
				
				<!-- Measurement Display -->
				<div class="bg-slate-50/50 rounded-xl p-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm font-medium text-oil-black">Coriolis Reading</span>
						<div class="status-dot {finalVolume > 0 ? 'status-normal' : 'status-warning'}"></div>
					</div>
					<div class="metric-display text-oil-blue">{finalVolume.toFixed(1)} gal</div>
					<p class="text-xs text-oil-gray">Final verified measurement</p>
				</div>
			</div>
		</div>
		
		<!-- Loss Comparison -->
		{#if finalVolume > 0}
			<div class="glass-card p-6">
				<h3 class="text-lg font-semibold text-oil-black mb-4">Loss Analysis</h3>
				
				<div class="grid grid-cols-2 gap-4 mb-6">
					<div class="bg-blue-50/50 rounded-xl p-4">
						<span class="text-sm font-medium text-oil-black">Expected Loss</span>
						<div class="metric-display text-oil-blue !text-xl mt-1">{haul.expectedLoss.toFixed(1)} gal</div>
					</div>
					
					<div class="bg-red-50/50 rounded-xl p-4">
						<span class="text-sm font-medium text-oil-black">Actual Loss</span>
						<div class="metric-display text-red-500 !text-xl mt-1">{actualLoss.toFixed(1)} gal</div>
					</div>
				</div>
				
				<!-- Variance Analysis -->
				<div class="border-t border-slate-200 pt-4">
					<div class="flex items-center justify-between mb-2">
						<span class="text-oil-black font-semibold">Variance:</span>
						<div class="status-dot {getVarianceStatus() === 'normal' ? 'status-normal' : getVarianceStatus() === 'warning' ? 'status-warning' : 'status-critical'}"></div>
					</div>
					
					<div class="metric-display text-oil-black !text-xl">
						{Math.abs(actualLoss - haul.expectedLoss).toFixed(1)} gal
					</div>
					
					<p class="text-sm text-oil-gray mt-1">
						{((Math.abs(actualLoss - haul.expectedLoss) / haul.expectedLoss) * 100).toFixed(1)}% 
						{actualLoss > haul.expectedLoss ? 'higher' : 'lower'} than expected
					</p>
				</div>
				
				<!-- Complete Button -->
				<button 
					onclick={completeMeasurement}
					class="w-full btn-primary mt-6"
					disabled={!selectedOffloadSite || finalVolume <= 0}
				>
					✅ Complete Haul
				</button>
			</div>
		{/if}
	</div>
{/if} 