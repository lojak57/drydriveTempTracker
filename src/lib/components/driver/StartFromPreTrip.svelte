<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let afterPreTripSubmit: boolean = false;
	export let targetSection: string = 'dashboard-top';
	export let scrollDelay: number = 100;

	onMount(() => {
		if (afterPreTripSubmit) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				scrollToTarget();
			}, scrollDelay);
		}
	});

	function scrollToTarget() {
		const element = document.getElementById(targetSection);
		
		if (element) {
			element.scrollIntoView({ 
				behavior: 'smooth', 
				block: 'start' 
			});
		} else {
			// Fallback: scroll to top of page
			window.scrollTo({ 
				top: 0, 
				behavior: 'smooth' 
			});
		}

		// Dispatch event for any additional handling
		dispatch('scroll-complete', { targetSection });
	}

	// Export function for manual triggering
	export function triggerScroll() {
		scrollToTarget();
	}
</script>

<!-- This component doesn't render anything, it just handles scroll logic -->
<div class="hidden"></div> 