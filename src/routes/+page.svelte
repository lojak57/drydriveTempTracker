<script lang="ts">
	import RoleCard from '$lib/components/shared/RoleCard.svelte';
	import DryDriveLogo from '$lib/components/ui/DryDriveLogo.svelte';

	const roles = [
		{
			id: 'executive',
			title: 'Executive',
			icon: 'TrendingUp' as const,
			description: 'Strategic overview, KPIs, and financial performance',
			href: '/executive'
		},
		{
			id: 'regional',
			title: 'Regional Manager',
			icon: 'MapPin' as const,
			description: 'Multi-yard oversight, regional analytics, and strategic planning',
			href: '/regional'
		},
		{
			id: 'yard',
			title: 'Yard Manager',
			icon: 'Warehouse' as const,
			description: 'Fleet overview, driver management, and yard operations',
			href: '/yard'
		},
		{
			id: 'driver',
			title: 'Driver',
			icon: 'Truck' as const,
			description: 'Schedule, pre-trip inspection, and job management',
			href: '/driver'
		},
		{
			id: 'dispatch',
			title: 'Dispatch',
			icon: 'Radio' as const,
			description: 'Route planning, fleet status, and active hauls',
			href: '/dispatch'
		}
	];
</script>

<svelte:head>
	<title>VeriHaul - Oil Field Temperature Tracker</title>
	<meta name="description" content="VeriHaul - Advanced oil field temperature tracking and haul management system" />
</svelte:head>

<div class="dashboard-landing">
	<!-- Header -->
	<div class="landing-header">
		<div class="header-content">
			<DryDriveLogo />
			<div class="header-text">
				<h1 class="main-title">VeriHaul</h1>
				<p class="main-subtitle">AI-Driven Logistics for Oilfield Excellence</p>
				<p class="powered-by">Powered by DryDrive</p>
			</div>
		</div>
	</div>

	<!-- Role Selection -->
	<div class="role-selection">
		<div class="roles-container">
			{#each roles.slice(0, 4) as role}
				<RoleCard
					role={role.title}
					icon={role.icon}
					description={role.description}
					href={role.href}
				/>
			{/each}
		</div>
		
		<!-- Dispatch card in separate centered container -->
		<div class="dispatch-container">
			<RoleCard
				role={roles[4].title}
				icon={roles[4].icon}
				description={roles[4].description}
				href={roles[4].href}
			/>
		</div>
	</div>

	<!-- Footer Info -->
	<div class="landing-footer">
		<p>Secure access to real-time haul monitoring and fleet management</p>
	</div>
</div>

<style>
	.dashboard-landing {
		min-height: 100vh;
		/* Remove background so layout gradient shows through */
		background: transparent;
		display: flex;
		flex-direction: column;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.landing-header {
		padding: 20px 20px;
		text-align: center;
		background: linear-gradient(135deg, 
			rgba(248, 250, 252, 0.70) 0%,   /* Semi-transparent blue-gray */
			rgba(241, 245, 249, 0.75) 50%,  /* Semi-transparent slate */
			rgba(249, 250, 251, 0.70) 100%  /* Semi-transparent cool white */
		);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(148, 163, 184, 0.2); /* Neutral gray border */
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.header-text {
		text-align: center;
	}

	.main-title {
		font-size: 28px;
		font-weight: 700;
		color: #1e3a8a;
		margin: 0 0 6px 0;
		line-height: 1.2;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.main-subtitle {
		font-size: 15px;
		color: #475569;
		margin: 0 0 3px 0;
		line-height: 1.4;
		font-weight: 500;
	}

	.powered-by {
		font-size: 11px;
		color: #64748b;
		margin: 0;
		font-weight: 600;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.role-selection {
		flex: 1;
		padding: 40px 20px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.roles-container {
		width: 100%;
		max-width: 800px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 20px;
		margin-bottom: 20px;
	}

	.dispatch-container {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		display: flex;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.roles-container {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.main-title {
			font-size: 32px;
		}

		.main-subtitle {
			font-size: 16px;
		}

		.powered-by {
			font-size: 12px;
		}
	}

	.landing-footer {
		padding: 16px 20px;
		text-align: center;
		color: #64748b;
		font-size: 13px;
		background: linear-gradient(135deg,
			rgba(248, 250, 252, 0.80) 0%,   /* Clean blue-gray */
			rgba(249, 250, 251, 0.85) 100%  /* Cool white */
		);
		backdrop-filter: blur(15px);
		border-top: 1px solid rgba(148, 163, 184, 0.15); /* Neutral gray border */
	}

	@media (max-width: 640px) {
		.landing-header {
			padding: 16px 16px;
		}

		.role-selection {
			padding: 30px 16px;
		}

		.main-title {
			font-size: 24px;
		}

		.main-subtitle {
			font-size: 14px;
		}
		
		.header-content {
			gap: 10px;
		}
	}
</style>
