<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, X, Home, Truck, FileText, BarChart3, Settings, Users, MapPin, AlertTriangle, Wrench, DollarSign, Clock, Shield, Globe, TrendingUp, Thermometer } from 'lucide-svelte';
	import DryDriveLogo from './DryDriveLogo.svelte';

	let mobileMenuOpen = $state(false);

	// Clean navigation structure - only working routes
	const navigationSections = [
		{
			title: 'Role Dashboards',
			items: [
				{ href: '/', label: 'Dashboards', icon: Home, description: 'Role selection and main dashboards' }
			]
		},
		{
			title: 'Analytics',
			items: [
				{ href: '/master-dispatch', label: 'Fleet Intelligence Nexus', icon: BarChart3, description: 'Executive fleet intelligence and analytics' }
			]
		},
		{
			title: 'Monitoring',
			items: [
				{ href: '/monitoring/truck-diagram', label: 'Live Truck Monitoring', icon: BarChart3, description: 'Interactive valve and sensor monitoring' }
			]
		},
		{
			title: 'Calibration',
			items: [
				{ href: '/calibration/smart-recommender', label: 'Coriolis Calibration Status', icon: BarChart3, description: 'Coriolis flow meter calibration management' }
			]
		},
		{
			title: 'Management',
			items: [
				{ href: '/documents', label: 'Document Center', icon: FileText, description: 'Compliance & file management' },
				{ href: '/admin', label: 'System Admin', icon: Settings, description: 'Administrative controls' }
			]
		}
	];

	const navigationItems = [
		{ href: '/driver', label: 'Driver Center', icon: Truck, description: 'Real-time tracking and workflow' },
		{ href: '/dispatch', label: 'Dispatch Hub', icon: MapPin, description: 'Operations and fleet management' },
		{ href: '/executive', label: 'Executive Dashboard', icon: BarChart3, description: 'Strategic insights for PAA leadership' },
		{ href: '/regional', label: 'Regional Manager', icon: Globe, description: 'Multi-region oversight and comparison' },
		{ href: '/safety', label: 'Safety Central', icon: Shield, description: 'Risk mitigation and compliance' },
		{ href: '/analytics', label: 'Yard Analytics', icon: TrendingUp, description: 'Performance and efficiency metrics' },
		{ href: '/maintenance', label: 'Fleet Management', icon: Wrench, description: 'Vehicle status and maintenance tracking' },
		{ href: '/thermal', label: 'Thermal Analysis', icon: Thermometer, description: 'DryDrive temperature insights' },
		{ href: '/calibration', label: 'Coriolis Calibration Status', icon: Settings, description: 'Flow meter calibration management' }
	];

	function isActiveRoute(href: string): boolean {
		if (href === '/') {
			return $page.url.pathname === '/';
		}
		return $page.url.pathname.startsWith(href);
	}

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<nav class="navigation-container">
	<!-- Desktop Navigation -->
	<div class="desktop-nav">
		<div class="nav-header">
			<a href="/" class="logo-container">
				<DryDriveLogo size={120} />
				<div class="logo-text">
					<span class="brand-name">VeriHaul</span>
					<span class="brand-tagline">Powered by DryDrive</span>
				</div>
			</a>
		</div>

		<div class="nav-sections">
			{#each navigationSections as section}
				<div class="nav-section">
					<h3 class="section-title">{section.title}</h3>
					<div class="section-items">
						{#each section.items as item}
							<a 
								href={item.href} 
								class="nav-item"
								class:active={isActiveRoute(item.href)}
								title={item.description}
							>
								<div class="nav-item-icon">
									<svelte:component this={item.icon} size={18} />
								</div>
								<div class="nav-item-content">
									<span class="nav-item-label">{item.label}</span>
									<span class="nav-item-description">{item.description}</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="nav-footer">
			<div class="system-status">
				<div class="status-indicator online"></div>
				<span class="status-text">System Online</span>
			</div>
			<div class="version-info">v2.1.0</div>
		</div>
	</div>

	<!-- Mobile Navigation -->
	<div class="mobile-nav">
		<div class="mobile-header">
			<a href="/" class="mobile-logo">
				<DryDriveLogo size={80} />
				<span class="mobile-brand">VeriHaul</span>
			</a>
			<button 
				class="mobile-menu-toggle"
				onclick={toggleMobileMenu}
				aria-label="Toggle navigation menu"
			>
				{#if mobileMenuOpen}
					<X size={24} />
				{:else}
					<Menu size={24} />
				{/if}
			</button>
		</div>

		{#if mobileMenuOpen}
			<!-- Mobile Menu Backdrop -->
			<div class="mobile-backdrop" onclick={closeMobileMenu}></div>
			<div class="mobile-menu open" role="dialog" aria-modal="true">
				<div class="mobile-menu-content">
					{#each navigationSections as section}
						<div class="mobile-section">
							<h3 class="mobile-section-title">{section.title}</h3>
							<div class="mobile-section-items">
								{#each section.items as item}
									<a 
										href={item.href} 
										class="mobile-nav-item"
										class:active={isActiveRoute(item.href)}
										onclick={closeMobileMenu}
									>
										<svelte:component this={item.icon} size={20} />
										<div class="mobile-item-content">
											<span class="mobile-item-label">{item.label}</span>
											<span class="mobile-item-description">{item.description}</span>
										</div>
									</a>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</nav>

<style>
	/* Mobile-First Approach - Start with mobile styles */
	.navigation-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 1000;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		background: rgba(15, 23, 42, 0.95);
		backdrop-filter: blur(24px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	/* Mobile Navigation (Default) */
	.desktop-nav {
		display: none;
	}

	.mobile-nav {
		display: block;
	}

	.mobile-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 16px;
		height: 40px;
		background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
	}

	.mobile-logo {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
	}

	.mobile-brand {
		font-size: 16px;
		font-weight: 700;
		color: #ffffff;
	}

	.mobile-menu-toggle {
		background: none;
		border: none;
		color: #e2e8f0;
		cursor: pointer;
		padding: 8px;
		border-radius: 8px;
		transition: all 0.2s ease;
	}

	.mobile-menu-toggle:hover {
		background: rgba(124, 179, 66, 0.2);
		color: #7CB342;
	}

	.mobile-backdrop {
		position: fixed;
		top: 40px;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
		opacity: 0;
		animation: fadeIn 0.3s ease forwards;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}

	.mobile-menu {
		position: fixed;
		top: 40px;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(15, 23, 42, 0.98);
		backdrop-filter: blur(24px);
		overflow-y: auto;
		z-index: 999;
		transform: translateY(-100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.mobile-menu.open {
		transform: translateY(0);
	}

	.mobile-menu-content {
		padding: 16px;
		padding-bottom: 80px; /* Extra space for safe area */
	}

	.mobile-section {
		margin-bottom: 24px;
	}

	.mobile-section-title {
		font-size: 12px;
		font-weight: 600;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 12px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(124, 179, 66, 0.2);
	}

	.mobile-section-items {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.mobile-nav-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 12px;
		border-radius: 12px;
		text-decoration: none;
		transition: all 0.2s ease;
		color: #e2e8f0;
	}

	.mobile-nav-item:hover {
		background: rgba(124, 179, 66, 0.15);
		color: #7CB342;
	}

	.mobile-nav-item.active {
		background: linear-gradient(135deg, rgba(124, 179, 66, 0.25) 0%, rgba(85, 139, 47, 0.2) 100%);
		color: #7CB342;
		border: 1px solid rgba(124, 179, 66, 0.3);
	}

	.mobile-item-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.mobile-item-label {
		font-size: 16px;
		font-weight: 600;
		line-height: 1.2;
	}

	.mobile-item-description {
		font-size: 13px;
		font-weight: 400;
		color: #94a3b8;
		line-height: 1.2;
	}

	/* Desktop Navigation - Enhanced for larger screens */
	@media (min-width: 1025px) {
		.navigation-container {
			position: fixed;
			top: 0;
			left: 0;
			right: auto;
			bottom: 0;
			width: 280px;
			height: 100vh;
			border-right: 1px solid rgba(255, 255, 255, 0.2);
			border-bottom: none;
			box-shadow: 
				0 8px 32px rgba(0, 0, 0, 0.1),
				0 2px 8px rgba(0, 0, 0, 0.05);
		}

		.desktop-nav {
			display: flex;
			flex-direction: column;
			height: 100%;
			padding: 0;
		}

		.mobile-nav {
			display: none;
		}

		.nav-header {
			padding: 12px 16px;
			border-bottom: 1px solid rgba(148, 163, 184, 0.3);
			background: linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%);
		}

		.logo-container {
			display: flex;
			align-items: center;
			gap: 12px;
			text-decoration: none;
			transition: all 0.3s ease;
		}

		.logo-container:hover {
			transform: translateY(-1px);
		}

		.logo-text {
			display: flex;
			flex-direction: column;
		}

		.brand-name {
			font-size: 18px;
			font-weight: 700;
			color: #ffffff;
			line-height: 1.2;
		}

		.brand-tagline {
			font-size: 11px;
			font-weight: 500;
			color: #7CB342;
			line-height: 1.2;
		}

		.nav-sections {
			flex: 1;
			overflow-y: auto;
			padding: 16px 0;
			scrollbar-width: none;
			-ms-overflow-style: none;
		}

		.nav-sections::-webkit-scrollbar {
			display: none;
		}

		.nav-section {
			margin-bottom: 24px;
		}

		.section-title {
			font-size: 12px;
			font-weight: 600;
			color: #6b7280;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			margin: 0 20px 12px 20px;
			padding-bottom: 4px;
			border-bottom: 1px solid rgba(124, 179, 66, 0.1);
		}

		.section-items {
			display: flex;
			flex-direction: column;
			gap: 2px;
		}

		.nav-item {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 12px 20px;
			margin: 0 8px;
			border-radius: 12px;
			text-decoration: none;
			transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
			position: relative;
			overflow: hidden;
		}

		.nav-item::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 3px;
			background: linear-gradient(135deg, #7CB342 0%, #558B2F 100%);
			transform: scaleY(0);
			transition: transform 0.2s ease;
		}

		.nav-item:hover {
			background: rgba(124, 179, 66, 0.08);
			transform: translateX(4px);
		}

		.nav-item:hover::before {
			transform: scaleY(1);
		}

		.nav-item.active {
			background: linear-gradient(135deg, rgba(124, 179, 66, 0.15) 0%, rgba(85, 139, 47, 0.1) 100%);
			border: 1px solid rgba(124, 179, 66, 0.2);
			transform: translateX(4px);
		}

		.nav-item.active::before {
			transform: scaleY(1);
		}

		.nav-item-icon {
			color: #6b7280;
			transition: color 0.2s ease;
			flex-shrink: 0;
		}

		.nav-item:hover .nav-item-icon,
		.nav-item.active .nav-item-icon {
			color: #558B2F;
		}

		.nav-item-content {
			display: flex;
			flex-direction: column;
			gap: 2px;
			flex: 1;
			min-width: 0;
		}

		.nav-item-label {
			font-size: 14px;
			font-weight: 600;
			color: #1f2937;
			line-height: 1.2;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.nav-item.active .nav-item-label {
			color: #558B2F;
			font-weight: 700;
		}

		.nav-item-description {
			font-size: 11px;
			font-weight: 400;
			color: #9ca3af;
			line-height: 1.2;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.nav-footer {
			padding: 16px 20px;
			border-top: 1px solid rgba(124, 179, 66, 0.1);
			background: rgba(124, 179, 66, 0.02);
		}

		.system-status {
			display: flex;
			align-items: center;
			gap: 8px;
			margin-bottom: 8px;
		}

		.status-indicator {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: #10b981;
			animation: pulse 2s infinite;
		}

		.status-indicator.online {
			background: #10b981;
		}

		@keyframes pulse {
			0%, 100% {
				opacity: 1;
			}
			50% {
				opacity: 0.5;
			}
		}

		.status-text {
			font-size: 12px;
			font-weight: 500;
			color: #374151;
		}

		.version-info {
			font-size: 10px;
			font-weight: 400;
			color: #9ca3af;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.navigation-container {
			background: rgba(30, 30, 30, 0.95);
			border-right-color: rgba(255, 255, 255, 0.1);
			border-bottom-color: rgba(255, 255, 255, 0.1);
		}

		.brand-name,
		.nav-item-label,
		.status-text,
		.mobile-brand {
			color: #f3f4f6;
		}

		.nav-item-description,
		.mobile-item-description {
			color: #6b7280;
		}

		.mobile-menu {
			background: rgba(30, 30, 30, 0.98);
		}
	}
</style> 