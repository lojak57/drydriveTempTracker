<script lang="ts">
	import { AlertTriangle, Calendar, MapPin, Truck, Clock, FileText, User, Phone } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let isOpen = false;
	export let incidentType = 'minor'; // 'minor', 'major', 'critical'
	
	const dispatch = createEventDispatcher();
	
	// Sample incident data based on type
	const incidentData = {
		minor: [
			{
				id: 'INC-2024-001',
				date: '2024-01-15',
				time: '14:23',
				type: 'Equipment Damage',
				severity: 'Minor',
				location: 'North Texas Hub - Bay 3',
				driver: 'Marcus Rodriguez',
				driverPhone: '(555) 123-4567',
				truck: 'TX-4721',
				description: 'Trailer door hinge damaged during loading. Small scrape on exterior panel.',
				cause: 'Door opened too quickly against loading dock barrier',
				actionTaken: 'Hinge repaired on-site, safety briefing conducted',
				cost: '$340',
				downtime: '45 minutes',
				status: 'Resolved',
				reportedBy: 'Loading Supervisor - Jim Parker',
				followUp: 'Scheduled reinforcement training for Q2 2024'
			},
			{
				id: 'INC-2024-002',
				date: '2024-01-22',
				time: '09:15',
				type: 'Delay',
				severity: 'Minor',
				location: 'Oklahoma Central - Route 35',
				driver: 'Sarah Chen',
				driverPhone: '(555) 987-6543',
				truck: 'OK-8392',
				description: 'Delivery delayed 30 minutes due to incorrect gate access code.',
				cause: 'Client provided outdated access information',
				actionTaken: 'Contact made with site manager, correct code obtained',
				cost: '$85',
				downtime: '30 minutes',
				status: 'Resolved',
				reportedBy: 'Driver - Sarah Chen',
				followUp: 'Updated client contact protocols'
			}
		],
		major: [
			{
				id: 'INC-2024-003',
				date: '2024-01-08',
				time: '11:47',
				type: 'Vehicle Breakdown',
				severity: 'Major',
				location: 'I-45 South, Mile Marker 127',
				driver: 'Robert Williams',
				driverPhone: '(555) 456-7890',
				truck: 'TX-6145',
				description: 'Complete hydraulic system failure during transport. Vehicle immobilized.',
				cause: 'Hydraulic line rupture due to wear and pressure',
				actionTaken: 'Emergency tow service dispatched, load transferred to backup truck',
				cost: '$4,250',
				downtime: '6 hours',
				status: 'Under Investigation',
				reportedBy: 'Driver - Robert Williams',
				followUp: 'Full hydraulic system inspection on all fleet vehicles scheduled'
			}
		],
		critical: []
	};

	$: incidents = incidentData[incidentType as keyof typeof incidentData] || [];
	$: selectedIncident = incidents[0] || null;
	
	function closeModal() {
		isOpen = false;
		dispatch('close');
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}

	function getSeverityColor(severity: string) {
		switch (severity.toLowerCase()) {
			case 'minor': return '#f59e0b';
			case 'major': return '#ef4444';
			case 'critical': return '#dc2626';
			default: return '#6b7280';
		}
	}

	function getTypeIcon(type: string) {
		switch (type.toLowerCase()) {
			case 'equipment damage': return FileText;
			case 'delay': return Clock;
			case 'vehicle breakdown': return Truck;
			default: return AlertTriangle;
		}
	}
</script>

{#if isOpen && selectedIncident}
	<div class="modal-backdrop" on:click={handleBackdropClick}>
		<div class="modal-container">
			<!-- Header -->
			<div class="modal-header">
				<div class="header-left">
					<div class="header-icon" style="background-color: {getSeverityColor(selectedIncident.severity)}20">
						<svelte:component this={getTypeIcon(selectedIncident.type)} size={28} />
					</div>
					<div class="header-text">
						<h1>Incident Details</h1>
						<p>{selectedIncident.id} • {selectedIncident.severity} Incident</p>
					</div>
				</div>
				<button class="close-btn" on:click={closeModal}>×</button>
			</div>

			<!-- Content -->
			<div class="modal-content">
				<!-- Incident Overview -->
				<div class="incident-overview">
					<div class="overview-header">
						<div class="incident-badge" style="background-color: {getSeverityColor(selectedIncident.severity)}20; color: {getSeverityColor(selectedIncident.severity)}">
							{selectedIncident.severity} • {selectedIncident.type}
						</div>
						<div class="incident-status status-{selectedIncident.status.toLowerCase().replace(' ', '-')}">
							{selectedIncident.status}
						</div>
					</div>
					
					<div class="incident-description">
						<h3>Description</h3>
						<p>{selectedIncident.description}</p>
					</div>
				</div>

				<!-- Details Grid -->
				<div class="details-grid">
					<div class="detail-section">
						<h3><Calendar size={18} /> Date & Time</h3>
						<div class="detail-content">
							<div class="detail-item">
								<span class="label">Date:</span>
								<span class="value">{new Date(selectedIncident.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
							</div>
							<div class="detail-item">
								<span class="label">Time:</span>
								<span class="value">{selectedIncident.time}</span>
							</div>
						</div>
					</div>

					<div class="detail-section">
						<h3><MapPin size={18} /> Location</h3>
						<div class="detail-content">
							<div class="detail-item">
								<span class="value">{selectedIncident.location}</span>
							</div>
						</div>
					</div>

					<div class="detail-section">
						<h3><User size={18} /> Personnel</h3>
						<div class="detail-content">
							<div class="detail-item">
								<span class="label">Driver:</span>
								<span class="value">{selectedIncident.driver}</span>
							</div>
							<div class="detail-item">
								<span class="label">Contact:</span>
								<span class="value phone">{selectedIncident.driverPhone}</span>
							</div>
							<div class="detail-item">
								<span class="label">Reported by:</span>
								<span class="value">{selectedIncident.reportedBy}</span>
							</div>
						</div>
					</div>

					<div class="detail-section">
						<h3><Truck size={18} /> Vehicle</h3>
						<div class="detail-content">
							<div class="detail-item">
								<span class="label">Truck ID:</span>
								<span class="value truck-id">{selectedIncident.truck}</span>
							</div>
						</div>
					</div>
				</div>

				<!-- Analysis Section -->
				<div class="analysis-section">
					<div class="analysis-grid">
						<div class="analysis-card">
							<h4>Root Cause</h4>
							<p>{selectedIncident.cause}</p>
						</div>
						<div class="analysis-card">
							<h4>Immediate Action</h4>
							<p>{selectedIncident.actionTaken}</p>
						</div>
						<div class="analysis-card">
							<h4>Follow-up Plan</h4>
							<p>{selectedIncident.followUp}</p>
						</div>
					</div>
				</div>

				<!-- Impact Metrics -->
				<div class="impact-section">
					<h3>Impact Assessment</h3>
					<div class="impact-grid">
						<div class="impact-card cost">
							<div class="impact-label">Financial Impact</div>
							<div class="impact-value">{selectedIncident.cost}</div>
						</div>
						<div class="impact-card time">
							<div class="impact-label">Downtime</div>
							<div class="impact-value">{selectedIncident.downtime}</div>
						</div>
					</div>
				</div>

				<!-- Additional Incidents -->
				{#if incidents.length > 1}
					<div class="other-incidents">
						<h3>Other {incidentType.charAt(0).toUpperCase() + incidentType.slice(1)} Incidents</h3>
						<div class="incident-list">
							{#each incidents.slice(1) as incident}
								<div class="incident-item">
									<div class="incident-header">
										<span class="incident-id">{incident.id}</span>
										<span class="incident-date">{new Date(incident.date).toLocaleDateString()}</span>
									</div>
									<div class="incident-summary">{incident.type} - {incident.description.substring(0, 60)}...</div>
									<div class="incident-location">{incident.location}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(6px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		padding: 20px;
	}

	.modal-container {
		background: white;
		border-radius: 24px;
		max-width: 900px;
		width: 100%;
		max-height: 95vh;
		overflow: hidden;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24px 32px;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		color: white;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.header-icon {
		width: 48px;
		height: 48px;
		border-radius: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #374151;
	}

	.header-text h1 {
		margin: 0 0 4px 0;
		font-size: 24px;
		font-weight: 700;
	}

	.header-text p {
		margin: 0;
		opacity: 0.9;
		font-size: 14px;
	}

	.close-btn {
		width: 40px;
		height: 40px;
		border: none;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-radius: 8px;
		font-size: 24px;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.modal-content {
		flex: 1;
		overflow-y: auto;
		padding: 32px;
	}

	.incident-overview {
		margin-bottom: 32px;
	}

	.overview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16px;
	}

	.incident-badge {
		padding: 8px 16px;
		border-radius: 20px;
		font-weight: 600;
		font-size: 14px;
	}

	.incident-status {
		padding: 6px 12px;
		border-radius: 12px;
		font-weight: 600;
		font-size: 12px;
		text-transform: uppercase;
	}

	.status-resolved {
		background: #dcfce7;
		color: #16a34a;
	}

	.status-under-investigation {
		background: #fef3c7;
		color: #d97706;
	}

	.incident-description h3 {
		margin: 0 0 12px 0;
		font-size: 18px;
		font-weight: 600;
		color: #1f2937;
	}

	.incident-description p {
		margin: 0;
		color: #4b5563;
		line-height: 1.6;
		font-size: 16px;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
		margin-bottom: 32px;
	}

	.detail-section {
		background: #f9fafb;
		border-radius: 16px;
		padding: 20px;
		border: 1px solid #e5e7eb;
	}

	.detail-section h3 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: #374151;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.detail-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.detail-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.detail-item .label {
		font-weight: 500;
		color: #6b7280;
		font-size: 14px;
	}

	.detail-item .value {
		font-weight: 600;
		color: #1f2937;
		font-size: 14px;
	}

	.value.phone {
		color: #3b82f6;
		font-family: 'JetBrains Mono', monospace;
	}

	.value.truck-id {
		background: #3b82f620;
		color: #3b82f6;
		padding: 4px 8px;
		border-radius: 6px;
		font-family: 'JetBrains Mono', monospace;
	}

	.analysis-section {
		margin-bottom: 32px;
	}

	.analysis-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.analysis-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.analysis-card h4 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.analysis-card p {
		margin: 0;
		color: #4b5563;
		line-height: 1.5;
		font-size: 14px;
	}

	.impact-section h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		font-weight: 600;
		color: #1f2937;
	}

	.impact-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 16px;
		margin-bottom: 32px;
	}

	.impact-card {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.impact-card.cost {
		border-left: 4px solid #ef4444;
	}

	.impact-card.time {
		border-left: 4px solid #f59e0b;
	}

	.impact-label {
		font-size: 12px;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 8px;
	}

	.impact-value {
		font-size: 24px;
		font-weight: 700;
		color: #1f2937;
		font-family: 'JetBrains Mono', monospace;
	}

	.other-incidents h3 {
		margin: 0 0 20px 0;
		font-size: 18px;
		font-weight: 600;
		color: #1f2937;
	}

	.incident-list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.incident-item {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 16px;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.incident-item:hover {
		background: #f3f4f6;
		border-color: #d1d5db;
	}

	.incident-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}

	.incident-id {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #3b82f6;
		font-size: 12px;
	}

	.incident-date {
		font-size: 12px;
		color: #6b7280;
	}

	.incident-summary {
		color: #374151;
		font-size: 14px;
		margin-bottom: 4px;
	}

	.incident-location {
		color: #6b7280;
		font-size: 12px;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.modal-backdrop {
			padding: 10px;
		}

		.modal-header {
			padding: 20px;
		}

		.modal-content {
			padding: 20px;
		}

		.details-grid {
			grid-template-columns: 1fr;
		}

		.analysis-grid {
			grid-template-columns: 1fr;
		}

		.impact-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 