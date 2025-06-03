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
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.monitoring-header {
		background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
		padding: 32px 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
		position: relative;
		overflow: hidden;
	}

	.monitoring-header::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		pointer-events: none;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 32px;
		max-width: 1400px;
		margin-left: auto;
		margin-right: auto;
		position: relative;
		z-index: 1;
	}

	.title-section {
		flex: 1;
	}

	.main-title {
		font-size: 32px;
		font-weight: 800;
		color: white;
		margin: 0 0 8px 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		letter-spacing: -0.5px;
	}

	.subtitle {
		font-size: 16px;
		color: rgba(255, 255, 255, 0.8);
		margin: 0;
		font-weight: 400;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.header-stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	.stat-item {
		text-align: center;
		padding: 16px 20px;
		background: rgba(255, 255, 255, 0.15);
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		min-width: 120px;
	}

	.stat-item.warning {
		border-color: #f59e0b;
		background: rgba(245, 158, 11, 0.2);
		box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
	}

	.stat-item:hover {
		transform: translateY(-2px);
		background: rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	}

	.stat-value {
		display: block;
		font-size: 28px;
		font-weight: 700;
		color: white;
		font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
		line-height: 1;
		margin-bottom: 4px;
	}

	.stat-value.connected {
		animation: pulse 2s infinite;
	}

	.stat-label {
		display: block;
		font-size: 12px;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 500;
	}

	.nav-tabs {
		display: flex;
		gap: 6px;
		max-width: 1400px;
		margin: 0 auto 20px auto;
		position: relative;
		z-index: 1;
	}

	.nav-tab {
		padding: 14px 24px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.8);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		border-radius: 12px 12px 0 0;
		font-size: 14px;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		backdrop-filter: blur(10px);
		flex: 1;
		text-align: center;
	}

	.nav-tab:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: rgba(255, 255, 255, 0.3);
		transform: translateY(-1px);
	}

	.nav-tab.active {
		background: white;
		color: #1e293b;
		border-color: white;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}

	.alerts-banner {
		background: linear-gradient(135deg, #fef3c7, #fde68a);
		border: 1px solid #f59e0b;
		border-radius: 12px;
		padding: 16px 20px;
		max-width: 1400px;
		margin: 0 auto;
		position: relative;
		z-index: 1;
		box-shadow: 0 4px 16px rgba(245, 158, 11, 0.2);
	}

	.alerts-content {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.alerts-icon {
		font-size: 20px;
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
		max-width: 1400px;
		margin: 0 auto;
		padding: 32px 24px;
	}

	.overview-layout {
		display: grid;
		grid-template-columns: 1fr 380px;
		gap: 32px;
		align-items: start;
	}

	.diagram-section {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.section-controls {
		display: flex;
		justify-content: flex-end;
		padding: 0 12px;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		color: #64748b;
		cursor: pointer;
		font-weight: 500;
		transition: color 0.2s ease;
	}

	.toggle-label:hover {
		color: #1e293b;
	}

	.quick-status {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.status-grid {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.status-card {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(148, 163, 184, 0.2);
		border-radius: 16px;
		padding: 24px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.status-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
		border-color: rgba(148, 163, 184, 0.3);
	}

	.status-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.1);
	}

	.status-icon {
		font-size: 20px;
	}

	.status-title {
		font-size: 18px;
		font-weight: 700;
		color: #1e293b;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.status-summary {
		margin-bottom: 16px;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 14px;
		margin-bottom: 8px;
		font-weight: 500;
		color: #475569;
	}

	.summary-row:last-child {
		margin-bottom: 0;
	}

	.view-details-btn {
		width: 100%;
		padding: 12px 16px;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		border: none;
		border-radius: 10px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
	}

	.view-details-btn:hover {
		background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
	}

	.integration-status {
		margin-bottom: 16px;
	}

	.connection-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.connection-indicator.connected {
		color: #16a34a;
	}

	.connection-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #16a34a;
		animation: pulse 2s infinite;
		box-shadow: 0 0 10px rgba(22, 163, 74, 0.5);
	}

	.last-sync {
		font-size: 12px;
		color: #64748b;
		font-weight: 500;
	}

	.integration-features {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.feature-item {
		font-size: 13px;
		color: #374151;
		font-weight: 500;
	}

	.valves-layout,
	.sensors-layout {
		width: 100%;
	}

	.demo-footer {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		border-top: 1px solid rgba(148, 163, 184, 0.2);
		padding: 20px 24px;
		margin-top: 32px;
		position: relative;
		overflow: hidden;
	}

	.demo-footer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
		pointer-events: none;
	}

	.footer-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		max-width: 1400px;
		margin: 0 auto;
		color: rgba(255, 255, 255, 0.9);
		font-size: 14px;
		position: relative;
		z-index: 1;
	}

	.demo-label {
		font-weight: 700;
		color: white;
	}

	.tech-stack {
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
	}

	.notifications {
		position: fixed;
		top: 24px;
		right: 24px;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	:global(.notification) {
		padding: 16px 20px;
		border-radius: 12px;
		color: white;
		font-size: 14px;
		font-weight: 600;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
		animation: slideIn 0.3s ease;
		backdrop-filter: blur(10px);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	:global(.notification-success) {
		background: linear-gradient(135deg, #16a34a, #15803d);
	}

	:global(.notification-info) {
		background: linear-gradient(135deg, #3b82f6, #1d4ed8);
	}

	:global(.notification-warning) {
		background: linear-gradient(135deg, #f59e0b, #d97706);
	}

	:global(.notification-error) {
		background: linear-gradient(135deg, #ef4444, #dc2626);
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
			gap: 24px;
		}

		.header-content {
			flex-direction: column;
			gap: 20px;
			align-items: flex-start;
		}

		.header-stats {
			align-self: stretch;
			justify-content: space-between;
			grid-template-columns: repeat(3, 1fr);
		}

		.nav-tabs {
			flex-direction: row;
			overflow-x: auto;
			scrollbar-width: none;
			-ms-overflow-style: none;
		}

		.nav-tabs::-webkit-scrollbar {
			display: none;
		}

		.nav-tab {
			white-space: nowrap;
			min-width: 140px;
		}

		.content-area {
			padding: 24px 16px;
		}
	}

	@media (max-width: 768px) {
		.monitoring-header {
			padding: 24px 16px;
		}

		.main-title {
			font-size: 26px;
		}

		.subtitle {
			font-size: 14px;
		}

		.header-stats {
			grid-template-columns: 1fr;
			gap: 12px;
		}

		.stat-item {
			padding: 12px 16px;
		}

		.stat-value {
			font-size: 24px;
		}

		.nav-tabs {
			flex-direction: column;
			gap: 4px;
		}

		.nav-tab {
			padding: 12px 16px;
			border-radius: 8px;
		}

		.footer-content {
			flex-direction: column;
			gap: 12px;
			text-align: center;
		}

		.status-card {
			padding: 20px;
		}

		.status-title {
			font-size: 16px;
		}
	}

	@media (max-width: 480px) {
		.content-area {
			padding: 16px 12px;
		}

		.monitoring-header {
			padding: 20px 12px;
		}

		.main-title {
			font-size: 22px;
		}

		.status-card {
			padding: 16px;
		}

		.overview-layout {
			gap: 16px;
		}

		.status-grid {
			gap: 16px;
		}
	}
</style> 