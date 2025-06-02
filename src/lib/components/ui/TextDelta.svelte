<script lang="ts">
	export let value: number;
	export let suffix: string = '%';
	export let showSign: boolean = true;

	$: displayValue = showSign && value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
	$: colorClass = value > 0 
		? 'text-emerald-600 dark:text-emerald-400' 
		: value < 0 
		? 'text-red-500 dark:text-red-400' 
		: 'text-slate-500 dark:text-slate-400';
</script>

<span class="font-semibold {colorClass}">
	{displayValue}{suffix}
</span> 