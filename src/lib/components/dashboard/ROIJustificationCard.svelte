<script lang="ts">
	import { TrendingUp, DollarSign, Calendar } from 'lucide-svelte';

	export let downpayment: number = 485000;
	export let loadRate: number = 175; // Revenue per load
	export let currentLoadsPerWeek: number = 24;
	export let addedLoadsPerWeek: number = 3;
	export let title: string = "DryDrive ROI Justification";

	// Calculations
	$: projectedLoadsPerWeek = currentLoadsPerWeek + addedLoadsPerWeek;
	$: additionalWeeklyRevenue = addedLoadsPerWeek * loadRate;
	$: additionalAnnualRevenue = additionalWeeklyRevenue * 52;
	$: breakEvenWeeks = Math.ceil(downpayment / additionalWeeklyRevenue);
	$: firstYearROI = additionalAnnualRevenue - downpayment;
	$: roiPercentage = ((firstYearROI / downpayment) * 100);

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(amount);
	}

	// Format percentage
	function formatPercentage(percentage: number): string {
		return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
	}
</script>

<div class="roi-card bg-gradient-to-br from-white via-oil-gray/5 to-oil-orange/5 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
	<!-- Header -->
	<div class="flex items-center gap-3 mb-6">
		<div class="w-10 h-10 bg-oil-orange/20 rounded-lg flex items-center justify-center">
			<TrendingUp class="w-5 h-5 text-oil-orange" />
		</div>
		<div>
			<h3 class="text-lg font-semibold text-oil-black">{title}</h3>
			<p class="text-sm text-oil-gray">Smart load optimization impact</p>
		</div>
	</div>

	<!-- Load Improvement -->
	<div class="grid grid-cols-2 gap-4 mb-6">
		<div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
			<div class="text-2xl font-bold text-blue-600">{currentLoadsPerWeek}</div>
			<div class="text-xs text-blue-700 font-medium">Current Loads/Week</div>
		</div>
		<div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
			<div class="text-2xl font-bold text-green-600">{projectedLoadsPerWeek}</div>
			<div class="text-xs text-green-700 font-medium">Projected Loads/Week</div>
		</div>
	</div>

	<!-- Revenue Impact -->
	<div class="space-y-4 mb-6">
		<div class="flex justify-between items-center py-2 border-b border-gray-200">
			<span class="text-sm font-medium text-oil-gray">Additional loads/week:</span>
			<span class="text-sm font-bold text-oil-black">+{addedLoadsPerWeek} loads</span>
		</div>
		<div class="flex justify-between items-center py-2 border-b border-gray-200">
			<span class="text-sm font-medium text-oil-gray">Additional weekly revenue:</span>
			<span class="text-sm font-bold text-green-600">{formatCurrency(additionalWeeklyRevenue)}/week</span>
		</div>
		<div class="flex justify-between items-center py-2 border-b border-gray-200">
			<span class="text-sm font-medium text-oil-gray">Additional annual revenue:</span>
			<span class="text-sm font-bold text-green-600">{formatCurrency(additionalAnnualRevenue)}/year</span>
		</div>
	</div>

	<!-- Key Metrics -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
		<div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
			<div class="flex items-center justify-center gap-2 mb-2">
				<Calendar class="w-4 h-4 text-yellow-600" />
				<span class="text-xs font-medium text-yellow-700">Break-Even</span>
			</div>
			<div class="text-xl font-bold text-yellow-600">{breakEvenWeeks} weeks</div>
			<div class="text-xs text-yellow-700">({(breakEvenWeeks / 52).toFixed(1)} years)</div>
		</div>
		<div class="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
			<div class="flex items-center justify-center gap-2 mb-2">
				<DollarSign class="w-4 h-4 text-green-600" />
				<span class="text-xs font-medium text-green-700">First Year ROI</span>
			</div>
			<div class="text-xl font-bold text-green-600">{formatPercentage(roiPercentage)}</div>
			<div class="text-xs text-green-700">{formatCurrency(firstYearROI)}</div>
		</div>
	</div>

	<!-- Summary -->
	<div class="p-4 bg-oil-orange/10 rounded-lg border border-oil-orange/20">
		<div class="text-center">
			<div class="text-sm font-medium text-oil-black mb-2">Investment Justification</div>
			<div class="text-lg font-bold text-oil-orange">{formatCurrency(downpayment)} investment</div>
			<div class="text-sm text-oil-gray">justified by {addedLoadsPerWeek} additional loads per week</div>
			<div class="text-xs text-oil-gray mt-1">
				Pays for itself in {breakEvenWeeks} weeks ({(breakEvenWeeks / 52).toFixed(1)} years)
			</div>
		</div>
	</div>
</div>

<style>
	.roi-card {
		max-width: 500px;
		margin: 0 auto;
	}

	/* Mobile optimizations */
	@media (max-width: 640px) {
		.roi-card {
			padding: 1rem;
		}
		
		.grid-cols-2 {
			gap: 0.5rem;
		}
		
		.text-2xl {
			font-size: 1.25rem;
		}
		
		.text-xl {
			font-size: 1rem;
		}
		
		.text-lg {
			font-size: 1rem;
		}
		
		.text-sm {
			font-size: 0.75rem;
		}
		
		.text-xs {
			font-size: 0.625rem;
		}
	}
</style> 