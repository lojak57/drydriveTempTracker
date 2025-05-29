<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  export let type: 'line' | 'bar' | 'doughnut' | 'pie' = 'line';
  export let data: any;
  export let options: any = {};
  export let height = 400;
  export let width: number | undefined = undefined;

  let canvas: HTMLCanvasElement;
  let chart: any = null;
  let Chart: any = null;

  // Default options for oil field theme
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 12,
            weight: '500'
          },
          color: '#1a1a1a'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1a1a1a',
        bodyColor: '#6b7280',
        borderColor: 'rgba(0, 78, 137, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          family: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
          size: 12
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 78, 137, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 78, 137, 0.1)',
          lineWidth: 1
        },
        ticks: {
          color: '#6b7280',
          font: {
            family: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
            size: 11
          }
        }
      }
    }
  };

  // Oil field color palette
  export const oilFieldColors = {
    primary: '#004E89',
    secondary: '#FF6B35',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280',
    gradients: {
      primary: 'linear-gradient(135deg, #004E89 0%, #0066cc 100%)',
      secondary: 'linear-gradient(135deg, #FF6B35 0%, #ff8c42 100%)',
      success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
    }
  };

  onMount(async () => {
    if (browser) {
      try {
        // Dynamic import Chart.js only on client side
        const chartModule = await import('chart.js/auto');
        Chart = chartModule.default;
        
        // Import date adapter
        await import('chartjs-adapter-date-fns');
        
        // Initialize chart if we have all required data
        if (canvas && data && isValidChartData(data)) {
          createChart();
        }
      } catch (error) {
        console.error('Error loading Chart.js:', error);
      }
    }
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
      chart = null;
    }
  });

  function createChart() {
    if (!Chart || !canvas || !data) return;
    
    try {
      // Destroy any existing chart on this canvas first
      const existingChart = Chart.getChart(canvas);
      if (existingChart) {
        existingChart.destroy();
      }

      const mergedOptions = {
        ...defaultOptions,
        ...options
      };

      chart = new Chart(canvas, {
        type,
        data,
        options: mergedOptions
      });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  // Update chart when data changes
  $: if (chart && data && browser) {
    try {
      chart.data = data;
      chart.update();
    } catch (error) {
      console.error('Error updating chart data:', error);
    }
  }

  // Update chart when options change
  $: if (chart && options && browser) {
    try {
      chart.options = {
        ...defaultOptions,
        ...options
      };
      chart.update();
    } catch (error) {
      console.error('Error updating chart options:', error);
    }
  }

  // Create chart when canvas and data become available
  $: if (browser && Chart && canvas && data && !chart && isValidChartData(data)) {
    createChart();
  }

  // Validate chart data structure
  function isValidChartData(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           data.datasets && 
           Array.isArray(data.datasets) && 
           data.datasets.length > 0 &&
           data.datasets[0].data &&
           Array.isArray(data.datasets[0].data);
  }
</script>

<div class="chart-container" style="height: {height}px; {width ? `width: ${width}px;` : ''}">
  <canvas bind:this={canvas} style="display: block; width: 100%; height: 100%;"></canvas>
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }
  
  canvas {
    max-width: 100%;
    max-height: 100%;
    display: block !important;
  }
</style> 