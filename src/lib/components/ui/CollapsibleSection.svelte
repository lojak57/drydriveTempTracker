<script lang="ts">
	import { ChevronDown, ChevronRight, Bell } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let title: string;
	export let count: number | null = null;
	export let icon: any = null;
	export let defaultOpen = false;
	export let highlight = false;
	export let flashIf = false;
	export let urgent = false;
	
	const dispatch = createEventDispatcher();
	
	let isOpen = defaultOpen;
	let sectionElement: HTMLElement;
	
	function toggle() {
		isOpen = !isOpen;
		dispatch('toggle', { isOpen, title });
	}
	
	function handleCountClick(event: Event) {
		event.stopPropagation();
		if (!isOpen) {
			isOpen = true;
			dispatch('toggle', { isOpen: true, title });
		}
		// Scroll to section with smooth behavior
		setTimeout(() => {
			sectionElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}
	
	$: titleClasses = flashIf ? 'text-flash-red font-semibold' : 'text-slate-800';
	$: sectionClasses = highlight && flashIf ? 'border-red-600 bg-red-50' : 'border-slate-200 bg-white';
	$: countBadgeClasses = flashIf ? 'bg-red-100 text-red-700 pulse-red cursor-pointer hover:bg-red-200' : 'bg-slate-100 text-slate-600';
</script>

<div class="collapsible-section {sectionClasses} border rounded-xl shadow-sm" bind:this={sectionElement}>
	<button 
		class="section-header w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
		on:click={toggle}
		type="button"
	>
		<div class="header-content flex items-center gap-3">
			{#if urgent && flashIf}
				<span class="emergency-indicator text-red-500 animate-pulse">🚨</span>
			{/if}
			{#if icon}
				<svelte:component this={icon} size={20} class="text-slate-600" />
			{/if}
			<h3 class="section-title {titleClasses} text-lg font-semibold tracking-tight">
				{title}
				{#if count !== null}
					<span class="count-badge ml-2 px-2 py-1 {countBadgeClasses} text-sm rounded-full font-semibold transition-colors"
						  on:click={handleCountClick}
						  role="button"
						  tabindex="0"
						  on:keydown={(e) => e.key === 'Enter' && handleCountClick(e)}>
						{count}
					</span>
				{/if}
			</h3>
			{#if urgent && flashIf}
				<div class="bell-icon text-red-500 animate-bounce">
					<Bell size={16} />
				</div>
			{/if}
		</div>
		<div class="expand-icon text-slate-400 transition-transform duration-200" class:rotate-90={isOpen}>
			<ChevronRight size={20} />
		</div>
	</button>
	
	{#if isOpen}
		<div class="section-content border-t border-slate-100">
			<slot />
		</div>
	{/if}
</div>

<style>
	@keyframes flashRed {
		0% { color: #dc2626; }
		50% { color: #f87171; }
		100% { color: #dc2626; }
	}

	@keyframes pulseRed {
		0%, 100% { 
			background-color: #fecaca; 
			color: #dc2626;
		}
		50% { 
			background-color: #fee2e2; 
			color: #b91c1c;
		}
	}

	.text-flash-red {
		animation: flashRed 1s infinite;
	}
	
	.pulse-red {
		animation: pulseRed 1.5s infinite;
	}
	
	.section-header:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
	}
	
	.rotate-90 {
		transform: rotate(90deg);
	}
</style> 