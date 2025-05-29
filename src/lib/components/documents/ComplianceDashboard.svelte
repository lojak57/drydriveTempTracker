<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { AlertTriangle, CheckCircle, Clock, XCircle, FileText, TrendingUp, Calendar, Shield, Download } from 'lucide-svelte';
  import { documentStats, complianceAlerts, documents, documentActions, type ComplianceAlert } from '$lib/stores/documentStore';
  import MetricCard from '$lib/components/ui/MetricCard.svelte';
  import Chart from '$lib/components/charts/Chart.svelte';
  
  export let customerId: string | undefined = undefined;
  
  let selectedTimeframe: '7d' | '30d' | '90d' | '1y' = '30d';
  let showOnlyExpiring = false;
  let currentTime = new Date(1735064220000); // Static timestamp for SSR consistency
  
  // Update to current time once mounted
  onMount(() => {
    currentTime = new Date();
  });
  
  // Filter alerts by customer if specified
  $: filteredAlerts = customerId 
    ? $complianceAlerts.filter(alert => {
        const doc = $documents.find(d => d.id === alert.documentId);
        return doc?.customerId === customerId;
      })
    : $complianceAlerts;
  
  // Filter documents by customer if specified
  $: filteredDocuments = customerId 
    ? $documents.filter(doc => doc.customerId === customerId)
    : $documents;
  
  // Calculate filtered stats
  $: filteredStats = (() => {
    const total = filteredDocuments.length;
    const valid = filteredDocuments.filter(doc => doc.status === 'valid').length;
    const expired = filteredDocuments.filter(doc => doc.status === 'expired').length;
    const expiring = filteredDocuments.filter(doc => doc.status === 'expiring_soon').length;
    const pending = filteredDocuments.filter(doc => doc.status === 'pending').length;
    
    const complianceScore = total > 0 ? Math.round(((valid + pending) / total) * 100) : 100;
    
    return {
      totalDocuments: total,
      validDocuments: valid,
      expiredDocuments: expired,
      expiringDocuments: expiring,
      pendingDocuments: pending,
      complianceScore,
      lastUpdated: currentTime
    };
  })();
  
  // Compliance Score Chart Data
  $: complianceChartData = {
    labels: ['Valid', 'Pending', 'Expiring', 'Expired'],
    datasets: [{
      data: [
        filteredStats.validDocuments,
        filteredStats.pendingDocuments,
        filteredStats.expiringDocuments,
        filteredStats.expiredDocuments
      ],
      backgroundColor: [
        '#10b981',
        '#f59e0b',
        '#FF6B35',
        '#ef4444'
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };
  
  // Document Type Distribution Chart Data
  $: documentTypeDistribution = (() => {
    const distribution: { [key: string]: number } = {};
    filteredDocuments.forEach(doc => {
      distribution[doc.type] = (distribution[doc.type] || 0) + 1;
    });
    return Object.entries(distribution).map(([type, count]) => ({ type, count }));
  })();
  
  $: distributionChartData = {
    labels: documentTypeDistribution.map(item => item.type),
    datasets: [{
      label: 'Document Count',
      data: documentTypeDistribution.map(item => item.count),
      backgroundColor: [
        '#004E89',
        '#FF6B35',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
        '#84cc16'
      ],
      borderWidth: 0,
      borderRadius: 4
    }]
  };
  
  // Get compliance score color
  const getComplianceColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#f59e0b';
    if (score >= 60) return '#FF6B35';
    return '#ef4444';
  };
  
  // Get alert severity color
  const getAlertColor = (severity: ComplianceAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };
  
  // Get alert icon
  const getAlertIcon = (type: ComplianceAlert['type']) => {
    switch (type) {
      case 'expired': return XCircle;
      case 'expiring': return AlertTriangle;
      case 'missing': return FileText;
      case 'invalid': return XCircle;
      default: return AlertTriangle;
    }
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get documents expiring in timeframe
  const getExpiringDocuments = (days: number) => {
    const futureDate = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
    
    return filteredDocuments.filter(doc => 
      doc.expiryDate && 
      doc.expiryDate > currentTime && 
      doc.expiryDate <= futureDate
    );
  };
  
  // Acknowledge alert
  const acknowledgeAlert = (alert: ComplianceAlert) => {
    documentActions.acknowledgeAlert(alert.id);
  };
  
  // Export compliance report
  const exportComplianceReport = () => {
    const reportData = {
      generatedAt: currentTime.toISOString(),
      customerId,
      stats: filteredStats,
      alerts: filteredAlerts,
      expiringDocuments: getExpiringDocuments(30)
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${formatDate(currentTime)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
</script>

<div class="compliance-dashboard">
  <!-- Header -->
  <div class="dashboard-header">
    <div class="header-left">
      <h1>Compliance Dashboard</h1>
      <p class="subtitle">Document compliance monitoring and alerts</p>
    </div>
    
    <div class="header-actions">
      <button class="export-btn" on:click={exportComplianceReport}>
        <Download size={16} />
        Export Report
      </button>
    </div>
  </div>
  
  <!-- Compliance Score -->
  <div class="compliance-score-section">
    <div class="score-card">
      <div class="score-header">
        <Shield class="score-icon" size={32} />
        <div>
          <h2>Compliance Score</h2>
          <p>Overall document compliance rating</p>
        </div>
      </div>
      
      <div class="score-display">
        <div class="score-chart">
          <Chart 
            type="doughnut" 
            data={complianceChartData}
            height={200}
            width={200}
            options={{
              cutout: '70%',
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  callbacks: {
                    label: function(context: any) {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
          <div class="score-overlay">
            <span class="score-number" style="color: {getComplianceColor(filteredStats.complianceScore)}">{filteredStats.complianceScore}%</span>
            <span class="score-label">Compliant</span>
          </div>
        </div>
        
        <div class="score-breakdown">
          <div class="breakdown-item">
            <CheckCircle class="text-green-500" size={16} />
            <span>{filteredStats.validDocuments} Valid</span>
          </div>
          <div class="breakdown-item">
            <Clock class="text-yellow-500" size={16} />
            <span>{filteredStats.pendingDocuments} Pending</span>
          </div>
          <div class="breakdown-item">
            <AlertTriangle class="text-orange-500" size={16} />
            <span>{filteredStats.expiringDocuments} Expiring</span>
          </div>
          <div class="breakdown-item">
            <XCircle class="text-red-500" size={16} />
            <span>{filteredStats.expiredDocuments} Expired</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Key Metrics -->
  <div class="metrics-grid">
    <MetricCard
      title="Total Documents"
      value={filteredStats.totalDocuments.toString()}
      unit=""
      trend="stable"
      icon="📄"
      color="blue"
    />
    
    <MetricCard
      title="Valid Documents"
      value={filteredStats.validDocuments.toString()}
      unit=""
      trend="up"
      icon="✅"
      color="emerald"
    />
    
    <MetricCard
      title="Expiring Soon"
      value={filteredStats.expiringDocuments.toString()}
      unit=""
      trend="down"
      icon="⚠️"
      color="amber"
    />
    
    <MetricCard
      title="Expired"
      value={filteredStats.expiredDocuments.toString()}
      unit=""
      trend="down"
      icon="❌"
      color="red"
    />
  </div>
  
  <!-- Alerts Section -->
  <div class="alerts-section">
    <div class="section-header">
      <h2>Compliance Alerts</h2>
      <div class="alert-filters">
        <label class="filter-checkbox">
          <input type="checkbox" bind:checked={showOnlyExpiring} />
          Show only expiring documents
        </label>
      </div>
    </div>
    
    {#if filteredAlerts.length === 0}
      <div class="no-alerts">
        <CheckCircle class="no-alerts-icon" size={48} />
        <h3>All Clear!</h3>
        <p>No compliance alerts at this time</p>
      </div>
    {:else}
      <div class="alerts-list">
        {#each filteredAlerts as alert}
          {#if !showOnlyExpiring || alert.type === 'expiring'}
            <div class="alert-card {getAlertColor(alert.severity)}">
              <div class="alert-header">
                <div class="alert-icon">
                  <svelte:component this={getAlertIcon(alert.type)} size={20} />
                </div>
                
                <div class="alert-content">
                  <h4 class="alert-title">{alert.message}</h4>
                  <p class="alert-action">{alert.actionRequired}</p>
                  
                  <div class="alert-meta">
                    <span class="alert-severity">{alert.severity.toUpperCase()}</span>
                    {#if alert.daysUntilExpiry !== undefined}
                      <span class="alert-days">{alert.daysUntilExpiry} days remaining</span>
                    {/if}
                    <span class="alert-date">{formatDate(alert.createdAt)}</span>
                  </div>
                </div>
                
                <div class="alert-actions">
                  <button 
                    class="acknowledge-btn"
                    on:click={() => acknowledgeAlert(alert)}
                    disabled={alert.acknowledged}
                  >
                    {alert.acknowledged ? 'Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    {/if}
  </div>
  
  <!-- Expiry Calendar -->
  <div class="expiry-section">
    <h2>Upcoming Expirations</h2>
    
    <div class="expiry-timeline">
      <div class="timeline-item">
        <div class="timeline-period">Next 7 Days</div>
        <div class="timeline-count critical">{getExpiringDocuments(7).length}</div>
      </div>
      
      <div class="timeline-item">
        <div class="timeline-period">Next 30 Days</div>
        <div class="timeline-count warning">{getExpiringDocuments(30).length}</div>
      </div>
      
      <div class="timeline-item">
        <div class="timeline-period">Next 90 Days</div>
        <div class="timeline-count info">{getExpiringDocuments(90).length}</div>
      </div>
    </div>
    
    {#if getExpiringDocuments(30).length > 0}
      <div class="expiring-documents">
        <h3>Documents Expiring in 30 Days</h3>
        <div class="expiring-list">
          {#each getExpiringDocuments(30) as doc}
            <div class="expiring-item">
              <FileText class="doc-icon" size={16} />
              <div class="doc-info">
                <span class="doc-name">{doc.fileName}</span>
                <span class="doc-type">{doc.type}</span>
              </div>
              <div class="doc-expiry">
                <Calendar size={14} />
                <span>{formatDate(doc.expiryDate!)}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Document Type Distribution -->
  <div class="distribution-section">
    <h2>Document Type Distribution</h2>
    
    <div class="distribution-chart">
      <Chart 
        type="bar" 
        data={distributionChartData}
        height={300}
        options={{
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }}
      />
    </div>
  </div>
</div>

<style>
  .compliance-dashboard {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
    min-height: 100vh;
  }
  
  /* Header */
  .dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 32px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .header-left h1 {
    font-size: 32px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  }
  
  .subtitle {
    color: #6b7280;
    margin-top: 8px;
    font-size: 16px;
  }
  
  .export-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #FF6B35 0%, #ff8c42 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.3);
  }
  
  .export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(255, 107, 53, 0.4);
  }
  
  /* Compliance Score Section */
  .compliance-score-section {
    margin-bottom: 32px;
  }
  
  .score-card {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .score-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  .score-icon {
    color: #004E89;
  }
  
  .score-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .score-header p {
    color: #6b7280;
    margin: 4px 0 0 0;
  }
  
  .score-display {
    display: flex;
    align-items: center;
    gap: 48px;
  }
  
  .score-chart {
    position: relative;
    width: 200px;
    height: 200px;
  }
  
  .score-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .score-number {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
  }
  
  .score-label {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  .score-breakdown {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .breakdown-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  /* Metrics Grid */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }
  
  /* Alerts Section */
  .alerts-section {
    margin-bottom: 32px;
  }
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  
  .section-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
  }
  
  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
  }
  
  .filter-checkbox input {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
  
  .no-alerts {
    text-align: center;
    padding: 80px 40px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  }
  
  .no-alerts-icon {
    color: #10b981;
    margin-bottom: 24px;
  }
  
  .no-alerts h3 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px 0;
  }
  
  .no-alerts p {
    color: #6b7280;
    font-size: 16px;
    margin: 0;
  }
  
  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .alert-card {
    padding: 24px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    border-left: 4px solid;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
  }
  
  .alert-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .alert-card.border-red-500 {
    border-left-color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
  }
  
  .alert-card.border-orange-500 {
    border-left-color: #f97316;
    background: rgba(249, 115, 22, 0.05);
  }
  
  .alert-card.border-yellow-500 {
    border-left-color: #eab308;
    background: rgba(234, 179, 8, 0.05);
  }
  
  .alert-card.border-blue-500 {
    border-left-color: #3b82f6;
    background: rgba(59, 130, 246, 0.05);
  }
  
  .alert-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }
  
  .alert-icon {
    flex-shrink: 0;
    margin-top: 4px;
    color: #6b7280;
  }
  
  .alert-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .alert-title {
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
    font-size: 16px;
  }
  
  .alert-action {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  .alert-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 12px;
    color: #9ca3af;
  }
  
  .alert-severity {
    padding: 4px 8px;
    background: rgba(107, 114, 128, 0.1);
    border-radius: 6px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .acknowledge-btn {
    padding: 8px 16px;
    font-size: 12px;
    background: #004E89;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 600;
  }
  
  .acknowledge-btn:hover:not(:disabled) {
    background: #003d6b;
    transform: translateY(-1px);
  }
  
  .acknowledge-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  /* Expiry Section */
  .expiry-section {
    margin-bottom: 32px;
  }
  
  .expiry-section h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 24px 0;
  }
  
  .expiry-timeline {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
  }
  
  .timeline-item {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.2s ease;
  }
  
  .timeline-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .timeline-period {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .timeline-count {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
  }
  
  .timeline-count.critical {
    color: #ef4444;
  }
  
  .timeline-count.warning {
    color: #f97316;
  }
  
  .timeline-count.info {
    color: #3b82f6;
  }
  
  .expiring-documents h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 20px 0;
  }
  
  .expiring-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .expiring-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.2s ease;
  }
  
  .expiring-item:hover {
    background: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
  }
  
  .doc-icon {
    color: #004E89;
    margin-right: 12px;
  }
  
  .doc-info {
    flex: 1;
  }
  
  .doc-name {
    display: block;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 4px;
  }
  
  .doc-type {
    display: block;
    font-size: 12px;
    color: #6b7280;
  }
  
  .doc-expiry {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #6b7280;
  }
  
  /* Distribution Section */
  .distribution-section {
    margin-bottom: 32px;
  }
  
  .distribution-section h2 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 24px 0;
  }
  
  .distribution-chart {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  
  .distribution-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .distribution-bar {
    width: 100%;
    height: 8px;
    background: rgba(0, 78, 137, 0.2);
    border-radius: 4px;
    overflow: hidden;
  }
  
  .distribution-fill {
    height: 100%;
    background: linear-gradient(90deg, #FF6B35 0%, #ff8c42 100%);
    transition: width 0.3s ease;
    border-radius: 4px;
  }
  
  .distribution-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
  }
  
  .type-name {
    color: #1a1a1a;
    font-weight: 500;
  }
  
  .type-count {
    color: #6b7280;
    font-weight: 600;
  }
  
  /* Color utilities */
  .text-green-500 { color: #10b981; }
  .text-yellow-500 { color: #eab308; }
  .text-orange-500 { color: #f97316; }
  .text-red-500 { color: #ef4444; }
  .text-blue-500 { color: #3b82f6; }
  
  /* Responsive Design */
  @media (max-width: 768px) {
    .compliance-dashboard {
      padding: 16px;
    }
    
    .dashboard-header {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;
      text-align: center;
    }
    
    .score-display {
      flex-direction: column;
      gap: 24px;
      align-items: center;
    }
    
    .score-chart {
      width: 120px;
      height: 120px;
    }
    
    .score-number {
      font-size: 24px;
    }
    
    .metrics-grid {
      grid-template-columns: 1fr;
    }
    
    .expiry-timeline {
      grid-template-columns: 1fr;
    }
    
    .section-header {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
    }
    
    .alert-header {
      flex-direction: column;
      gap: 12px;
    }
    
    .expiring-item {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;
    }
  }
</style> 