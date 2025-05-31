<script lang="ts">
	import { costBreakdown, calibrationConfig } from '$lib/stores/calibrationData';
	import { onMount, onDestroy } from 'svelte';

	let animatedMonthly = 0;
	let animatedAnnual = 0;
	let animatedSavings = 0;
	let animationRunning = false;
	let animationTimeouts: number[] = [];
	let lastAnimatedValues = { monthly: 0, annual: 0, savings: 0 };

	// Clean up function
	function cleanupAnimations() {
		animationTimeouts.forEach(timeout => clearTimeout(timeout));
		animationTimeouts = [];
		animationRunning = false;
	}

	// Animation utility with proper cleanup
	function animateValue(
		start: number, 
		end: number, 
		duration: number, 
		callback: (value: number) => void,
		onComplete?: () => void
	) {
		const startTime = performance.now();
		const diff = end - start;
		let animationId: number;
		
		function update(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			
			// Easing function for smooth animation
			const easeOut = 1 - Math.pow(1 - progress, 3);
			const current = start + (diff * easeOut);
			
			callback(Math.round(current));
			
			if (progress < 1) {
				animationId = requestAnimationFrame(update);
			} else {
				onComplete?.();
			}
		}
		
		animationId = requestAnimationFrame(update);
		
		// Return cleanup function
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	}

	// Debounced animation trigger
	let animationTimeout: number;
	function triggerAnimations() {
		if (!$costBreakdown || animationRunning) return;
		
		// Clear any pending animation
		if (animationTimeout) {
			clearTimeout(animationTimeout);
		}
		
		// Debounce animations to prevent rapid firing
		animationTimeout = setTimeout(() => {
			// Check if values actually changed to avoid unnecessary animations
			const valuesChanged = 
				lastAnimatedValues.monthly !== $costBreakdown.monthlyTotal ||
				lastAnimatedValues.annual !== $costBreakdown.annualTotal ||
				lastAnimatedValues.savings !== $costBreakdown.annualSavings;
				
			if (!valuesChanged) return;
			
			cleanupAnimations();
			animationRunning = true;
			
			let completedAnimations = 0;
			const totalAnimations = 3;
			
			function onAnimationComplete() {
				completedAnimations++;
				if (completedAnimations === totalAnimations) {
					animationRunning = false;
					// Store last animated values
					lastAnimatedValues = {
						monthly: $costBreakdown.monthlyTotal,
						annual: $costBreakdown.annualTotal,
						savings: $costBreakdown.annualSavings
					};
				}
			}

			// Start animations with cleanup tracking
			const cleanup1 = animateValue(animatedMonthly, $costBreakdown.monthlyTotal, 1200, (value) => {
				animatedMonthly = value;
			}, onAnimationComplete);
			
			const cleanup2 = animateValue(animatedAnnual, $costBreakdown.annualTotal, 1500, (value) => {
				animatedAnnual = value;
			}, onAnimationComplete);
			
			const cleanup3 = animateValue(animatedSavings, $costBreakdown.annualSavings, 1800, (value) => {
				animatedSavings = value;
			}, onAnimationComplete);
			
			// Store cleanup functions
			animationTimeouts.push(
				setTimeout(cleanup1, 1300),
				setTimeout(cleanup2, 1600),
				setTimeout(cleanup3, 1900)
			);
		}, 100); // 100ms debounce
	}

	// React to cost changes with debouncing
	$: if ($costBreakdown) {
		triggerAnimations();
	}

	// Initialize animated values on mount
	onMount(() => {
		if ($costBreakdown) {
			animatedMonthly = $costBreakdown.monthlyTotal;
			animatedAnnual = $costBreakdown.annualTotal;
			animatedSavings = $costBreakdown.annualSavings;
			lastAnimatedValues = {
				monthly: $costBreakdown.monthlyTotal,
				annual: $costBreakdown.annualTotal,
				savings: $costBreakdown.annualSavings
			};
		}
	});

	// Clean up on destroy
	onDestroy(() => {
		cleanupAnimations();
		if (animationTimeout) {
			clearTimeout(animationTimeout);
		}
	});

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	function formatPercentage(value: number): string {
		return `${(value * 100).toFixed(1)}%`;
	}
</script>

<div class="cost-table-container">
	<div class="table-header">
		<h3 class="table-title">Calibration Cost Analysis</h3>
		<div class="comparison-toggle">
			<span class="current-model">Current Model</span>
			<span class="vs">vs</span>
			<span class="optimized-model">VeriHaul Optimization</span>
		</div>
	</div>

	<!-- Cost Breakdown Table -->
	<div class="excel-table">
		<div class="table-row header-row">
			<div class="table-cell item-header">Cost Component</div>
			<div class="table-cell value-header">Current Model</div>
			<div class="table-cell value-header optimized">VeriHaul Optimized</div>
			<div class="table-cell value-header savings">Savings</div>
		</div>

		<div class="table-row">
			<div class="table-cell item">Fleet Size</div>
			<div class="table-cell value">{$calibrationConfig.fleetSize.toLocaleString()} trucks</div>
			<div class="table-cell value optimized">{$calibrationConfig.fleetSize.toLocaleString()} trucks</div>
			<div class="table-cell value savings">-</div>
		</div>

		<div class="table-row">
			<div class="table-cell item">Calibration Frequency</div>
			<div class="table-cell value">Monthly</div>
			<div class="table-cell value optimized">As-Needed</div>
			<div class="table-cell value savings">40% reduction</div>
		</div>

		<div class="table-row">
			<div class="table-cell item">Time per Truck</div>
			<div class="table-cell value">{$calibrationConfig.timePerTruck} days</div>
			<div class="table-cell value optimized">{$calibrationConfig.timePerTruck} days</div>
			<div class="table-cell value savings">-</div>
		</div>

		<div class="table-row">
			<div class="table-cell item">Hourly Cost</div>
			<div class="table-cell value">{formatCurrency($calibrationConfig.hourlyRate)}/hr</div>
			<div class="table-cell value optimized">{formatCurrency($calibrationConfig.hourlyRate)}/hr</div>
			<div class="table-cell value savings">-</div>
		</div>

		<div class="table-row">
			<div class="table-cell item">Hours per Calibration</div>
			<div class="table-cell value">{$calibrationConfig.hoursPerDay} hours</div>
			<div class="table-cell value optimized">{$calibrationConfig.hoursPerDay} hours</div>
			<div class="table-cell value savings">-</div>
		</div>

		<div class="table-row highlight">
			<div class="table-cell item important">Cost per Truck</div>
			<div class="table-cell value important">{formatCurrency($costBreakdown.costPerTruck)}</div>
			<div class="table-cell value optimized important">{formatCurrency($costBreakdown.costPerTruck)}</div>
			<div class="table-cell value savings important">-</div>
		</div>

		<div class="table-row total-row">
			<div class="table-cell item total">Monthly Cost</div>
			<div class="table-cell value total animated">
				{formatCurrency(animatedMonthly)}
			</div>
			<div class="table-cell value optimized total">
				{formatCurrency($costBreakdown.optimizedMonthly)}
			</div>
			<div class="table-cell value savings total positive">
				{formatCurrency($costBreakdown.monthlySavings)}
			</div>
		</div>

		<div class="table-row total-row annual">
			<div class="table-cell item total">Annual Cost</div>
			<div class="table-cell value total animated">
				{formatCurrency(animatedAnnual)}
			</div>
			<div class="table-cell value optimized total">
				{formatCurrency($costBreakdown.optimizedAnnual)}
			</div>
			<div class="table-cell value savings total positive animated-savings">
				{formatCurrency(animatedSavings)}
			</div>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="summary-cards">
		<div class="summary-card current">
			<div class="card-label">Current Annual Cost</div>
			<div class="card-value">{formatCurrency($costBreakdown.annualTotal)}</div>
		</div>
		<div class="summary-card optimized">
			<div class="card-label">With VeriHaul</div>
			<div class="card-value">{formatCurrency($costBreakdown.optimizedAnnual)}</div>
		</div>
		<div class="summary-card savings">
			<div class="card-label">Annual Savings</div>
			<div class="card-value positive">{formatCurrency($costBreakdown.annualSavings)}</div>
			<div class="card-subtitle">40% reduction</div>
		</div>
	</div>
</div>

<style>
	.cost-table-container {
		background: rgba(255, 255, 255, 0.98);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
	}

	.table-header {
		background: linear-gradient(135deg, #f8fafc, #e2e8f0);
		padding: 20px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.table-title {
		font-size: 20px;
		font-weight: 700;
		color: #0f172a;
		margin: 0;
	}

	.comparison-toggle {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 14px;
		font-weight: 500;
	}

	.current-model {
		color: #dc2626;
		background: rgba(220, 38, 38, 0.1);
		padding: 4px 8px;
		border-radius: 4px;
	}

	.vs {
		color: #64748b;
		font-weight: 400;
	}

	.optimized-model {
		color: #059669;
		background: rgba(5, 150, 105, 0.1);
		padding: 4px 8px;
		border-radius: 4px;
	}

	.excel-table {
		display: flex;
		flex-direction: column;
	}

	.table-row {
		display: grid;
		grid-template-columns: 2fr 1.5fr 1.5fr 1.2fr;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		transition: background-color 0.2s ease;
	}

	.table-row:hover:not(.header-row) {
		background: rgba(59, 130, 246, 0.02);
	}

	.table-row.highlight {
		background: rgba(248, 250, 252, 0.8);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.table-row.total-row {
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
		border-top: 2px solid rgba(0, 0, 0, 0.15);
		border-bottom: none;
	}

	.table-row.annual {
		background: linear-gradient(135deg, #dbeafe, #bfdbfe);
		border-top: 1px solid rgba(59, 130, 246, 0.2);
	}

	.table-cell {
		padding: 14px 16px;
		display: flex;
		align-items: center;
		font-size: 14px;
		border-right: 1px solid rgba(0, 0, 0, 0.05);
	}

	.table-cell:last-child {
		border-right: none;
	}

	.header-row .table-cell {
		background: #f8fafc;
		font-weight: 600;
		color: #475569;
		font-size: 13px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.item-header {
		background: linear-gradient(135deg, #f1f5f9, #e2e8f0) !important;
	}

	.value-header.optimized {
		background: rgba(5, 150, 105, 0.05) !important;
		color: #059669 !important;
	}

	.value-header.savings {
		background: rgba(34, 197, 94, 0.05) !important;
		color: #16a34a !important;
	}

	.table-cell.item {
		font-weight: 500;
		color: #334155;
	}

	.table-cell.value {
		font-weight: 600;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.table-cell.optimized {
		color: #059669;
		background: rgba(5, 150, 105, 0.02);
	}

	.table-cell.savings {
		color: #16a34a;
		background: rgba(34, 197, 94, 0.02);
	}

	.table-cell.important {
		font-size: 15px;
		font-weight: 700;
	}

	.table-cell.total {
		font-size: 16px;
		font-weight: 700;
	}

	.table-cell.positive {
		color: #16a34a !important;
	}

	.animated {
		position: relative;
	}

	.animated::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
		animation: shimmer 2s ease-out;
	}

	.animated-savings {
		position: relative;
	}

	.animated-savings::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.15), transparent);
		animation: shimmer 2s ease-out;
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	.summary-cards {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		padding: 20px;
		background: linear-gradient(135deg, #f8fafc, #f1f5f9);
	}

	.summary-card {
		padding: 16px;
		border-radius: 8px;
		text-align: center;
		border: 1px solid rgba(0, 0, 0, 0.05);
		transition: transform 0.2s ease;
	}

	.summary-card:hover {
		transform: translateY(-2px);
	}

	.summary-card.current {
		background: rgba(239, 68, 68, 0.05);
		border-color: rgba(239, 68, 68, 0.1);
	}

	.summary-card.optimized {
		background: rgba(5, 150, 105, 0.05);
		border-color: rgba(5, 150, 105, 0.1);
	}

	.summary-card.savings {
		background: rgba(34, 197, 94, 0.05);
		border-color: rgba(34, 197, 94, 0.1);
	}

	.card-label {
		font-size: 13px;
		font-weight: 500;
		color: #64748b;
		margin-bottom: 6px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.card-value {
		font-size: 18px;
		font-weight: 700;
		color: #0f172a;
		font-family: 'JetBrains Mono', monospace;
	}

	.card-value.positive {
		color: #16a34a;
	}

	.card-subtitle {
		font-size: 12px;
		color: #16a34a;
		margin-top: 4px;
		font-weight: 500;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.table-header {
			flex-direction: column;
			gap: 12px;
			align-items: flex-start;
		}

		.table-row {
			grid-template-columns: 1fr;
			gap: 8px;
		}

		.table-cell {
			padding: 10px 16px;
			border-right: none;
			border-bottom: 1px solid rgba(0, 0, 0, 0.05);
			justify-content: space-between;
		}

		.table-cell.item::after {
			content: attr(data-label);
			font-weight: 400;
			color: #64748b;
		}

		.summary-cards {
			grid-template-columns: 1fr;
		}
	}
</style> 