<script lang="ts">
	import { Thermometer, Gauge, Shield, FileText, DollarSign, Satellite, AlertTriangle, CheckCircle } from 'lucide-svelte';
	
	export let haulData: any;

	function formatDateTime(dateString: string | null) {
		if (!dateString) return 'Not recorded';
		return new Date(dateString).toLocaleString();
	}

	function formatVolume(volume: number | null) {
		if (volume === null) return 'Not recorded';
		return `${volume.toFixed(1)} BBL`;
	}

	function formatTemperature(temp: number | null) {
		if (temp === null) return 'Not recorded';
		return `${temp.toFixed(1)}°F`;
	}

	function formatCurrency(amount: number) {
		return `$${amount.toFixed(2)}`;
	}

	function getSafetyStatus(level: number, alarm: number, critical: number) {
		if (level >= critical) return { status: 'critical', color: '#ef4444' };
		if (level >= alarm) return { status: 'warning', color: '#f59e0b' };
		return { status: 'safe', color: '#10b981' };
	}
</script>

<!-- Product Information -->
<section class="info-section">
	<h2><Gauge size={18} /> Product Information</h2>
	<div class="product-grid">
		<div class="detail-card">
			<h3>Product Specifications</h3>
			<div class="detail-grid">
				<div class="detail-item">
					<label>Product Type</label>
					<span>{haulData.product.type}</span>
				</div>
				<div class="detail-item">
					<label>Grade</label>
					<span>{haulData.product.grade}</span>
				</div>
				<div class="detail-item">
					<label>API Gravity</label>
					<span>{haulData.product.apiGravity}°</span>
				</div>
				<div class="detail-item">
					<label>Sulfur Content</label>
					<span>{haulData.product.sulfurContent}%</span>
				</div>
				<div class="detail-item">
					<label>Viscosity</label>
					<span>{haulData.product.viscosity}</span>
				</div>
				<div class="detail-item">
					<label>Flash Point</label>
					<span>{haulData.product.flashPoint}</span>
				</div>
				<div class="detail-item">
					<label>Pour Point</label>
					<span>{haulData.product.pourPoint}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Volume & Measurements -->
<section class="info-section">
	<h2><Gauge size={18} /> Volume & Measurements</h2>
	<div class="measurements-grid">
		<div class="detail-card">
			<h3>Gross Volume</h3>
			<div class="measurement-row">
				<div class="measurement-item">
					<label>Onload</label>
					<span class="volume-value">{formatVolume(haulData.measurements.gross.onload)}</span>
				</div>
				<div class="measurement-item">
					<label>Offload</label>
					<span class="volume-value">{formatVolume(haulData.measurements.gross.offload)}</span>
				</div>
				<div class="measurement-item">
					<label>Net</label>
					<span class="volume-value">{formatVolume(haulData.measurements.gross.net)}</span>
				</div>
			</div>
		</div>
		
		<div class="detail-card">
			<h3>Net Volume</h3>
			<div class="measurement-row">
				<div class="measurement-item">
					<label>Onload</label>
					<span class="volume-value">{formatVolume(haulData.measurements.net.onload)}</span>
				</div>
				<div class="measurement-item">
					<label>Offload</label>
					<span class="volume-value">{formatVolume(haulData.measurements.net.offload)}</span>
				</div>
				<div class="measurement-item">
					<label>Delivered</label>
					<span class="volume-value">{formatVolume(haulData.measurements.net.delivered)}</span>
				</div>
			</div>
		</div>
		
		<div class="detail-card loss-analysis">
			<h3>Loss Analysis</h3>
			<div class="loss-grid">
				<div class="loss-item">
					<label>Absolute Loss</label>
					<span class="loss-value">{formatVolume(haulData.measurements.loss.absolute)}</span>
				</div>
				<div class="loss-item">
					<label>Percentage Loss</label>
					<span class="loss-percentage">{haulData.measurements.loss.percentage.toFixed(3)}%</span>
				</div>
				<div class="loss-item">
					<label>Expected Loss</label>
					<span class="expected-loss">{formatVolume(haulData.measurements.loss.expectedLoss)}</span>
				</div>
				<div class="loss-item">
					<label>Variance</label>
					<span class="variance" class:over={haulData.measurements.loss.variance > 0} class:under={haulData.measurements.loss.variance < 0}>
						{haulData.measurements.loss.variance > 0 ? '+' : ''}{formatVolume(haulData.measurements.loss.variance)}
					</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Temperature Monitoring -->
<section class="info-section">
	<h2><Thermometer size={18} /> Temperature Monitoring</h2>
	<div class="temperature-grid">
		<div class="temp-card">
			<h3>Onload Temperature</h3>
			<div class="temp-readings">
				<div class="temp-item">
					<label>Product Temperature</label>
					<span class="temp-value">{formatTemperature(haulData.temperature.onload.product)}</span>
				</div>
				<div class="temp-item">
					<label>Ambient Temperature</label>
					<span class="temp-value">{formatTemperature(haulData.temperature.onload.ambient)}</span>
				</div>
				<div class="temp-item">
					<label>Recorded At</label>
					<span class="timestamp">{formatDateTime(haulData.temperature.onload.timestamp)}</span>
				</div>
			</div>
		</div>
		
		<div class="temp-card current">
			<h3>Current Temperature</h3>
			<div class="temp-readings">
				<div class="temp-item">
					<label>Product Temperature</label>
					<span class="temp-value current-temp">{formatTemperature(haulData.temperature.current.product)}</span>
				</div>
				<div class="temp-item">
					<label>Ambient Temperature</label>
					<span class="temp-value">{formatTemperature(haulData.temperature.current.ambient)}</span>
				</div>
				<div class="temp-item">
					<label>Last Update</label>
					<span class="timestamp">{formatDateTime(haulData.temperature.current.timestamp)}</span>
				</div>
			</div>
		</div>
		
		<div class="temp-card">
			<h3>Offload Temperature</h3>
			<div class="temp-readings">
				<div class="temp-item">
					<label>Product Temperature</label>
					<span class="temp-value">{formatTemperature(haulData.temperature.offload.product)}</span>
				</div>
				<div class="temp-item">
					<label>Ambient Temperature</label>
					<span class="temp-value">{formatTemperature(haulData.temperature.offload.ambient)}</span>
				</div>
				<div class="temp-item">
					<label>Recorded At</label>
					<span class="timestamp">{formatDateTime(haulData.temperature.offload.timestamp)}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Coriolis Meter Data -->
<section class="info-section">
	<h2><Gauge size={18} /> Coriolis Meter Data</h2>
	<div class="coriolis-grid">
		<div class="detail-card">
			<h3>Onload Measurements</h3>
			<div class="coriolis-data">
				<div class="detail-grid">
					<div class="detail-item">
						<label>Meter ID</label>
						<span>{haulData.coriolis.onload.meterId}</span>
					</div>
					<div class="detail-item">
						<label>Operator</label>
						<span>{haulData.coriolis.onload.operator}</span>
					</div>
					<div class="detail-item">
						<label>Gross Volume</label>
						<span>{formatVolume(haulData.coriolis.onload.grossVolume)}</span>
					</div>
					<div class="detail-item">
						<label>Net Volume</label>
						<span>{formatVolume(haulData.coriolis.onload.netVolume)}</span>
					</div>
					<div class="detail-item">
						<label>Density</label>
						<span>{haulData.coriolis.onload.density} g/cm³</span>
					</div>
					<div class="detail-item">
						<label>Temperature</label>
						<span>{formatTemperature(haulData.coriolis.onload.temperature)}</span>
					</div>
					<div class="detail-item">
						<label>Pressure</label>
						<span>{haulData.coriolis.onload.pressure} PSI</span>
					</div>
					<div class="detail-item">
						<label>Mass Flow</label>
						<span>{haulData.coriolis.onload.massFlow} kg/min</span>
					</div>
					<div class="detail-item span-2">
						<label>Timestamp</label>
						<span>{formatDateTime(haulData.coriolis.onload.timestamp)}</span>
					</div>
				</div>
			</div>
		</div>
		
		<div class="detail-card">
			<h3>Offload Measurements</h3>
			<div class="coriolis-data">
				{#if haulData.coriolis.offload.meterId}
					<div class="detail-grid">
						<div class="detail-item">
							<label>Meter ID</label>
							<span>{haulData.coriolis.offload.meterId}</span>
						</div>
						<div class="detail-item">
							<label>Operator</label>
							<span>{haulData.coriolis.offload.operator}</span>
						</div>
						<div class="detail-item">
							<label>Gross Volume</label>
							<span>{formatVolume(haulData.coriolis.offload.grossVolume)}</span>
						</div>
						<div class="detail-item">
							<label>Net Volume</label>
							<span>{formatVolume(haulData.coriolis.offload.netVolume)}</span>
						</div>
						<div class="detail-item">
							<label>Density</label>
							<span>{haulData.coriolis.offload.density} g/cm³</span>
						</div>
						<div class="detail-item">
							<label>Temperature</label>
							<span>{formatTemperature(haulData.coriolis.offload.temperature)}</span>
						</div>
						<div class="detail-item">
							<label>Pressure</label>
							<span>{haulData.coriolis.offload.pressure} PSI</span>
						</div>
						<div class="detail-item">
							<label>Mass Flow</label>
							<span>{haulData.coriolis.offload.massFlow} kg/min</span>
						</div>
						<div class="detail-item span-2">
							<label>Timestamp</label>
							<span>{formatDateTime(haulData.coriolis.offload.timestamp)}</span>
						</div>
					</div>
				{:else}
					<div class="pending-data">
						<AlertTriangle size={24} color="#f59e0b" />
						<p>Offload measurements not recorded yet</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Safety & Compliance -->
<section class="info-section">
	<h2><Shield size={18} /> Safety & Compliance</h2>
	<div class="safety-grid">
		<div class="detail-card">
			<h3>Pre-Trip Inspection</h3>
			<div class="safety-status">
				{#if haulData.safety.preTrip.completed}
					<div class="status-indicator completed">
						<CheckCircle size={20} />
						<span>Completed</span>
					</div>
				{:else}
					<div class="status-indicator pending">
						<AlertTriangle size={20} />
						<span>Pending</span>
					</div>
				{/if}
				<div class="detail-grid">
					<div class="detail-item">
						<label>Inspector</label>
						<span>{haulData.safety.preTrip.inspector}</span>
					</div>
					<div class="detail-item">
						<label>Completed At</label>
						<span>{formatDateTime(haulData.safety.preTrip.timestamp)}</span>
					</div>
					<div class="detail-item span-2">
						<label>Issues Found</label>
						<span>{haulData.safety.preTrip.issues.length === 0 ? 'None' : haulData.safety.preTrip.issues.join(', ')}</span>
					</div>
				</div>
			</div>
		</div>
		
		<div class="detail-card">
			<h3>H₂S Monitoring</h3>
			<div class="gas-monitoring">
				{#if haulData.safety.h2sLevels.current !== null}
					{@const safetyStatus = getSafetyStatus(haulData.safety.h2sLevels.current, haulData.safety.h2sLevels.alarm, haulData.safety.h2sLevels.critical)}
					<div class="gas-level" style="color: {safetyStatus.color};">
						<span class="level-value">{haulData.safety.h2sLevels.current.toFixed(1)}</span>
						<span class="level-unit">PPM</span>
						<span class="level-status">{safetyStatus.status.toUpperCase()}</span>
					</div>
				{/if}
				<div class="level-thresholds">
					<div class="threshold-item">
						<label>Alarm Level</label>
						<span>{haulData.safety.h2sLevels.alarm} PPM</span>
					</div>
					<div class="threshold-item">
						<label>Critical Level</label>
						<span>{haulData.safety.h2sLevels.critical} PPM</span>
					</div>
					<div class="threshold-item">
						<label>Max Recorded</label>
						<span>{haulData.safety.h2sLevels.max} PPM</span>
					</div>
					<div class="threshold-item">
						<label>Last Reading</label>
						<span>{formatDateTime(haulData.safety.h2sLevels.lastReading)}</span>
					</div>
				</div>
			</div>
		</div>
		
		<div class="detail-card">
			<h3>Gas Detection System</h3>
			<div class="gas-grid">
				<div class="gas-item">
					<label>LEL</label>
					<span class="gas-value">{haulData.safety.gasDetection.lel}%</span>
				</div>
				<div class="gas-item">
					<label>CO</label>
					<span class="gas-value">{haulData.safety.gasDetection.co} PPM</span>
				</div>
				<div class="gas-item">
					<label>O₂</label>
					<span class="gas-value">{haulData.safety.gasDetection.o2}%</span>
				</div>
				<div class="gas-item span-3">
					<label>Last Calibrated</label>
					<span>{formatDateTime(haulData.safety.gasDetection.lastCalibrated)}</span>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.info-section {
		background: rgba(248, 250, 252, 0.8);
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 20px;
		padding: 24px;
		margin-bottom: 24px;
	}

	.info-section h2 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 20px 0;
		font-size: 18px;
		font-weight: 600;
		color: #1e293b;
	}

	.product-grid,
	.measurements-grid,
	.temperature-grid,
	.coriolis-grid,
	.safety-grid {
		display: grid;
		gap: 20px;
	}

	.measurements-grid {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.temperature-grid {
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	}

	.coriolis-grid {
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
	}

	.safety-grid {
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
	}

	.detail-card {
		background: white;
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.detail-card h3 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: #334155;
	}

	.detail-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.detail-item.span-2 {
		grid-column: span 2;
	}

	.detail-item.span-3 {
		grid-column: span 3;
	}

	.detail-item label {
		font-size: 12px;
		font-weight: 500;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.detail-item span {
		font-size: 14px;
		font-weight: 500;
		color: #1e293b;
	}

	/* Measurement specific styles */
	.measurement-row {
		display: flex;
		justify-content: space-between;
		gap: 16px;
	}

	.measurement-item {
		text-align: center;
		flex: 1;
	}

	.volume-value {
		font-size: 18px !important;
		font-weight: 600 !important;
		color: #059669 !important;
		font-family: 'JetBrains Mono', monospace;
	}

	.loss-analysis {
		border-left: 4px solid #f59e0b;
	}

	.loss-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}

	.loss-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-align: center;
	}

	.loss-value,
	.loss-percentage,
	.expected-loss {
		font-size: 16px !important;
		font-weight: 600 !important;
		font-family: 'JetBrains Mono', monospace;
	}

	.variance {
		font-size: 16px !important;
		font-weight: 600 !important;
		font-family: 'JetBrains Mono', monospace;
	}

	.variance.over {
		color: #dc2626 !important;
	}

	.variance.under {
		color: #059669 !important;
	}

	/* Temperature styles */
	.temp-card {
		background: white;
		border: 1px solid rgba(226, 232, 240, 0.8);
		border-radius: 16px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.temp-card.current {
		border-left: 4px solid #059669;
		background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
	}

	.temp-readings {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.temp-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.temp-value {
		font-size: 16px !important;
		font-weight: 600 !important;
		font-family: 'JetBrains Mono', monospace;
		color: #059669 !important;
	}

	.current-temp {
		font-size: 18px !important;
		color: #047857 !important;
	}

	.timestamp {
		font-size: 12px !important;
		color: #64748b !important;
		font-family: 'JetBrains Mono', monospace;
	}

	/* Safety styles */
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
		padding: 8px 12px;
		border-radius: 8px;
		font-weight: 500;
	}

	.status-indicator.completed {
		background: #dcfce7;
		color: #166534;
	}

	.status-indicator.pending {
		background: #fef3c7;
		color: #92400e;
	}

	.gas-level {
		text-align: center;
		margin-bottom: 16px;
	}

	.level-value {
		font-size: 32px;
		font-weight: 700;
		font-family: 'JetBrains Mono', monospace;
	}

	.level-unit {
		font-size: 14px;
		font-weight: 500;
		margin-left: 4px;
	}

	.level-status {
		display: block;
		font-size: 12px;
		font-weight: 600;
		margin-top: 4px;
		letter-spacing: 0.5px;
	}

	.level-thresholds {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.threshold-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.gas-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 12px;
	}

	.gas-item {
		display: flex;
		flex-direction: column;
		gap: 4px;
		text-align: center;
	}

	.gas-value {
		font-size: 16px !important;
		font-weight: 600 !important;
		font-family: 'JetBrains Mono', monospace;
		color: #059669 !important;
	}

	.pending-data {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		padding: 40px 20px;
		color: #64748b;
		text-align: center;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.measurements-grid,
		.temperature-grid,
		.coriolis-grid,
		.safety-grid {
			grid-template-columns: 1fr;
		}
		
		.detail-grid {
			grid-template-columns: 1fr;
		}
		
		.detail-item.span-2,
		.detail-item.span-3 {
			grid-column: span 1;
		}
		
		.measurement-row {
			flex-direction: column;
			gap: 12px;
		}
		
		.gas-grid {
			grid-template-columns: 1fr;
		}
		
		.level-thresholds {
			grid-template-columns: 1fr;
		}
	}
</style> 