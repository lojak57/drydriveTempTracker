<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckCircle, AlertTriangle, XCircle, Camera, FileText, Wrench, Cog, Settings, Shield, Truck, Beaker } from 'lucide-svelte';

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

	function getCategoryIcon(category: string) {
		const icons: Record<string, any> = {
			'Exterior': Truck,
			'Engine': Cog,
			'Interior': Settings,
			'Brakes': Shield,
			'Coupling': Wrench,
			'Tank': Beaker,
			'Safety': Shield
		};
		return icons[category] || Shield;
	}
</script>

<div class="pre-trip-inspection font-sans text-sm text-slate-800">
	<!-- Header -->
	<div class="inspection-header bg-white border-b border-slate-200 p-4 sticky top-0 z-20">
		<div class="header-content max-w-4xl mx-auto flex justify-between items-center">
			<div class="truck-info flex-1">
				<h1 class="text-xl font-semibold text-slate-800">Pre-Trip Inspection</h1>
				<div class="vehicle-details flex items-center gap-2 text-sm text-slate-600">
					<span class="font-mono font-semibold text-slate-800">{truckId}</span>
					<span>•</span>
					<span class="font-mono font-semibold text-slate-800">{trailerNumber}</span>
				</div>
				<div class="inspection-meta flex items-center gap-2 text-xs text-slate-500">
					<span>{driverName}</span>
					<span>•</span>
					<span>{currentDate.toLocaleDateString()}</span>
				</div>
			</div>
			<div class="progress-indicator flex flex-col items-center gap-2">
				<div class="progress-circle relative w-16 h-16">
					<svg class="progress-ring w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
						<circle class="progress-ring-background" cx="32" cy="32" r="28" 
							fill="none" stroke="#e5e7eb" stroke-width="4" />
						<circle class="progress-ring-progress" cx="32" cy="32" r="28"
							fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round"
							style="stroke-dasharray: {176}; stroke-dashoffset: {176 - (176 * completionPercent / 100)}; transition: stroke-dashoffset 0.3s ease" />
					</svg>
					<span class="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-800">{completionPercent}%</span>
				</div>
				<div class="progress-stats text-center text-xs">
					<span class="text-green-600 font-semibold">{completedItems}/{totalItems}</span>
					{#if failedItems > 0}
						<div class="text-red-500 font-semibold">{failedItems} defects</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Page Break Separator -->
	<div class="page-break-separator border-t-2 border-slate-300 mt-6 pt-6 bg-slate-100">
		<div class="max-w-4xl mx-auto px-4">
			<h2 class="text-lg font-semibold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-3">
				<CheckCircle size={20} class="text-slate-600" />
				Start Inspection
			</h2>
			<p class="text-sm text-slate-600">Complete all vehicle inspection categories below to proceed with your shift</p>
		</div>
	</div>

	<!-- Inspection Form -->
	<div class="inspection-content max-w-4xl mx-auto p-4">
		<div class="inspection-grid grid gap-6">
			{#each Object.entries(groupedItems) as [category, items]}
				<div class="inspection-card rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
					<div class="inspection-card-header flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
						<h3 class="text-base font-semibold text-slate-700 flex items-center gap-2">
							<svelte:component this={getCategoryIcon(category)} size={16} class="text-slate-600" />
							{category} Inspection
						</h3>
						<div class="category-progress flex items-center gap-3 text-xs">
							<span class="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-semibold">
								{items.filter(item => item.status !== 'pending').length}/{items.length}
							</span>
							<span class="text-slate-600 font-medium">
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
					
					<div class="category-description mb-4 p-3 bg-slate-50 rounded border-l-3 border-blue-300">
						{#if category === 'Exterior'}
							<p class="text-sm text-slate-600 italic">Inspect vehicle exterior components including tires, lights, and body condition</p>
						{:else if category === 'Engine'}
							<p class="text-sm text-slate-600 italic">Check engine compartment fluids, belts, and mechanical components</p>
						{:else if category === 'Interior'}
							<p class="text-sm text-slate-600 italic">Verify cab safety equipment and operational controls</p>
						{:else if category === 'Brakes'}
							<p class="text-sm text-slate-600 italic">Test braking system components and air pressure systems</p>
						{:else if category === 'Coupling'}
							<p class="text-sm text-slate-600 italic">Inspect trailer connection points and electrical systems</p>
						{:else if category === 'Tank'}
							<p class="text-sm text-slate-600 italic">Verify tank integrity and valve operation for safe transport</p>
						{:else if category === 'Safety'}
							<p class="text-sm text-slate-600 italic">Confirm emergency equipment and regulatory compliance</p>
						{/if}
					</div>

					<div class="category-items grid grid-cols-2 gap-3">
						{#each items as item}
							<div class="inspection-item bg-white border border-slate-200 rounded p-3 {item.critical ? 'border-l-4 border-l-red-500' : ''}">
								<div class="item-header flex justify-between items-start gap-3 mb-3">
									<div class="item-description flex-1">
										<span class="text-sm text-slate-700 leading-tight block">{item.description}</span>
										{#if item.critical}
											<span class="critical-badge bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block">
												Critical Safety Item
											</span>
										{/if}
									</div>
									<div class="item-actions flex-shrink-0">
										{#if item.photoRequired || item.status === 'fail' || item.status === 'defect'}
											<button 
												class="photo-btn border border-blue-300 text-blue-600 bg-blue-50 hover:bg-blue-100 p-1.5 rounded flex items-center gap-1 transition-colors {item.photoTaken ? 'border-green-300 text-green-600 bg-green-50' : ''}"
												on:click={() => takePhoto(item)}
											>
												<Camera size={14} />
												{#if item.photoTaken}
													<span class="text-xs">✓</span>
												{/if}
											</button>
										{/if}
									</div>
								</div>
								
								<div class="status-controls grid grid-cols-3 gap-2">
									<button 
										class="status-btn border border-slate-400 text-slate-700 bg-transparent hover:bg-slate-100 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors {item.status === 'pass' ? 'border-green-500 text-green-700 bg-green-50' : ''}"
										on:click={() => updateItemStatus(item.id, 'pass')}
									>
										<CheckCircle size={14} />
										<span>Pass</span>
									</button>
									<button 
										class="status-btn border border-slate-400 text-slate-700 bg-transparent hover:bg-slate-100 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors {item.status === 'fail' ? 'border-red-500 text-red-700 bg-red-50' : ''}"
										on:click={() => updateItemStatus(item.id, 'fail')}
									>
										<XCircle size={14} />
										<span>Fail</span>
									</button>
									<button 
										class="status-btn border border-slate-400 text-slate-700 bg-transparent hover:bg-slate-100 px-2 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors {item.status === 'defect' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}"
										on:click={() => updateItemStatus(item.id, 'defect')}
									>
										<AlertTriangle size={14} />
										<span>Defect</span>
									</button>
								</div>

								{#if item.status === 'fail' || item.status === 'defect'}
									<div class="notes-section mt-3">
										<textarea 
											class="notes-input w-full min-h-[60px] border border-slate-300 rounded p-2 text-sm resize-vertical"
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
	</div>

	<!-- General Notes Section -->
	<div class="general-notes-section max-w-4xl mx-auto m-4 p-5 bg-white border border-slate-200 rounded-lg shadow-sm">
		<div class="notes-header flex items-center gap-2 mb-2">
			<FileText size={20} class="text-slate-600" />
			<h3 class="text-base font-semibold text-slate-800">General Notes</h3>
		</div>
		<div class="notes-description mb-3">
			<p class="text-sm text-slate-600">Add any additional observations, concerns, or maintenance recommendations</p>
		</div>
		<textarea 
			class="general-notes-input w-full min-h-[100px] p-3 border border-slate-300 rounded text-sm leading-relaxed text-slate-700 bg-slate-50 resize-vertical transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
			placeholder="Enter any general observations, maintenance notes, or recommendations..."
			bind:value={generalNotes}
			rows="4"
		></textarea>
	</div>

	<!-- Completion Section -->
	<div class="completion-section max-w-4xl mx-auto p-4 bg-white border-t border-slate-200">
		{#if failedItems > 0}
			<div class="defect-summary mb-4">
				<h3 class="text-base font-semibold text-red-600 mb-2">Defects Summary</h3>
				<textarea 
					class="defect-notes w-full min-h-[80px] p-3 border border-slate-300 rounded text-sm resize-vertical"
					placeholder="Additional notes about defects and corrective actions taken..."
					bind:value={defectNotes}
				></textarea>
			</div>
		{/if}

		<div class="completion-actions flex flex-col gap-3">
			<div class="completion-status flex items-center gap-2 p-3 rounded border">
				{#if criticalFailures > 0}
					<div class="status-warning bg-red-50 border-red-200 text-red-700 flex items-center gap-2">
						<AlertTriangle size={20} />
						<span class="text-sm font-medium">Vehicle cannot operate with critical defects</span>
					</div>
				{:else if failedItems > 0}
					<div class="status-defects bg-yellow-50 border-yellow-200 text-yellow-700 flex items-center gap-2">
						<FileText size={20} />
						<span class="text-sm font-medium">Defects noted - maintenance required</span>
					</div>
				{:else if canComplete}
					<div class="status-ready bg-green-50 border-green-200 text-green-700 flex items-center gap-2">
						<CheckCircle size={20} />
						<span class="text-sm font-medium">Vehicle ready for operation</span>
					</div>
				{:else}
					<div class="status-incomplete bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-2">
						<AlertTriangle size={20} />
						<span class="text-sm font-medium">Complete all inspections to continue</span>
					</div>
				{/if}
			</div>

			<button 
				class="complete-btn w-full p-4 rounded-lg text-base font-semibold border transition-all flex items-center justify-center gap-2 {canComplete ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100' : 'border-slate-300 text-slate-400 bg-slate-50 cursor-not-allowed'}"
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
	<div class="photo-modal-overlay fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
		<div class="photo-modal bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
			<div class="modal-header flex justify-between items-center p-4 border-b border-slate-200">
				<h3 class="text-lg font-semibold text-slate-800">Photo Documentation</h3>
				<button class="close-btn text-slate-600 hover:text-slate-800 text-2xl w-8 h-8 flex items-center justify-center" on:click={() => showPhotoModal = false}>×</button>
			</div>
			<div class="modal-content p-4 flex-1">
				<p class="photo-instruction text-sm text-slate-700 mb-4">Take a photo of: {selectedItemForPhoto.description}</p>
				<div class="camera-placeholder bg-slate-100 border-2 border-dashed border-slate-300 rounded p-8 text-center text-slate-600">
					<Camera size={48} class="mx-auto mb-2" />
					<p>Camera interface would appear here</p>
					<p class="camera-note text-xs text-slate-500 mt-2">(In production: live camera feed)</p>
				</div>
			</div>
			<div class="modal-actions flex gap-3 p-4 border-t border-slate-200">
				<button class="cancel-btn flex-1 border border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100 py-3 rounded font-medium transition-colors" on:click={() => showPhotoModal = false}>
					Cancel
				</button>
				<button class="capture-btn flex-1 border border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 py-3 rounded font-medium transition-colors" on:click={completePhotoCapture}>
					Capture Photo
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Mobile responsiveness for inspection grid */
	@media (max-width: 768px) {
		.category-items {
			grid-template-columns: 1fr;
		}
		
		.header-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 12px;
		}

		.progress-indicator {
			align-self: flex-end;
		}

		.status-controls {
			grid-template-columns: 1fr;
			gap: 6px;
		}
	}

	@media (max-width: 640px) {
		.inspection-grid {
			gap: 16px;
		}
		
		.inspection-card {
			padding: 16px;
		}
	}
</style> 