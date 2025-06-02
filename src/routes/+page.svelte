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
	<title>Oil Field Temp Tracker - Dashboard</title>
	<meta name="description" content="Oil field temperature tracking and haul management system" />
</svelte:head>

<div class="dashboard-landing">
<!-- Header -->
	<div class="landing-header">
		<div class="header-content">
			<DryDriveLogo />
			<div class="header-text">
				<h1 class="main-title">Oil Field Temp Tracker</h1>
				<p class="main-subtitle">Select your role to access your dashboard</p>
	</div>
</div>
</div>

	<!-- Role Selection -->
	<div class="role-selection">
		<div class="roles-container">
			{#each roles as role}
				<RoleCard
					role={role.title}
					icon={role.icon}
					description={role.description}
					href={role.href}
				/>
					{/each}
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
		background: linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #e8f5e8 100%);
		display: flex;
		flex-direction: column;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.landing-header {
		padding: 40px 20px;
		text-align: center;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(20px);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
	}

	.header-content {
		max-width: 800px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.header-text {
		text-align: center;
	}

	.main-title {
		font-size: 32px;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 8px 0;
		line-height: 1.2;
	}

	.main-subtitle {
		font-size: 16px;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	.role-selection {
		flex: 1;
		padding: 40px 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.roles-container {
		width: 100%;
		max-width: 800px;
		display: grid;
		grid-template-columns: 1fr;
			gap: 20px;
	}

	@media (min-width: 768px) {
		.roles-container {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.main-title {
			font-size: 40px;
		}

		.main-subtitle {
			font-size: 18px;
		}
	}

	.landing-footer {
		padding: 20px;
		text-align: center;
		color: #64748b;
		font-size: 14px;
		background: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(10px);
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	@media (max-width: 640px) {
		.landing-header {
			padding: 30px 16px;
		}

		.role-selection {
			padding: 30px 16px;
		}

		.main-title {
			font-size: 28px;
		}

		.main-subtitle {
			font-size: 15px;
		}
	}
</style>
