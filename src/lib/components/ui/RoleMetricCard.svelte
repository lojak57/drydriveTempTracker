<script lang="ts">
	import type { MetricConfig } from '$lib/stores/roleStore';
	import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-svelte';

	interface Props {
		metric: MetricConfig;
		colorScheme?: {
			primary: string;
			secondary: string;
			accent: string;
		};
	}

	let { metric, colorScheme = { primary: '#7CB342', secondary: '#558B2F', accent: '#9CCC65' } }: Props = $props();

	function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
		switch (trend) {
			case 'up': return TrendingUp;
			case 'down': return TrendingDown;
			default: return Minus;
		}
	}

	function getTrendColor(trend?: 'up' | 'down' | 'stable') {
		switch (trend) {
			case 'up': return '#10b981';
			case 'down': return '#ef4444';
			default: return '#6b7280';
		}
	}

	function getImpactColor(impact: 'high' | 'medium' | 'low') {
		switch (impact) {
			case 'high': return '#dc2626';
			case 'medium': return '#ea580c';
			case 'low': return '#65a30d';
		}
	}

	function getPriorityScale(priority: 'hero' | 'primary' | 'secondary') {
		switch (priority) {
			case 'hero': return 1.2;
			case 'primary': return 1.0;
			case 'secondary': return 0.9;
		}
	}
</script>

<div 
	class="role-metric-card"
	class:hero={metric.priority === 'hero'}
	class:primary={metric.priority === 'primary'}
	class:secondary={metric.priority === 'secondary'}
	style="--primary-color: {colorScheme.primary}; --secondary-color: {colorScheme.secondary}; --accent-color: {colorScheme.accent}; --scale: {getPriorityScale(metric.priority)}"
>
	<div class="metric-header">
		<div class="metric-label-container">
			<span class="metric-label">{metric.label}</span>
			{#if metric.impact === 'high'}
				<div class="impact-indicator" style="color: {getImpactColor(metric.impact)}">
					<DollarSign size={14} />
				</div>
			{/if}
		</div>
		{#if metric.trend}
			<div class="trend-container" style="color: {getTrendColor(metric.trend)}">
				<svelte:component this={getTrendIcon(metric.trend)} size={16} />
				{#if metric.trendValue}
					<span class="trend-value">{metric.trendValue}</span>
				{/if}
			</div>
		{/if}
	</div>

	<div class="metric-value-container">
		<span class="metric-value">{metric.value}</span>
		{#if metric.unit}
			<span class="metric-unit">{metric.unit}</span>
		{/if}
	</div>

	{#if metric.description}
		<div class="metric-description">
			{metric.description}
		</div>
	{/if}

	{#if metric.priority === 'hero'}
		<div class="hero-glow"></div>
	{/if}
</div>

<style>
	.role-metric-card {
		position: relative;
		padding: calc(24px * var(--scale));
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: calc(20px * var(--scale));
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		min-height: calc(140px * var(--scale));
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		overflow: hidden;
	}

	.role-metric-card:hover {
		transform: translateY(calc(-4px * var(--scale)));
		box-shadow: 
			0 16px 48px rgba(0, 0, 0, 0.15),
			0 6px 16px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.role-metric-card.hero {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%);
		border: 2px solid var(--primary-color);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.12),
			0 4px 12px rgba(0, 0, 0, 0.06),
			0 0 0 1px var(--primary-color),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
	}

	.role-metric-card.hero:hover {
		transform: translateY(-6px);
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.18),
			0 8px 24px rgba(0, 0, 0, 0.1),
			0 0 0 2px var(--primary-color),
			inset 0 1px 0 rgba(255, 255, 255, 1);
	}

	.hero-glow {
		position: absolute;
		top: -50%;
		left: -50%;
		right: -50%;
		bottom: -50%;
		background: radial-gradient(circle, var(--primary-color) 0%, transparent 70%);
		opacity: 0.05;
		pointer-events: none;
		animation: heroGlow 4s ease-in-out infinite alternate;
	}

	@keyframes heroGlow {
		from {
			opacity: 0.03;
			transform: scale(0.8);
		}
		to {
			opacity: 0.08;
			transform: scale(1.2);
		}
	}

	.metric-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: calc(12px * var(--scale));
	}

	.metric-label-container {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.metric-label {
		font-size: calc(14px * var(--scale));
		font-weight: 600;
		color: #1f2937;
		line-height: 1.3;
		word-break: break-word;
	}

	.impact-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: rgba(220, 38, 38, 0.1);
		border-radius: 6px;
		border: 1px solid rgba(220, 38, 38, 0.2);
		animation: impactPulse 2s ease-in-out infinite;
	}

	@keyframes impactPulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.1);
			opacity: 0.8;
		}
	}

	.trend-container {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: calc(12px * var(--scale));
		font-weight: 600;
	}

	.trend-value {
		font-family: 'JetBrains Mono', monospace;
	}

	.metric-value-container {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-bottom: calc(8px * var(--scale));
	}

	.metric-value {
		font-size: calc(32px * var(--scale));
		font-weight: 800;
		color: #0f172a;
		line-height: 1;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		word-break: break-all;
	}

	.role-metric-card.hero .metric-value {
		background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.metric-unit {
		font-size: calc(16px * var(--scale));
		font-weight: 600;
		color: #475569;
		margin-left: 2px;
	}

	.metric-description {
		font-size: calc(11px * var(--scale));
		font-weight: 500;
		color: #0f172a;
		line-height: 1.4;
		background: rgba(124, 179, 66, 0.12);
		padding: calc(8px * var(--scale));
		border-radius: calc(8px * var(--scale));
		border: 1px solid rgba(124, 179, 66, 0.25);
		margin-top: auto;
	}

	.role-metric-card.hero .metric-description {
		background: linear-gradient(135deg, rgba(124, 179, 66, 0.12) 0%, rgba(85, 139, 47, 0.08) 100%);
		border-color: rgba(124, 179, 66, 0.25);
		font-weight: 600;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.role-metric-card {
			padding: calc(20px * var(--scale));
			min-height: calc(120px * var(--scale));
		}

		.metric-value {
			font-size: calc(28px * var(--scale));
		}

		.metric-label {
			font-size: calc(13px * var(--scale));
		}

		.metric-description {
			font-size: calc(10px * var(--scale));
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.role-metric-card {
			background: rgba(30, 30, 30, 0.95);
			border-color: rgba(255, 255, 255, 0.1);
		}

		.metric-label {
			color: #f3f4f6;
		}

		.metric-value {
			color: #ffffff;
		}

		.metric-unit {
			color: #9ca3af;
		}

		.metric-description {
			background: rgba(124, 179, 66, 0.15);
			color: #9CCC65;
		}
	}
</style> 