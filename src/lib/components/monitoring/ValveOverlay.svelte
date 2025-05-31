<script lang="ts">
	import { onMount } from 'svelte';

	export let top: string;
	export let left: string;
	export let label: string;
	export let status: 'open' | 'closed' | 'unknown';
	export let align: 'left' | 'right' | 'top';
	export let interactive: boolean = true;
	export let onHover: ((valveId: string) => void) | null = null;
	export let onLeave: (() => void) | null = null;
	export let onClick: (() => void) | null = null;
	export let valveId: string = '';
	export let showTooltip: boolean = false;

	// Debug positioning (keeping until confirmed working)
	console.log(`🔧 FIXED ValveOverlay: ID=${valveId}, Top=${top}, Left=${left}, Align=${align}, Status=${status}`);

	function handleMouseEnter() {
		if (onHover) onHover(valveId);
	}

	function handleMouseLeave() {
		if (onLeave) onLeave();
	}

	function handleClick() {
		if (interactive && onClick) onClick();
	}

	onMount(() => {
		console.log(`✅ ValveOverlay mounted: ${valveId} at ${top}, ${left}`);
	});
</script>

<!-- Main valve container with absolute positioning -->
<div 
	class="valve-container" 
	style="top: {top}; left: {left};"
	on:mouseenter={handleMouseEnter}
	on:mouseleave={handleMouseLeave}
	on:click={handleClick}
	role={interactive ? "button" : undefined}
	tabindex={interactive ? 0 : undefined}
>
	<!-- Valve dot (the colored circle) -->
	<div class="valve-dot {status}"></div>
	
	<!-- Line extending from dot -->
	<div class="valve-line {align}"></div>
	
	<!-- Label positioned based on alignment -->
	<div class="valve-label {align}">{label}</div>
</div>

<style>
	.valve-container {
		position: absolute;
		z-index: 10;
		cursor: pointer;
		transition: all 0.3s ease;
		/* Remove any transform origin issues */
		transform-origin: center;
	}

	.valve-container:hover {
		transform: scale(1.2);
	}

	/* The colored dot representing the valve */
	.valve-dot {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid white;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		/* Center the dot at the exact coordinates */
		top: -6px;
		left: -6px;
	}

	.valve-dot:hover {
		transform: scale(1.3);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.valve-dot.open {
		background-color: #22c55e;
		animation: pulse-open 2s infinite;
	}

	.valve-dot.closed {
		background-color: #ef4444;
	}

	.valve-dot.unknown {
		background-color: #facc15;
		animation: pulse-unknown 1.5s infinite;
	}

	@keyframes pulse-open {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.7; }
	}

	@keyframes pulse-unknown {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Line extending from the dot */
	.valve-line {
		position: absolute;
		background-color: rgba(71, 85, 105, 0.6);
		transition: background-color 0.3s ease;
	}

	.valve-container:hover .valve-line {
		background-color: rgba(71, 85, 105, 0.9);
	}

	/* Line positioning based on alignment */
	.valve-line.right {
		top: -1px;
		left: 6px;
		width: 120px;
		height: 2px;
	}

	.valve-line.left {
		top: -1px;
		left: -126px;
		width: 120px;
		height: 2px;
	}

	.valve-line.top {
		top: -126px;
		left: -1px;
		width: 2px;
		height: 120px;
	}

	/* Small connector dot at end of line */
	.valve-line::after {
		content: '';
		position: absolute;
		width: 4px;
		height: 4px;
		background: white;
		border-radius: 50%;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.valve-line.right::after {
		right: -2px;
		top: -1px;
	}

	.valve-line.left::after {
		left: -2px;
		top: -1px;
	}

	.valve-line.top::after {
		top: -2px;
		left: -1px;
	}

	/* Label positioning */
	.valve-label {
		position: absolute;
		background-color: rgba(15, 23, 42, 0.95);
		color: white;
		font-size: 11px;
		padding: 4px 8px;
		border-radius: 4px;
		font-weight: 600;
		white-space: nowrap;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.2);
		min-width: 60px;
		text-align: center;
	}

	.valve-label.right {
		top: -22px;
		left: 130px;
	}

	.valve-label.left {
		top: -22px;
		left: -190px;
	}

	.valve-label.top {
		top: -140px;
		left: -30px;
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.valve-dot {
			width: 10px;
			height: 10px;
			top: -5px;
			left: -5px;
		}

		.valve-line.right,
		.valve-line.left {
			width: 60px;
		}

		.valve-line.left {
			left: -66px;
		}

		.valve-line.top {
			height: 60px;
			top: -66px;
		}

		.valve-label {
			font-size: 10px;
			padding: 3px 6px;
			min-width: 50px;
		}

		.valve-label.right {
			left: 70px;
		}

		.valve-label.left {
			left: -120px;
		}

		.valve-label.top {
			top: -80px;
		}
	}

	@media (max-width: 480px) {
		.valve-dot {
			width: 8px;
			height: 8px;
			top: -4px;
			left: -4px;
		}

		.valve-line.right,
		.valve-line.left {
			width: 50px;
		}

		.valve-line.left {
			left: -56px;
		}

		.valve-line.top {
			height: 50px;
			top: -56px;
		}

		.valve-label {
			font-size: 9px;
			padding: 2px 4px;
			min-width: 40px;
		}

		.valve-label.right {
			left: 60px;
		}

		.valve-label.left {
			left: -100px;
		}

		.valve-label.top {
			top: -70px;
		}
	}
</style> 