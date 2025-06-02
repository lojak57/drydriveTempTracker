// Utility functions for consistent formatting across dashboards

/**
 * Format percentage values with consistent +/- signs
 * @param value - The percentage value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string like "+2.1%" or "−1.3%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
	const sign = value > 0 ? '+' : value < 0 ? '−' : '';
	const absValue = Math.abs(value);
	return `${sign}${absValue.toFixed(decimals)}%`;
}

/**
 * Format delta values with proper signs
 * @param value - The delta value  
 * @param type - Type of formatting ('percentage' | 'absolute' | 'currency')
 * @param decimals - Number of decimal places
 * @returns Formatted delta string
 */
export function formatDelta(value: number, type: 'percentage' | 'absolute' | 'currency' = 'absolute', decimals: number = 1): string {
	const sign = value > 0 ? '+' : value < 0 ? '−' : '';
	const absValue = Math.abs(value);
	
	switch (type) {
		case 'percentage':
			return `${sign}${absValue.toFixed(decimals)}%`;
		case 'currency':
			return `${sign}$${absValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
		case 'absolute':
		default:
			return `${sign}${absValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
	}
}

/**
 * Get trend color class based on value
 * @param value - The value to check
 * @param inverted - If true, negative values are good (default: false)
 * @returns Tailwind color class
 */
export function getTrendColor(value: number, inverted: boolean = false): string {
	if (value === 0) return 'text-slate-600';
	
	const isPositive = value > 0;
	const isGood = inverted ? !isPositive : isPositive;
	
	return isGood ? 'text-green-600' : 'text-red-500';
}

/**
 * Get status color for performance metrics
 * @param value - The metric value
 * @param thresholds - Object with good and warning thresholds
 * @returns Object with color class and status
 */
export function getPerformanceStatus(
	value: number, 
	thresholds: { excellent: number; good: number; warning: number }
): { color: string; status: string; bgColor: string } {
	if (value >= thresholds.excellent) {
		return { color: 'text-green-600', status: 'excellent', bgColor: 'bg-green-50' };
	} else if (value >= thresholds.good) {
		return { color: 'text-blue-600', status: 'good', bgColor: 'bg-blue-50' };
	} else if (value >= thresholds.warning) {
		return { color: 'text-orange-600', status: 'warning', bgColor: 'bg-orange-50' };
	} else {
		return { color: 'text-red-600', status: 'critical', bgColor: 'bg-red-50' };
	}
}

/**
 * Format large numbers with K/M suffixes
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
	if (value >= 1000000) {
		return `${(value / 1000000).toFixed(decimals)}M`;
	} else if (value >= 1000) {
		return `${(value / 1000).toFixed(decimals)}K`;
	}
	return value.toString();
}

/**
 * Format currency values consistently
 * @param value - The currency value
 * @param showCents - Whether to show cents (default: false)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, showCents: boolean = false): string {
	const options: Intl.NumberFormatOptions = {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: showCents ? 2 : 0,
		maximumFractionDigits: showCents ? 2 : 0
	};
	
	return value.toLocaleString('en-US', options);
}

/**
 * Get font weight class based on importance
 * @param importance - Level of importance ('normal' | 'medium' | 'high')
 * @returns Tailwind font weight class
 */
export function getFontWeight(importance: 'normal' | 'medium' | 'high'): string {
	switch (importance) {
		case 'high': return 'font-bold';
		case 'medium': return 'font-semibold';
		case 'normal':
		default: return 'font-medium';
	}
}

/**
 * Get standardized text size classes
 * @param size - Size level ('xs' | 'sm' | 'base' | 'lg' | 'xl')
 * @returns Tailwind text size class
 */
export function getTextSize(size: 'xs' | 'sm' | 'base' | 'lg' | 'xl'): string {
	return `text-${size}`;
}

/**
 * Generate consistent tracking classes for text
 * @param spacing - Spacing level ('tight' | 'normal' | 'wide')
 * @returns Tailwind tracking class
 */
export function getTextTracking(spacing: 'tight' | 'normal' | 'wide'): string {
	switch (spacing) {
		case 'tight': return 'tracking-tight';
		case 'wide': return 'tracking-wide';
		case 'normal':
		default: return 'tracking-normal';
	}
} 