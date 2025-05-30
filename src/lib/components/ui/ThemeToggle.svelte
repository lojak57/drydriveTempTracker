<script lang="ts">
	import { themeMode, resolvedTheme, type ThemeMode } from '$lib/stores/themeStore';
	import { Sun, Moon, Monitor } from 'lucide-svelte';

	// Get theme icons and labels
	function getThemeIcon(mode: ThemeMode) {
		switch (mode) {
			case 'light': return Sun;
			case 'dark': return Moon;
			case 'system': return Monitor;
		}
	}

	function getThemeLabel(mode: ThemeMode) {
		switch (mode) {
			case 'light': return 'Light mode';
			case 'dark': return 'Dark mode';
			case 'system': return 'System preference';
		}
	}

	function getNextMode(current: ThemeMode): ThemeMode {
		switch (current) {
			case 'light': return 'dark';
			case 'dark': return 'system';
			case 'system': return 'light';
		}
	}

	function handleToggle() {
		themeMode.toggle();
	}
</script>

<button 
	class="theme-toggle tap-target"
	on:click={handleToggle}
	title={getThemeLabel($themeMode)}
	aria-label="Toggle theme: {getThemeLabel($themeMode)}"
>
	<span class="icon-container">
		<svelte:component this={getThemeIcon($themeMode)} size={18} />
	</span>
	<span class="theme-label mobile-hide">{getThemeLabel($themeMode)}</span>
	<span class="resolved-indicator" title="Current theme: {$resolvedTheme}">
		<span class="indicator-dot {$resolvedTheme}"></span>
	</span>
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		padding: 8px 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		color: #374151;
		font-size: 14px;
		font-weight: 500;
		backdrop-filter: blur(10px);
		position: relative;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.theme-toggle {
			padding: 10px 16px;
			border-radius: 14px;
			font-size: 15px;
		}
	}

	.theme-toggle:hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(124, 179, 66, 0.3);
		transform: translateY(-1px);
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.1),
			0 1px 4px rgba(0, 0, 0, 0.05);
	}

	.theme-toggle:active {
		transform: translateY(0);
		box-shadow: 
			0 2px 6px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.theme-toggle:hover .icon-container {
		transform: scale(1.1);
	}

	.theme-label {
		font-weight: 600;
		white-space: nowrap;
		transition: opacity 0.2s ease;
	}

	.resolved-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
		padding-left: 4px;
	}

	.indicator-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		transition: all 0.2s ease;
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.8),
			0 0 0 2px rgba(0, 0, 0, 0.1);
	}

	.indicator-dot.light {
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.8),
			0 0 0 2px rgba(251, 191, 36, 0.2),
			0 0 8px rgba(251, 191, 36, 0.3);
	}

	.indicator-dot.dark {
		background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
		box-shadow: 
			0 0 0 1px rgba(255, 255, 255, 0.8),
			0 0 0 2px rgba(79, 70, 229, 0.2),
			0 0 8px rgba(79, 70, 229, 0.3);
	}

	/* Dark mode styles */
	:global(.dark) .theme-toggle {
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(255, 255, 255, 0.1);
		color: #e5e7eb;
	}

	:global(.dark) .theme-toggle:hover {
		background: rgba(0, 0, 0, 0.4);
		border-color: rgba(124, 179, 66, 0.4);
		box-shadow: 
			0 4px 12px rgba(0, 0, 0, 0.2),
			0 1px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.dark) .indicator-dot {
		box-shadow: 
			0 0 0 1px rgba(0, 0, 0, 0.8),
			0 0 0 2px rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .indicator-dot.light {
		box-shadow: 
			0 0 0 1px rgba(0, 0, 0, 0.8),
			0 0 0 2px rgba(251, 191, 36, 0.2),
			0 0 8px rgba(251, 191, 36, 0.3);
	}

	:global(.dark) .indicator-dot.dark {
		box-shadow: 
			0 0 0 1px rgba(0, 0, 0, 0.8),
			0 0 0 2px rgba(79, 70, 229, 0.2),
			0 0 8px rgba(79, 70, 229, 0.3);
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.theme-toggle {
			padding: 8px 10px;
			border-radius: 10px;
		}

		.resolved-indicator {
			padding-left: 2px;
		}
	}
</style> 