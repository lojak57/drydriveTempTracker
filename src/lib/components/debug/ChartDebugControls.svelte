<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let paddingLeft: number = 15;
	export let paddingRight: number = 15;
	export let paddingTop: number = 15;
	export let paddingBottom: number = 50;
	
	const dispatch = createEventDispatcher();
	
	function adjustPadding(direction: 'left' | 'right' | 'top' | 'bottom', delta: number) {
		switch (direction) {
			case 'left':
				paddingLeft = Math.max(0, paddingLeft + delta);
				break;
			case 'right':
				paddingRight = Math.max(0, paddingRight + delta);
				break;
			case 'top':
				paddingTop = Math.max(0, paddingTop + delta);
				break;
			case 'bottom':
				paddingBottom = Math.max(0, paddingBottom + delta);
				break;
		}
		
		// Dispatch updated values
		dispatch('update', {
			paddingLeft,
			paddingRight,
			paddingTop,
			paddingBottom
		});
	}
	
	function handleClose() {
		dispatch('close');
	}
</script>

<div class="debug-controls">
	<div class="debug-header">
		<div class="header-top">
			<h4>Chart Position Debug</h4>
			<button class="close-btn" on:click={handleClose}>✕</button>
		</div>
		<div class="instruction-text">
			Adjust chart padding in real-time
		</div>
		<div class="padding-display">
			L:{paddingLeft} R:{paddingRight} T:{paddingTop} B:{paddingBottom}
		</div>
	</div>
	
	<div class="control-grid">
		<!-- Top controls -->
		<div class="control-row">
			<button class="pos-btn" on:click={() => adjustPadding('top', -5)}>▲-</button>
			<span class="label">TOP</span>
			<button class="pos-btn" on:click={() => adjustPadding('top', 5)}>▲+</button>
		</div>
		
		<!-- Left controls -->
		<div class="control-row">
			<button class="pos-btn" on:click={() => adjustPadding('left', -5)}>◀-</button>
			<span class="label">LEFT</span>
			<button class="pos-btn" on:click={() => adjustPadding('left', 5)}>◀+</button>
		</div>
		
		<!-- Right controls -->
		<div class="control-row">
			<button class="pos-btn" on:click={() => adjustPadding('right', -5)}>▶-</button>
			<span class="label">RIGHT</span>
			<button class="pos-btn" on:click={() => adjustPadding('right', 5)}>▶+</button>
		</div>
		
		<!-- Bottom controls -->
		<div class="control-row">
			<button class="pos-btn" on:click={() => adjustPadding('bottom', -5)}>▼-</button>
			<span class="label">BOTTOM</span>
			<button class="pos-btn" on:click={() => adjustPadding('bottom', 5)}>▼+</button>
		</div>
		
		<!-- Reset button -->
		<div class="control-row">
			<button 
				class="reset-btn" 
				on:click={() => {
					paddingLeft = 15;
					paddingRight = 15;
					paddingTop = 15;
					paddingBottom = 50;
					dispatch('update', { paddingLeft, paddingRight, paddingTop, paddingBottom });
				}}
			>
				RESET
			</button>
		</div>
	</div>
</div>

<style>
	.debug-controls {
		background: rgba(0, 0, 0, 0.9);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 16px;
		font-family: 'JetBrains Mono', monospace;
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		min-width: 200px;
	}
	
	.debug-header {
		margin-bottom: 16px;
		text-align: center;
	}
	
	.header-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	
	.debug-header h4 {
		color: #ffffff;
		font-size: 12px;
		font-weight: 600;
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.instruction-text {
		color: rgba(255, 255, 255, 0.7);
		font-size: 10px;
		font-weight: 500;
		margin-bottom: 8px;
	}
	
	.padding-display {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 6px 8px;
		font-size: 10px;
		color: rgba(255, 255, 255, 0.8);
		font-weight: 500;
	}
	
	.control-grid {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.control-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
	}
	
	.label {
		color: rgba(255, 255, 255, 0.7);
		font-size: 10px;
		font-weight: 500;
		min-width: 40px;
		text-align: center;
	}
	
	.pos-btn {
		width: 32px;
		height: 24px;
		background: rgba(59, 130, 246, 0.2);
		border: 1px solid rgba(59, 130, 246, 0.4);
		border-radius: 4px;
		color: #60a5fa;
		font-size: 10px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.pos-btn:hover {
		background: rgba(59, 130, 246, 0.3);
		border-color: rgba(59, 130, 246, 0.6);
		transform: scale(1.05);
	}
	
	.pos-btn:active {
		transform: scale(0.95);
	}
	
	.reset-btn {
		width: 100%;
		height: 28px;
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		border-radius: 6px;
		color: #f87171;
		font-size: 10px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		letter-spacing: 0.5px;
	}
	
	.reset-btn:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.6);
		transform: scale(1.02);
	}
	
	.close-btn {
		width: 20px;
		height: 20px;
		background: rgba(239, 68, 68, 0.2);
		border: 1px solid rgba(239, 68, 68, 0.4);
		border-radius: 4px;
		color: #f87171;
		font-size: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.close-btn:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: rgba(239, 68, 68, 0.6);
		transform: scale(1.1);
	}
</style> 