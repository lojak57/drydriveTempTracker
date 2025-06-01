<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle, AlertTriangle, XCircle, Camera, FileText } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	// Pre-trip inspection data structure
	interface InspectionItem {
		id: string;
		category: string;
		description: string;
		status: 'pending' | 'pass' | 'fail' | 'defect';
		notes?: string;
		photoRequired?: boolean;
		photoTaken?: boolean;
		critical?: boolean;
	}

	// Pre-trip checklist items based on DOT requirements
	let inspectionItems: InspectionItem[] = [
		// Vehicle Exterior
		{ id: 'tires', category: 'Exterior', description: 'Tires (tread depth, air pressure, damage)', status: 'pass', critical: true },
		{ id: 'wheels', category: 'Exterior', description: 'Wheels and rims (cracks, loose lugs)', status: 'pass', critical: true },
		{ id: 'lights', category: 'Exterior', description: 'All lights and reflectors working', status: 'pass', critical: true },
		{ id: 'mirrors', category: 'Exterior', description: 'Mirrors clean and properly adjusted', status: 'pass' },
		{ id: 'windshield', category: 'Exterior', description: 'Windshield and windows (cracks, chips)', status: 'pass' },
		{ id: 'hood', category: 'Exterior', description: 'Hood latched securely', status: 'pass' },
		
		// Engine Compartment
		{ id: 'oil-level', category: 'Engine', description: 'Engine oil level and condition', status: 'pass', critical: true },
		{ id: 'coolant', category: 'Engine', description: 'Coolant level and condition', status: 'pass', critical: true },
		{ id: 'belts', category: 'Engine', description: 'Drive belts (wear, tension)', status: 'pass' },
		{ id: 'hoses', category: 'Engine', description: 'Hoses and connections', status: 'pass' },
		{ id: 'battery', category: 'Engine', description: 'Battery secured and terminals clean', status: 'pass' },
		
		// Cab Interior
		{ id: 'seat-belts', category: 'Interior', description: 'Seat belts functional', status: 'pass', critical: true },
		{ id: 'horn', category: 'Interior', description: 'Horn working', status: 'pass' },
		{ id: 'gauges', category: 'Interior', description: 'All gauges and warning lights', status: 'pass', critical: true },
		{ id: 'wipers', category: 'Interior', description: 'Windshield wipers and washers', status: 'pass' },
		{ id: 'heater-defrost', category: 'Interior', description: 'Heater and defroster working', status: 'pass' },
		
		// Braking System
		{ id: 'brake-pedal', category: 'Brakes', description: 'Brake pedal feel and travel', status: 'pass', critical: true },
		{ id: 'parking-brake', category: 'Brakes', description: 'Parking brake operation', status: 'pass', critical: true },
		{ id: 'air-pressure', category: 'Brakes', description: 'Air pressure build-up and leaks', status: 'pass', critical: true },
		
		// Trailer/Tank Specific
		{ id: 'coupling', category: 'Coupling', description: 'Fifth wheel and kingpin secure', status: 'pass', critical: true },
		{ id: 'air-lines', category: 'Coupling', description: 'Air lines connected and secure', status: 'pass', critical: true },
		{ id: 'electrical', category: 'Coupling', description: 'Electrical connections working', status: 'pass' },
		{ id: 'tank-valves', category: 'Tank', description: 'Tank valves closed and secure', status: 'pass', critical: true },
		{ id: 'emergency-kit', category: 'Safety', description: 'Emergency kit and spill response', status: 'pass', critical: true },
		{ id: 'placards', category: 'Safety', description: 'Proper placards displayed', status: 'pending', critical: true }
	];

	// Group items by category
	$: groupedItems = inspectionItems.reduce((groups, item) => {
		if (!groups[item.category]) {
			groups[item.category] = [];
		}
		groups[item.category].push(item);
		return groups;
	}, {} as Record<string, InspectionItem[]>);

	// Calculate inspection status
	$: totalItems = inspectionItems.length;
	$: completedItems = inspectionItems.filter(item => item.status !== 'pending').length;
	$: failedItems = inspectionItems.filter(item => item.status === 'fail' || item.status === 'defect').length;
	$: criticalFailures = inspectionItems.filter(item => item.critical && (item.status === 'fail' || item.status === 'defect')).length;
	$: completionPercent = Math.round((completedItems / totalItems) * 100);
	$: canComplete = completedItems === totalItems && criticalFailures === 0;

	// Current inspection state
	let currentDate = new Date();
	let driverName = "Mike Johnson"; // This would come from auth store
	let truckId = "892"; // Updated per Kevin's feedback
	let trailerNumber = "445"; // Updated per Kevin's feedback
	let currentStep = 'inspection'; // 'inspection' | 'review' | 'complete'
	let defectNotes = '';
	let generalNotes = ''; // Static notes that always appear
	let showPhotoModal = false;
	let selectedItemForPhoto: InspectionItem | null = null;

	function updateItemStatus(itemId: string, status: InspectionItem['status']) {
		inspectionItems = inspectionItems.map(item => 
			item.id === itemId ? { ...item, status } : item
		);
	}

	function addNotes(itemId: string, notes: string) {
		inspectionItems = inspectionItems.map(item => 
			item.id === itemId ? { ...item, notes } : item
		);
	}

	function takePhoto(item: InspectionItem) {
		selectedItemForPhoto = item;
		showPhotoModal = true;
	}

	function completePhotoCapture() {
		if (selectedItemForPhoto) {
			inspectionItems = inspectionItems.map(item => 
				item.id === selectedItemForPhoto?.id ? { ...item, photoTaken: true } : item
			);
		}
		showPhotoModal = false;
		selectedItemForPhoto = null;
	}

	function completeInspection() {
		if (canComplete) {
			dispatch('inspection-complete', {
				inspectionData: {
					date: currentDate,
					driver: driverName,
					truck: truckId,
					trailer: trailerNumber,
					items: inspectionItems,
					status: failedItems > 0 ? 'defects-noted' : 'passed',
					defectNotes,
					generalNotes,
					completedAt: new Date()
				}
			});
		}
	}

	function getStatusIcon(status: InspectionItem['status']) {
		switch (status) {
			case 'pass': return { component: CheckCircle, color: 'text-emerald-600' };
			case 'fail': 
			case 'defect': return { component: XCircle, color: 'text-red-600' };
			default: return { component: AlertTriangle, color: 'text-gray-400' };
		}
	}

	function getCategoryColor(category: string) {
		const colors: Record<string, string> = {
			'Exterior': 'border-blue-200 bg-blue-50',
			'Engine': 'border-orange-200 bg-orange-50',
			'Interior': 'border-green-200 bg-green-50',
			'Brakes': 'border-red-200 bg-red-50',
			'Coupling': 'border-purple-200 bg-purple-50',
			'Tank': 'border-indigo-200 bg-indigo-50',
			'Safety': 'border-yellow-200 bg-yellow-50'
		};
		return colors[category] || 'border-gray-200 bg-gray-50';
	}
</script>

<div class="pre-trip-inspection mobile-container">
	<!-- Header -->
	<div class="inspection-header mobile-sticky">
		<div class="header-content">
			<div class="truck-info">
				<h1 class="inspection-title">Pre-Trip Inspection</h1>
				<div class="vehicle-details">
					<span class="truck-id">{truckId}</span>
					<span class="separator">•</span>
					<span class="trailer-id">{trailerNumber}</span>
				</div>
				<div class="inspection-meta">
					<span class="driver-name">{driverName}</span>
					<span class="separator">•</span>
					<span class="inspection-date">{currentDate.toLocaleDateString()}</span>
				</div>
			</div>
			<div class="progress-indicator">
				<div class="progress-circle">
					<svg class="progress-ring" width="60" height="60">
						<circle class="progress-ring-background" cx="30" cy="30" r="25" />
						<circle 
							class="progress-ring-progress" 
							cx="30" cy="30" r="25"
							style="stroke-dasharray: {157}; stroke-dashoffset: {157 - (157 * completionPercent / 100)}"
						/>
					</svg>
					<span class="progress-text">{completionPercent}%</span>
				</div>
				<div class="progress-stats">
					<span class="completed-count">{completedItems}/{totalItems}</span>
					{#if failedItems > 0}
						<span class="failed-count">{failedItems} defects</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Inspection Form -->
	<div class="inspection-content">
		{#each Object.entries(groupedItems) as [category, items]}
			<div class="category-section {getCategoryColor(category)}">
				<div class="category-header">
					<h2 class="category-title">{category} Inspection</h2>
					<div class="category-progress">
						<span class="completed-items">{items.filter(item => item.status !== 'pending').length}/{items.length}</span>
						<span class="category-status">
							{#if items.every(item => item.status === 'pass')}
								✅ Complete
							{:else if items.some(item => item.status === 'fail' || item.status === 'defect')}
								⚠️ Issues Found
							{:else if items.some(item => item.status !== 'pending')}
								🔄 In Progress
							{:else}
								⏳ Pending
							{/if}
						</span>
					</div>
				</div>
				
				<div class="category-description">
					{#if category === 'Exterior'}
						<p>Inspect vehicle exterior components including tires, lights, and body condition</p>
					{:else if category === 'Engine'}
						<p>Check engine compartment fluids, belts, and mechanical components</p>
					{:else if category === 'Interior'}
						<p>Verify cab safety equipment and operational controls</p>
					{:else if category === 'Brakes'}
						<p>Test braking system components and air pressure systems</p>
					{:else if category === 'Coupling'}
						<p>Inspect trailer connection points and electrical systems</p>
					{:else if category === 'Tank'}
						<p>Verify tank integrity and valve operation for safe transport</p>
					{:else if category === 'Safety'}
						<p>Confirm emergency equipment and regulatory compliance</p>
					{/if}
				</div>

				<div class="category-items">
					{#each items as item}
						<div class="inspection-item {item.critical ? 'critical-item' : ''}">
							<div class="item-header">
								<div class="item-description">
									<span class="item-text">{item.description}</span>
									{#if item.critical}
										<span class="critical-badge">Critical Safety Item</span>
									{/if}
								</div>
								<div class="item-actions">
									{#if item.photoRequired || item.status === 'fail' || item.status === 'defect'}
										<button 
											class="photo-btn tap-target {item.photoTaken ? 'photo-taken' : ''}"
											on:click={() => takePhoto(item)}
										>
											<Camera size={16} />
											{#if item.photoTaken}
												<span class="photo-indicator">✓</span>
											{/if}
										</button>
									{/if}
								</div>
							</div>
							
							<div class="status-controls">
								<button 
									class="status-btn pass-btn tap-target {item.status === 'pass' ? 'active' : ''}"
									on:click={() => updateItemStatus(item.id, 'pass')}
								>
									<CheckCircle size={18} />
									<span>Pass</span>
								</button>
								<button 
									class="status-btn fail-btn tap-target {item.status === 'fail' ? 'active' : ''}"
									on:click={() => updateItemStatus(item.id, 'fail')}
								>
									<XCircle size={18} />
									<span>Fail</span>
								</button>
								<button 
									class="status-btn defect-btn tap-target {item.status === 'defect' ? 'active' : ''}"
									on:click={() => updateItemStatus(item.id, 'defect')}
								>
									<AlertTriangle size={18} />
									<span>Defect</span>
								</button>
							</div>

							{#if item.status === 'fail' || item.status === 'defect'}
								<div class="notes-section">
									<textarea 
										class="notes-input mobile-input"
										placeholder="Describe the issue (required for failures/defects)..."
										value={item.notes || ''}
										on:input={(e) => addNotes(item.id, (e.target as HTMLTextAreaElement)?.value || '')}
									></textarea>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- General Notes Section -->
	<div class="general-notes-section">
		<div class="notes-header">
			<FileText size={20} />
			<h3 class="notes-title">General Notes</h3>
		</div>
		<div class="notes-description">
			<p>Add any additional observations, concerns, or maintenance recommendations</p>
		</div>
		<textarea 
			class="general-notes-input mobile-input"
			placeholder="Enter any general observations, maintenance notes, or recommendations..."
			bind:value={generalNotes}
			rows="4"
		></textarea>
	</div>

	<!-- Completion Section -->
	<div class="completion-section">
		{#if failedItems > 0}
			<div class="defect-summary">
				<h3 class="defect-title">Defects Summary</h3>
				<textarea 
					class="defect-notes mobile-input"
					placeholder="Additional notes about defects and corrective actions taken..."
					bind:value={defectNotes}
				></textarea>
			</div>
		{/if}

		<div class="completion-actions">
			<div class="completion-status">
				{#if criticalFailures > 0}
					<div class="status-warning">
						<AlertTriangle size={20} />
						<span>Vehicle cannot operate with critical defects</span>
					</div>
				{:else if failedItems > 0}
					<div class="status-defects">
						<FileText size={20} />
						<span>Defects noted - maintenance required</span>
					</div>
				{:else if canComplete}
					<div class="status-ready">
						<CheckCircle size={20} />
						<span>Vehicle ready for operation</span>
					</div>
				{:else}
					<div class="status-incomplete">
						<AlertTriangle size={20} />
						<span>Complete all inspections to continue</span>
					</div>
				{/if}
			</div>

			<button 
				class="complete-btn tap-target {canComplete ? 'enabled' : 'disabled'}"
				disabled={!canComplete}
				on:click={completeInspection}
			>
				{#if criticalFailures > 0}
					Submit Defect Report
				{:else}
					Complete Inspection
				{/if}
			</button>
		</div>
	</div>
</div>

<!-- Photo Modal -->
{#if showPhotoModal && selectedItemForPhoto}
	<div class="photo-modal-overlay">
		<div class="photo-modal">
			<div class="modal-header">
				<h3>Photo Documentation</h3>
				<button class="close-btn" on:click={() => showPhotoModal = false}>×</button>
			</div>
			<div class="modal-content">
				<p class="photo-instruction">Take a photo of: {selectedItemForPhoto.description}</p>
				<div class="camera-placeholder">
					<Camera size={48} />
					<p>Camera interface would appear here</p>
					<p class="camera-note">(In production: live camera feed)</p>
				</div>
			</div>
			<div class="modal-actions">
				<button class="cancel-btn tap-target" on:click={() => showPhotoModal = false}>
					Cancel
				</button>
				<button class="capture-btn tap-target" on:click={completePhotoCapture}>
					Capture Photo
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.pre-trip-inspection {
		min-height: 100vh;
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9f0 50%, #e8f5e8 100%);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.mobile-container {
		max-width: 100%;
		margin: 0 auto;
		padding: 0;
	}

	@media (min-width: 768px) {
		.mobile-container {
			max-width: 768px;
			padding: 0 16px;
		}
	}

	/* Header */
	.inspection-header {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		padding: 16px;
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 16px;
	}

	.truck-info {
		flex: 1;
		min-width: 0;
	}

	.inspection-title {
		font-size: 20px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 4px 0;
	}

	.vehicle-details {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 4px;
	}

	.truck-id, .trailer-id {
		font-family: 'JetBrains Mono', monospace;
		font-weight: 600;
		color: #059669;
		font-size: 14px;
	}

	.separator {
		color: #6b7280;
		font-weight: 300;
	}

	.inspection-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: #6b7280;
	}

	/* Progress Indicator */
	.progress-indicator {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.progress-circle {
		position: relative;
		width: 60px;
		height: 60px;
	}

	.progress-ring {
		transform: rotate(-90deg);
	}

	.progress-ring-background {
		fill: none;
		stroke: #e5e7eb;
		stroke-width: 3;
	}

	.progress-ring-progress {
		fill: none;
		stroke: #059669;
		stroke-width: 3;
		stroke-linecap: round;
		transition: stroke-dashoffset 0.3s ease;
	}

	.progress-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 14px;
		font-weight: 600;
		color: #1e293b;
	}

	.progress-stats {
		text-align: center;
		font-size: 12px;
	}

	.completed-count {
		color: #059669;
		font-weight: 600;
	}

	.failed-count {
		color: #dc2626;
		font-weight: 600;
		display: block;
		margin-top: 2px;
	}

	/* Content */
	.inspection-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.category-section {
		border: 1px solid;
		border-radius: 12px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		margin-bottom: 16px;
	}

	.category-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.category-title {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.category-progress {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 12px;
	}

	.completed-items {
		background: rgba(59, 130, 246, 0.1);
		color: #1e40af;
		padding: 4px 8px;
		border-radius: 6px;
		font-weight: 600;
		font-family: 'JetBrains Mono', monospace;
	}

	.category-status {
		font-weight: 500;
		color: #6b7280;
	}

	.category-description {
		margin-bottom: 16px;
		padding: 12px;
		background: rgba(0, 0, 0, 0.02);
		border-radius: 8px;
		border-left: 3px solid rgba(59, 130, 246, 0.3);
	}

	.category-description p {
		margin: 0;
		font-size: 14px;
		color: #4b5563;
		line-height: 1.4;
		font-style: italic;
	}

	.category-items {
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
		max-height: 80vh;
		overflow-y: auto;
	}

	@media (min-width: 640px) {
		.category-items {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 768px) {
		.category-items {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Inspection Items */
	.inspection-item {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		padding: 12px;
		transition: all 0.2s ease;
	}

	.inspection-item.critical-item {
		border-left: 4px solid #dc2626;
		background: rgba(255, 255, 255, 0.95);
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		margin-bottom: 12px;
	}

	.item-description {
		flex: 1;
		min-width: 0;
	}

	.item-text {
		font-size: 14px;
		color: #374151;
		line-height: 1.4;
		display: block;
	}

	.critical-badge {
		background: #fecaca;
		color: #991b1b;
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-top: 4px;
		display: inline-block;
	}

	.item-actions {
		flex-shrink: 0;
	}

	.photo-btn {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 6px;
		color: #3b82f6;
		padding: 6px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
		position: relative;
		transition: all 0.2s ease;
	}

	.photo-btn.photo-taken {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.3);
		color: #10b981;
	}

	.photo-indicator {
		position: absolute;
		top: -4px;
		right: -4px;
		background: #10b981;
		color: white;
		font-size: 10px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Status Controls */
	.status-controls {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.status-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 10px 8px;
		border-radius: 6px;
		border: 1px solid;
		background: rgba(255, 255, 255, 0.8);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 13px;
		font-weight: 500;
	}

	.pass-btn {
		border-color: #d1fae5;
		color: #065f46;
	}

	.pass-btn.active {
		background: #d1fae5;
		border-color: #10b981;
		color: #065f46;
	}

	.fail-btn {
		border-color: #e5e7eb;
		color: #991b1b;
	}

	.fail-btn.active {
		background: #e5e7eb;
		border-color: #dc2626;
		color: #991b1b;
	}

	.defect-btn {
		border-color: #e5e7eb;
		color: #9a3412;
	}

	.defect-btn.active {
		background: #e5e7eb;
		border-color: #ea580c;
		color: #9a3412;
	}

	/* Notes Section */
	.notes-section {
		margin-top: 12px;
	}

	.notes-input {
		width: 100%;
		min-height: 60px;
		resize: vertical;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		padding: 8px 12px;
		font-size: 14px;
		font-family: inherit;
		background: white;
	}

	/* Completion Section */
	.completion-section {
		padding: 16px;
		background: rgba(255, 255, 255, 0.95);
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		margin-top: auto;
	}

	.defect-summary {
		margin-bottom: 16px;
	}

	.defect-title {
		font-size: 16px;
		font-weight: 600;
		color: #dc2626;
		margin: 0 0 8px 0;
	}

	.defect-notes {
		width: 100%;
		min-height: 80px;
		resize: vertical;
	}

	.completion-actions {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.completion-status {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
	}

	.status-warning {
		background: #fef2f2;
		color: #991b1b;
		border: 1px solid #fecaca;
	}

	.status-defects {
		background: #fffbeb;
		color: #92400e;
		border: 1px solid #fde68a;
	}

	.status-ready {
		background: #f0fdf4;
		color: #166534;
		border: 1px solid #bbf7d0;
	}

	.status-incomplete {
		background: #f9fafb;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.complete-btn {
		width: 100%;
		padding: 16px;
		border-radius: 12px;
		font-size: 16px;
		font-weight: 600;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	.complete-btn.enabled {
		background: linear-gradient(135deg, #059669 0%, #10b981 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}

	.complete-btn.enabled:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
	}

	.complete-btn.disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	/* Photo Modal */
	.photo-modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
	}

	.photo-modal {
		background: white;
		border-radius: 12px;
		width: 100%;
		max-width: 400px;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		border-bottom: 1px solid #e5e7eb;
	}

	.modal-header h3 {
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		color: #6b7280;
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal-content {
		padding: 16px;
		flex: 1;
	}

	.photo-instruction {
		font-size: 14px;
		color: #374151;
		margin: 0 0 16px 0;
	}

	.camera-placeholder {
		background: #f3f4f6;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		padding: 32px;
		text-align: center;
		color: #6b7280;
	}

	.camera-note {
		font-size: 12px;
		color: #9ca3af;
		margin-top: 8px;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
		padding: 16px;
		border-top: 1px solid #e5e7eb;
	}

	.cancel-btn, .capture-btn {
		flex: 1;
		padding: 12px;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-btn {
		background: #f3f4f6;
		color: #374151;
		border: 1px solid #d1d5db;
	}

	.capture-btn {
		background: #3b82f6;
		color: white;
		border: 1px solid #3b82f6;
	}

	.capture-btn:hover {
		background: #2563eb;
		transform: translateY(-1px);
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.inspection-header {
			padding: 12px;
		}

		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.progress-indicator {
			align-self: flex-end;
		}

		.inspection-title {
			font-size: 18px;
		}

		.status-controls {
			grid-template-columns: 1fr;
			gap: 6px;
		}

		.status-btn {
			padding: 12px;
		}
	}

	/* General Notes Section */
	.general-notes-section {
		margin: 16px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
	}

	.notes-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.notes-header svg {
		color: #6b7280;
	}

	.notes-title {
		font-size: 16px;
		font-weight: 600;
		color: #1e293b;
		margin: 0;
	}

	.notes-description {
		margin-bottom: 12px;
	}

	.notes-description p {
		font-size: 13px;
		color: #6b7280;
		margin: 0;
		line-height: 1.4;
	}

	.general-notes-input {
		width: 100%;
		min-height: 100px;
		padding: 12px;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		font-size: 14px;
		line-height: 1.5;
		color: #374151;
		background: rgba(255, 255, 255, 0.8);
		resize: vertical;
		font-family: inherit;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.general-notes-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.general-notes-input::placeholder {
		color: #9ca3af;
	}
</style> 