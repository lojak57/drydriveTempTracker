<script lang="ts">
	import InteractiveTruckDiagram from '$lib/components/monitoring/InteractiveTruckDiagram.svelte';
	import ValveStatusPanel from '$lib/components/monitoring/ValveStatusPanel.svelte';
	import PressureSensorPanel from '$lib/components/monitoring/PressureSensorPanel.svelte';
	import { systemAlerts, truckMonitoringData } from '$lib/stores/truckMonitoringData';
	import { onMount } from 'svelte';

	let selectedView: 'overview' | 'valves' | 'sensors' = 'overview';
	let showDiagramLabels = true;

	onMount(() => {
		document.title = 'Live Truck Monitoring - DryDrive Oil Field Temp Tracker';
	});

	function handleValveToggled(event: CustomEvent) {
		const { valve } = event.detail;
		console.log('Valve toggled:', valve.name, valve.status);
		// Show success notification
		showNotification(`${valve.name} ${valve.status.toUpperCase()}`, 'success');
	}

	function handleSensorClicked(event: CustomEvent) {
		const { sensor } = event.detail;
		console.log('Sensor clicked:', sensor.name);
		// Show sensor details modal or navigate to detailed view
		showNotification(`Viewing ${sensor.name} details`, 'info');
	}

	function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
		// Simple notification - in a real app this would use a proper notification system
		const notifications = document.getElementById('notifications');
		if (notifications) {
			const notification = document.createElement('div');
			notification.className = `notification notification-${type}`;
			notification.textContent = message;
			notifications.appendChild(notification);
			
			setTimeout(() => {
				notification.remove();
			}, 3000);
		}
	}
</script>

<svelte:head>
	<title>Live Truck Monitoring - DryDrive Oil Field Temp Tracker</title>
	<meta name="description" content="Real-time valve and sensor monitoring for oil transport trucks with interactive diagrams and LOVISVision integration.">
</svelte:head>

<div class="monitoring-container">
	<!-- Header Section -->
	<div class="monitoring-header">
		<div class="header-content">
			<div class="title-section">
				<h1 class="main-title">🚛 Live Truck Monitoring</h1>
				<p class="subtitle">Real-time valve and sensor diagnostics • Interactive truck visualization</p>
			</div>
			
			<div class="header-stats">
				<div class="stat-item">
					<span class="stat-value">{$truckMonitoringData.truckId}</span>
					<span class="stat-label">Truck ID</span>
				</div>
				<div class="stat-item" class:warning={$systemAlerts.length > 0}>
					<span class="stat-value">{$systemAlerts.length}</span>
					<span class="stat-label">Active Alerts</span>
				</div>
				<div class="stat-item">
					<span class="stat-value" class:connected={$truckMonitoringData.connectionStatus === 'connected'}>
						{$truckMonitoringData.connectionStatus === 'connected' ? '🟢' : '🔴'}
					</span>
					<span class="stat-label">Connection</span>
				</div>
			</div>
		</div>

		<!-- Navigation Tabs -->
		<div class="nav-tabs">
			<button 
				class="nav-tab" 
				class:active={selectedView === 'overview'}
				on:click={() => selectedView = 'overview'}
			>
				🎯 Overview
			</button>
			<button 
				class="nav-tab" 
				class:active={selectedView === 'valves'}
				on:click={() => selectedView = 'valves'}
			>
				🎛️ Valve Control
			</button>
			<button 
				class="nav-tab" 
				class:active={selectedView === 'sensors'}
				on:click={() => selectedView = 'sensors'}
			>
				📊 Sensor Data
			</button>
		</div>

		<!-- System Alerts -->
		{#if $systemAlerts.length > 0}
			<div class="alerts-banner">
				<div class="alerts-content">
					<div class="alerts-icon">⚠️</div>
					<div class="alerts-text">
						<strong>{$systemAlerts.length} Active Alert{$systemAlerts.length > 1 ? 's' : ''}:</strong>
						{$systemAlerts.slice(0, 2).join(' • ')}
						{#if $systemAlerts.length > 2}
							<span class="more-alerts">and {$systemAlerts.length - 2} more...</span>
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Main Content -->
	<div class="content-area">
		{#if selectedView === 'overview'}
			<div class="overview-layout">
				<!-- Interactive Truck Diagram -->
				<div class="diagram-section">
					<div class="section-controls">
						<label class="toggle-label">
							<input 
								type="checkbox" 
								bind:checked={showDiagramLabels}
							/>
							<span>Show Labels</span>
						</label>
					</div>
					<InteractiveTruckDiagram 
						showLabels={showDiagramLabels}
						interactive={true}
						on:valve-toggled={handleValveToggled}
						on:sensor-clicked={handleSensorClicked}
					/>
				</div>

				<!-- Quick Status Panels -->
				<div class="quick-status">
					<div class="status-grid">
						<div class="status-card valves">
							<div class="status-header">
								<span class="status-icon">🎛️</span>
								<span class="status-title">Valve Status</span>
							</div>
							<div class="status-summary">
								<div class="summary-row">
									<span>🟢 Open:</span>
									<span>{$truckMonitoringData.valves.filter(v => v.status === 'open').length}</span>
								</div>
								<div class="summary-row">
									<span>🔴 Closed:</span>
									<span>{$truckMonitoringData.valves.filter(v => v.status === 'closed').length}</span>
								</div>
								<div class="summary-row">
									<span>🟡 Unknown:</span>
									<span>{$truckMonitoringData.valves.filter(v => v.status === 'unknown').length}</span>
								</div>
							</div>
							<button class="view-details-btn" on:click={() => selectedView = 'valves'}>
								View Details
							</button>
						</div>

						<div class="status-card sensors">
							<div class="status-header">
								<span class="status-icon">📊</span>
								<span class="status-title">Sensor Status</span>
							</div>
							<div class="status-summary">
								<div class="summary-row">
									<span>🟢 Normal:</span>
									<span>{$truckMonitoringData.sensors.filter(s => s.status === 'normal').length}</span>
								</div>
								<div class="summary-row">
									<span>🟡 Warning:</span>
									<span>{$truckMonitoringData.sensors.filter(s => s.status === 'warning').length}</span>
								</div>
								<div class="summary-row">
									<span>🔴 Critical:</span>
									<span>{$truckMonitoringData.sensors.filter(s => s.status === 'critical').length}</span>
								</div>
							</div>
							<button class="view-details-btn" on:click={() => selectedView = 'sensors'}>
								View Details
							</button>
						</div>

						<div class="status-card integration">
							<div class="status-header">
								<span class="status-icon">📡</span>
								<span class="status-title">LOVISVision</span>
							</div>
							<div class="integration-status">
								<div class="connection-indicator connected">
									<div class="connection-dot"></div>
									<span>Connected</span>
								</div>
								<div class="last-sync">
									Last sync: {new Date($truckMonitoringData.lastSync).toLocaleTimeString()}
								</div>
							</div>
							<div class="integration-features">
								<div class="feature-item">✅ Real-time pressure monitoring</div>
								<div class="feature-item">✅ Automatic email alerts</div>
								<div class="feature-item">✅ Valve status capture</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		{#if selectedView === 'valves'}
			<div class="valves-layout">
				<ValveStatusPanel on:valve-toggled={handleValveToggled} />
			</div>
		{/if}

		{#if selectedView === 'sensors'}
			<div class="sensors-layout">
				<PressureSensorPanel on:sensor-clicked={handleSensorClicked} />
			</div>
		{/if}
	</div>

	<!-- Demo Footer -->
	<div class="demo-footer">
		<div class="footer-content">
			<div class="demo-info">
				<span class="demo-label">🎯 Demo Mode:</span>
				<span>Interactive valve control • Live sensor simulation • LOVISVision integration</span>
			</div>
			<div class="tech-stack">
				<span>Powered by DryDrive • Krohne Opticheck • LOVISVision</span>
			</div>
		</div>
	</div>
</div>

<!-- Notification Container -->
<div id="notifications" class="notifications"></div>

<style>
	.monitoring-container {
		min-height: 100vh;
		background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%);
		padding: 20px;
	}

	.monitoring-header {
		background: #1e293b;
		border-radius: 16px;
		padding: 24px 32px;
		margin-bottom: 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		color: white;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 32px;
		flex-wrap: wrap;
		gap: 20px;
	}

	.title-section {
		flex: 1;
	}

	.main-title {
		font-size: 24px;
		font-weight: 600;
		color: white;
		margin: 0 0 4px 0;
	}

	.subtitle {
		color: #cbd5e1;
		margin: 0;
		font-size: 14px;
	}

	.header-stats {
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}

	.stat-item {
		text-align: center;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.2s ease;
		min-width: 100px;
	}

	.stat-item.warning {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.2);
	}

	.stat-item:hover {
		background: rgba(255, 255, 255, 0.15);
	}

	.stat-value {
		display: block;
		font-size: 20px;
		font-weight: 700;
		color: white;
		line-height: 1;
		margin-bottom: 4px;
	}

	.stat-value.connected {
		animation: pulse 2s infinite;
	}

	.stat-label {
		display: block;
		font-size: 11px;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 500;
	}

	.nav-tabs {
		display: flex;
		gap: 8px;
		margin-bottom: 24px;
		overflow-x: auto;
		padding: 4px;
	}

	.nav-tab {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 20px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: #cbd5e1;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.nav-tab:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
		color: white;
	}

	.nav-tab.active {
		background: white;
		color: #1e293b;
		border-color: white;
	}

	.alerts-banner {
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		border: 1px solid #f59e0b;
		border-radius: 8px;
		padding: 12px 16px;
		margin-bottom: 16px;
		box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);
	}

	.alerts-content {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.alerts-icon {
		font-size: 18px;
	}

	.alerts-text {
		flex: 1;
		color: #92400e;
		font-size: 14px;
		font-weight: 500;
	}

	.more-alerts {
		color: #78350f;
		font-weight: 600;
	}

	.content-area {
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	}

	.overview-layout {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 24px;
		align-items: start;
	}

	.diagram-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-controls {
		display: flex;
		justify-content: flex-end;
		padding: 0 8px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #64748b;
		cursor: pointer;
		font-weight: 500;
	}

	.toggle-label:hover {
		color: #1e293b;
	}

	.quick-status {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.status-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.status-card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
		transition: all 0.2s ease;
	}

	.status-card:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: #cbd5e1;
	}

	.status-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid #e2e8f0;
	}

	.status-icon {
		font-size: 16px;
	}

	.status-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
	}

	.status-summary {
		margin-bottom: 16px;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		margin-bottom: 4px;
		color: #64748b;
	}

	.summary-row:last-child {
		margin-bottom: 0;
	}

	.view-details-btn {
		width: 100%;
		padding: 8px 12px;
		background: #1e293b;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.view-details-btn:hover {
		background: #334155;
		transform: translateY(-1px);
	}

	.integration-status {
		margin-bottom: 12px;
	}

	.connection-indicator {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 500;
		margin-bottom: 4px;
	}

	.connection-indicator.connected {
		color: #16a34a;
	}

	.connection-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #16a34a;
		animation: pulse 2s infinite;
	}

	.last-sync {
		font-size: 11px;
		color: #64748b;
	}

	.integration-features {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.feature-item {
		font-size: 11px;
		color: #64748b;
	}

	.valves-layout,
	.sensors-layout {
		width: 100%;
	}

	.demo-footer {
		background: #1e293b;
		border-radius: 16px;
		padding: 16px 24px;
		margin-top: 20px;
		color: white;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
	}

	.demo-label {
		font-weight: 600;
		color: white;
	}

	.tech-stack {
		color: #cbd5e1;
	}

	.notifications {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	:global(.notification) {
		padding: 12px 16px;
		border-radius: 8px;
		color: white;
		font-size: 14px;
		font-weight: 500;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		animation: slideIn 0.3s ease;
	}

	:global(.notification-success) {
		background: #16a34a;
	}

	:global(.notification-info) {
		background: #3b82f6;
	}

	:global(.notification-warning) {
		background: #f59e0b;
	}

	:global(.notification-error) {
		background: #ef4444;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	/* Mobile responsive */
	@media (max-width: 1024px) {
		.overview-layout {
			grid-template-columns: 1fr;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-stats {
			align-self: stretch;
			justify-content: space-between;
		}

		.nav-tabs {
			flex-wrap: wrap;
		}
	}

	@media (max-width: 768px) {
		.monitoring-container {
			padding: 12px;
		}

		.monitoring-header {
			padding: 20px 24px;
			margin-bottom: 16px;
		}

		.main-title {
			font-size: 20px;
		}

		.header-stats {
			flex-direction: column;
			gap: 8px;
		}

		.content-area {
			padding: 16px;
		}

		.footer-content {
			flex-direction: column;
			gap: 8px;
			text-align: center;
		}
	}
</style> 