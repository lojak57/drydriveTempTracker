<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();

	export let activeSection: string = 'pretrip';
	
	const navItems = [
		{ id: 'pretrip', label: 'Pre-Trip', icon: '✅' },
		{ id: 'schedule', label: 'Schedule', icon: '📅' },
		{ id: 'routes', label: 'Routes', icon: '🗺️' },
		{ id: 'performance', label: 'Performance', icon: '📊' }
	];

	function handleNavClick(sectionId: string) {
		activeSection = sectionId;
		dispatch('navigate', { section: sectionId });
		
		// Smooth scroll to section
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({ 
				behavior: 'smooth', 
				block: 'start' 
			});
		}
	}
</script>

<header class="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10 shadow-lg">
	<div class="container mx-auto px-4 py-3">
		<nav class="flex justify-between items-center max-w-4xl mx-auto">
			{#each navItems as item}
				<button
					class="group flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-oil-orange/50 min-w-[44px] touch-manipulation"
					class:active={activeSection === item.id}
					on:click={() => handleNavClick(item.id)}
				>
					<span class="text-lg group-hover:scale-110 transition-transform duration-200">
						{item.icon}
					</span>
					<span class="text-xs font-medium text-white group-hover:text-oil-orange transition-colors duration-200"
						  class:text-oil-orange={activeSection === item.id}>
						{item.label}
					</span>
				</button>
			{/each}
		</nav>
	</div>
</header>

<style>
	.active {
		@apply bg-oil-orange/20 text-oil-orange;
	}
	
	.active span {
		@apply text-oil-orange;
	}
	
	/* Mobile optimization */
	@media (max-width: 640px) {
		nav {
			gap: 0.25rem;
		}
		
		button {
			padding: 0.5rem 0.25rem;
			min-width: 60px;
		}
		
		span.text-xs {
			font-size: 0.625rem;
		}
	}
</style> 