<script lang="ts">
	import { fleetStats, costBreakdown, fleetData } from '$lib/stores/calibrationData';
	import { onMount } from 'svelte';

	let animatedCalibrationsAvoided = 0;
	let animatedMoneySaved = 0;
	let isAnimating = false;

	// Animation for counters
	function animateCounter(start: number, end: number, duration: number, callback: (value: number) => void) {
		const startTime = performance.now();
		const diff = end - start;
		
		function update(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Easing function
			const easeOut = 1 - Math.pow(1 - progress, 3);
			const current = start + (diff * easeOut);
			
			callback(Math.round(current));
			
			if (progress < 1) {
				requestAnimationFrame(update);
			}
		}
		
		requestAnimationFrame(update);
	}

	// React to fleet stats changes
	$: if ($fleetStats && !isAnimating) {
		isAnimating = true;
		
		animateCounter(animatedCalibrationsAvoided, $fleetStats.calibrationsAvoided, 1500, (value) => {
			animatedCalibrationsAvoided = value;
		});
		
		animateCounter(animatedMoneySaved, $fleetStats.moneySaved, 2000, (value) => {
			animatedMoneySaved = value;
			if (value === $fleetStats.moneySaved) {
				isAnimating = false;
			}
		});
	}

	// Get next recommended calibrations
	$: nextRecommendations = $fleetData
		.filter(truck => truck.status !== 'good')
		.sort((a, b) => {
			// Sort by priority: critical first, then by delta magnitude
			if (a.status === 'critical' && b.status !== 'critical') return -1;
			if (b.status === 'critical' && a.status !== 'critical') return 1;
			return Math.abs(b.avgLoadDelta) - Math.abs(a.avgLoadDelta);
		})
		.slice(0, 5); // Top 5 recommendations

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatDelta(delta: number): string {
		const sign = delta >= 0 ? '+' : '';
		return `${sign}${delta.toFixed(2)}%`;
	}

	function getPriorityLevel(truck: any): 'high' | 'medium' | 'low' {
		if (truck.status === 'critical') return 'high';
		if (Math.abs(truck.avgLoadDelta) > 0.3) return 'medium';
		return 'low';
	}

	function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
		switch (priority) {
			case 'high': return '#ef4444';
			case 'medium': return '#f59e0b';
			case 'low': return '#3b82f6';
		}
	}

	function getEstimatedDaysUntilCalibration(truck: any): number {
		// Simulate estimation based on current delta trend
		const baseDays = truck.status === 'critical' ? 0 : 
						truck.status === 'warning' ? Math.floor(Math.random() * 7) + 1 :
						Math.floor(Math.random() * 14) + 7;
		return baseDays;
	}
</script>

<div class="optimization-panel">
	<div class="panel-header">
		<h3 class="panel-title">🧠 Smart Meter Sync Optimization</h3>
		<div class="optimization-badge">
			<span class="badge-text">40% Efficiency Gain</span>
		</div>
	</div>

	<!-- Live Counters Section -->
	<div class="counters-section">
		<div class="counter-card avoided">
			<div class="counter-icon">❌</div>
			<div class="counter-content">
				<div class="counter-label">Calibrations Avoided</div>
				<div class="counter-value">{animatedCalibrationsAvoided.toLocaleString()}</div>
				<div class="counter-sublabel">This month</div>
			</div>
			<div class="counter-trend positive">
				<span class="trend-icon">📈</span>
				<span class="trend-text">+{$fleetStats.calibrationsAvoided}</span>
			</div>
		</div>

		<div class="counter-card savings">
			<div class="counter-icon">💰</div>
			<div class="counter-content">
				<div class="counter-label">Money Saved</div>
				<div class="counter-value">{formatCurrency(animatedMoneySaved)}</div>
				<div class="counter-sublabel">This month</div>
			</div>
			<div class="counter-trend positive">
				<span class="trend-icon">💸</span>
				<span class="trend-text">vs manual schedule</span>
			</div>
		</div>

		<div class="counter-card efficiency">
			<div class="counter-icon">⚡</div>
			<div class="counter-content">
				<div class="counter-label">Fleet Efficiency</div>
				<div class="counter-value">{(($fleetStats.good / $fleetStats.total) * 100).toFixed(1)}%</div>
				<div class="counter-sublabel">Trucks in optimal range</div>
			</div>
			<div class="counter-trend {($fleetStats.good / $fleetStats.total) > 0.8 ? 'positive' : 'warning'}">
				<span class="trend-icon">{($fleetStats.good / $fleetStats.total) > 0.8 ? '✅' : '⚠️'}</span>
				<span class="trend-text">{$fleetStats.good}/{$fleetStats.total} trucks</span>
			</div>
		</div>
	</div>

	<!-- Next Recommendations Section -->
	<div class="recommendations-section">
		<div class="recommendations-header">
			<h4 class="recommendations-title">🎯 Next Recommended Calibrations</h4>
			<div class="recommendations-count">
				{nextRecommendations.length} pending
			</div>
		</div>

		<div class="recommendations-list">
			{#each nextRecommendations as truck, index (truck.id)}
				{@const priority = getPriorityLevel(truck)}
				{@const estimatedDays = getEstimatedDaysUntilCalibration(truck)}
				<div class="recommendation-item" class:high={priority === 'high'} class:medium={priority === 'medium'} class:low={priority === 'low'}>
					<div class="recommendation-priority">
						<div class="priority-indicator" style="background-color: {getPriorityColor(priority)}">
							{index + 1}
						</div>
					</div>
					
					<div class="recommendation-content">
						<div class="truck-info">
							<span class="truck-id">{truck.id}</span>
							<span class="truck-status" class:critical={truck.status === 'critical'} class:warning={truck.status === 'warning'}>
								{truck.status === 'critical' ? '🔴 Critical' : '⚠️ Warning'}
							</span>
						</div>
						<div class="recommendation-details">
							<span class="delta-info">Delta: {formatDelta(truck.avgLoadDelta)}</span>
							<span class="timing-info">
								{#if estimatedDays === 0}
									Immediate action required
								{:else}
									Recommended within {estimatedDays} days
								{/if}
							</span>
						</div>
					</div>
					
					<div class="recommendation-actions">
						<button class="schedule-btn" class:urgent={priority === 'high'}>
							{#if priority === 'high'}
								🚨 Schedule Now
							{:else}
								📅 Schedule
							{/if}
						</button>
					</div>
				</div>
			{/each}
		</div>

		{#if nextRecommendations.length === 0}
			<div class="no-recommendations">
				<div class="no-rec-icon">🎉</div>
				<div class="no-rec-text">
					<h4>All trucks are optimally calibrated!</h4>
					<p>No immediate calibrations needed. The system will continue monitoring.</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Smart Insights Section -->
	<div class="insights-section">
		<div class="insight-header">
			<h4 class="insight-title">🔍 Smart Insights</h4>
		</div>
		
		<div class="insights-grid">
			<div class="insight-card">
				<div class="insight-icon">🎯</div>
				<div class="insight-content">
					<div class="insight-metric">{(($costBreakdown.annualSavings / $costBreakdown.annualTotal) * 100).toFixed(0)}%</div>
					<div class="insight-label">Cost Reduction</div>
				</div>
			</div>
			
			<div class="insight-card">
				<div class="insight-icon">📊</div>
				<div class="insight-content">
					<div class="insight-metric">{$fleetStats.avgDelta.toFixed(3)}%</div>
					<div class="insight-label">Avg Fleet Delta</div>
				</div>
			</div>
			
			<div class="insight-card">
				<div class="insight-icon">🔄</div>
				<div class="insight-content">
					<div class="insight-metric">{Math.round($fleetStats.calibrationsAvoided / ($fleetStats.total / 12))}x</div>
					<div class="insight-label">Efficiency Multiplier</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Krohne Integration Callout -->
	<div class="integration-callout">
		<div class="callout-icon">🏭</div>
		<div class="callout-content">
			<h4>Powered by Advanced Diagnostics</h4>
			<p>VeriHaul integrates with Krohne's Opticheck technology for real-time Coriolis meter diagnostics and predictive maintenance.</p>
			<button class="learn-more-btn">Learn More About Integration</button>
		</div>
	</div>
</div>

<style>
	.optimization-panel {
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.panel-header {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.panel-title {
		font-size: 20px;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
	}

	.optimization-badge {
		background: linear-gradient(135deg, #059669, #047857);
		color: white;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
	}

	.counters-section {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		padding: 20px;
		background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	}

	.counter-card {
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 12px;
		padding: 20px;
		position: relative;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.counter-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.counter-card.avoided {
		border-left: 4px solid #ef4444;
	}

	.counter-card.savings {
		border-left: 4px solid #22c55e;
	}

	.counter-card.efficiency {
		border-left: 4px solid #3b82f6;
	}

	.counter-icon {
		font-size: 24px;
		margin-bottom: 12px;
	}

	.counter-label {
		font-size: 13px;
		color: #64748b;
		margin-bottom: 6px;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.counter-value {
		font-size: 28px;
		font-weight: 800;
		color: #0f172a;
		margin-bottom: 4px;
		font-family: 'JetBrains Mono', monospace;
	}

	.counter-sublabel {
		font-size: 11px;
		color: #94a3b8;
		margin-bottom: 8px;
	}

	.counter-trend {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 11px;
		font-weight: 500;
	}

	.counter-trend.positive {
		color: #16a34a;
	}

	.counter-trend.warning {
		color: #d97706;
	}

	.recommendations-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.recommendations-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.recommendations-title {
		font-size: 16px;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}

	.recommendations-count {
		background: rgba(59, 130, 246, 0.1);
		color: #3b82f6;
		padding: 4px 8px;
		border-radius: 12px;
		font-size: 12px;
		font-weight: 600;
	}

	.recommendations-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-height: 300px;
		overflow-y: auto;
	}

	.recommendation-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.recommendation-item:hover {
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.recommendation-item.high {
		border-left: 4px solid #ef4444;
	}

	.recommendation-item.medium {
		border-left: 4px solid #f59e0b;
	}

	.recommendation-item.low {
		border-left: 4px solid #3b82f6;
	}

	.priority-indicator {
		width: 28px;
		height: 28px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-weight: 700;
		font-size: 12px;
	}

	.recommendation-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.truck-info {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.truck-id {
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
		color: #0f172a;
	}

	.truck-status {
		font-size: 11px;
		font-weight: 500;
		padding: 2px 6px;
		border-radius: 8px;
	}

	.truck-status.critical {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.truck-status.warning {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
	}

	.recommendation-details {
		display: flex;
		gap: 12px;
		font-size: 12px;
		color: #64748b;
	}

	.delta-info {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
	}

	.schedule-btn {
		padding: 6px 12px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 6px;
		background: #3b82f6;
		color: white;
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.schedule-btn.urgent {
		background: #ef4444;
		animation: pulse 2s infinite;
	}

	.schedule-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}

	.no-recommendations {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: rgba(34, 197, 94, 0.05);
		border: 1px solid rgba(34, 197, 94, 0.1);
		border-radius: 8px;
		text-align: left;
	}

	.no-rec-icon {
		font-size: 32px;
	}

	.no-rec-text h4 {
		color: #16a34a;
		margin: 0 0 4px 0;
		font-size: 14px;
	}

	.no-rec-text p {
		color: #64748b;
		margin: 0;
		font-size: 12px;
	}

	.insights-section {
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	}

	.insight-header {
		margin-bottom: 16px;
	}

	.insight-title {
		font-size: 16px;
		font-weight: 600;
		color: #0f172a;
		margin: 0;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}

	.insight-card {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(0, 0, 0, 0.05);
		border-radius: 8px;
	}

	.insight-icon {
		font-size: 20px;
	}

	.insight-metric {
		font-size: 18px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.insight-label {
		font-size: 11px;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.integration-callout {
		padding: 20px;
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		border-top: 1px solid rgba(59, 130, 246, 0.2);
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.callout-icon {
		font-size: 32px;
	}

	.callout-content {
		flex: 1;
	}

	.callout-content h4 {
		color: #1e40af;
		margin: 0 0 6px 0;
		font-size: 14px;
	}

	.callout-content p {
		color: #1e40af;
		margin: 0 0 10px 0;
		font-size: 12px;
		line-height: 1.4;
	}

	.learn-more-btn {
		padding: 6px 12px;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.learn-more-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.counters-section {
			grid-template-columns: 1fr;
		}

		.insights-grid {
			grid-template-columns: 1fr;
		}

		.recommendation-item {
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}

		.integration-callout {
			flex-direction: column;
			text-align: center;
		}
	}
</style> 