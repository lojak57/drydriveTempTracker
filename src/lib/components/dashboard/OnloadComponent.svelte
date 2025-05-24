<script lang="ts">
	import { sites, drivers, trucks, type Site } from '$lib/stores/haulStore';
	
	interface Props {
		selectedSite: Site | null;
		selectedDriver: string;
		selectedTruck: string;
		initialVolume: number;
		startHaul: () => void;
	}
	
	let { 
		selectedSite = $bindable(),
		selectedDriver = $bindable(),
		selectedTruck = $bindable(),
		initialVolume = $bindable(),
		startHaul
	}: Props = $props();
	
	let onloadSites = $derived($sites.filter(site => site.type === 'onload'));
</script>

<div class="glass-card p-6 space-y-6">
	<!-- Site Selection -->
	<div>
		<label class="block text-sm font-semibold text-oil-black mb-2">Loading Site</label>
		<select 
			bind:value={selectedSite}
			class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
		>
			<option value={null}>Select loading site...</option>
			{#each onloadSites as site}
				<option value={site}>{site.name}</option>
			{/each}
		</select>
	</div>
	
	<!-- Driver Selection -->
	<div>
		<label class="block text-sm font-semibold text-oil-black mb-2">Driver</label>
		<select 
			bind:value={selectedDriver}
			class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
		>
			<option value="">Select driver...</option>
			{#each $drivers as driver}
				<option value={driver.id}>{driver.name}</option>
			{/each}
		</select>
	</div>
	
	<!-- Truck Selection -->
	<div>
		<label class="block text-sm font-semibold text-oil-black mb-2">Truck</label>
		<select 
			bind:value={selectedTruck}
			class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
		>
			<option value="">Select truck...</option>
			{#each $trucks as truck}
				<option value={truck.id}>{truck.plateNumber} - {truck.model}</option>
			{/each}
		</select>
	</div>
	
	<!-- Initial Volume -->
	<div>
		<label class="block text-sm font-semibold text-oil-black mb-2">Initial Volume (gallons)</label>
		<input 
			type="number"
			bind:value={initialVolume}
			min="0"
			max="10000"
			step="10"
			class="w-full p-3 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
		/>
	</div>
	
	<!-- Coriolis Reading Display -->
	<div class="bg-slate-50/50 rounded-xl p-4">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium text-oil-black">Coriolis Reading</span>
			<div class="status-dot status-normal"></div>
		</div>
		<div class="metric-display text-oil-blue mt-2">{initialVolume.toFixed(1)} gal</div>
		<p class="text-xs text-oil-gray mt-1">Verified measurement</p>
	</div>
	
	<!-- Start Haul Button -->
	<button 
		onclick={startHaul}
		class="w-full btn-primary"
		disabled={!selectedSite || !selectedDriver || !selectedTruck}
	>
		🚚 Start Haul
	</button>
</div> 