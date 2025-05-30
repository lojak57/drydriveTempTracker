<script lang="ts">
	import { selectedRole, isRoleView, availableRoles, clearRoleView } from '$lib/stores/roleStore';
	import { ChevronDown } from 'lucide-svelte';

	let isOpen = false;

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectRole(role: typeof $availableRoles[0]) {
		selectedRole.set(role);
		isOpen = false;
	}

	function handleBackToDashboard() {
		clearRoleView();
		isOpen = false;
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Element;
		if (!target.closest('.role-selector')) {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} />

<div class="role-selector">
	{#if $isRoleView}
		<!-- Role View - Show current role with back button -->
		<div class="current-role-display">
			<div class="role-info">
				<span class="role-icon" style="color: {$selectedRole.colorScheme.primary}">{$selectedRole.icon}</span>
				<div class="role-details">
					<span class="role-name" style="color: {$selectedRole.colorScheme.primary}">{$selectedRole.name}</span>
					<span class="role-title">{$selectedRole.title}</span>
				</div>
			</div>
			<button 
				class="back-button tap-target"
				on:click={handleBackToDashboard}
				title="Back to main dashboard"
			>
				← Dashboard
			</button>
		</div>
	{:else}
		<!-- Main Dashboard - Show role selector dropdown -->
		<div class="role-dropdown">
			<button 
				class="dropdown-trigger tap-target"
				on:click={toggleDropdown}
				aria-haspopup="true"
				aria-expanded={isOpen}
			>
				<span class="trigger-text">Select Your Role</span>
				<ChevronDown 
					size={18} 
					class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''} text-gray-600 flex-shrink-0" 
				/>
			</button>

			{#if isOpen}
				<div class="dropdown-menu touch-scroll" role="menu">
					<div class="menu-header">
						<h3>Choose your role to see a customized dashboard</h3>
					</div>
					<div class="role-options">
						{#each $availableRoles as role}
							<button 
								class="role-option tap-target"
								style="--primary-color: {role.colorScheme.primary}; --secondary-color: {role.colorScheme.secondary}"
								on:click={() => selectRole(role)}
								role="menuitem"
							>
								<div class="option-icon" style="background: {role.colorScheme.primary}15; color: {role.colorScheme.primary}">
									{role.icon}
								</div>
								<div class="option-details">
									<span class="option-name">{role.name}</span>
									<span class="option-title">{role.title}</span>
									<span class="option-description">{role.description}</span>
								</div>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.role-selector {
		position: relative;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		width: 100%;
		max-width: 400px;
	}

	/* Current Role Display - Mobile First */
	.current-role-display {
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 12px 16px;
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.08),
			0 1px 4px rgba(0, 0, 0, 0.04);
		gap: 12px;
		flex-wrap: wrap;
	}

	@media (min-width: 640px) {
		.current-role-display {
			border-radius: 20px;
			padding: 16px 24px;
			flex-wrap: nowrap;
		}
	}

	.role-info {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
		min-width: 0;
	}

	.role-icon {
		font-size: 24px;
		line-height: 1;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.role-icon {
			font-size: 28px;
		}
	}

	.role-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.role-name {
		font-size: 16px;
		font-weight: 700;
		line-height: 1.2;
	}

	@media (min-width: 640px) {
		.role-name {
			font-size: 18px;
		}
	}

	.role-title {
		font-size: 12px;
		font-weight: 500;
		color: #6b7280;
		line-height: 1.2;
	}

	@media (min-width: 640px) {
		.role-title {
			font-size: 14px;
		}
	}

	.back-button {
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.2);
		border-radius: 10px;
		color: #3b82f6;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		white-space: nowrap;
	}

	@media (min-width: 640px) {
		.back-button {
			padding: 10px 20px;
			font-size: 15px;
		}
	}

	.back-button:hover {
		background: rgba(59, 130, 246, 0.2);
		transform: translateY(-1px);
	}

	/* Dropdown - Mobile First */
	.role-dropdown {
		position: relative;
		width: 100%;
	}

	.dropdown-trigger {
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 16px 20px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 
			0 4px 16px rgba(0, 0, 0, 0.08),
			0 1px 4px rgba(0, 0, 0, 0.04);
	}

	@media (min-width: 640px) {
		.dropdown-trigger {
			border-radius: 20px;
			padding: 18px 24px;
		}
	}

	.dropdown-trigger:hover {
		background: rgba(255, 255, 255, 0.98);
		border-color: rgba(124, 179, 66, 0.3);
		transform: translateY(-2px);
		box-shadow: 
			0 8px 24px rgba(0, 0, 0, 0.12),
			0 2px 8px rgba(0, 0, 0, 0.06);
	}

	.trigger-text {
		font-size: 16px;
		font-weight: 600;
		color: #1f2937;
	}

	@media (min-width: 640px) {
		.trigger-text {
			font-size: 18px;
		}
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 16px;
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.15),
			0 4px 16px rgba(0, 0, 0, 0.08);
		z-index: 1000;
		overflow: hidden;
		max-height: 80vh;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	@media (min-width: 640px) {
		.dropdown-menu {
			border-radius: 20px;
			max-height: 70vh;
		}
	}

	.menu-header {
		padding: 16px 20px 12px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		background: rgba(248, 250, 252, 0.8);
	}

	@media (min-width: 640px) {
		.menu-header {
			padding: 20px 24px 16px;
		}
	}

	.menu-header h3 {
		font-size: 14px;
		font-weight: 600;
		color: #374151;
		margin: 0;
		text-align: center;
		line-height: 1.3;
	}

	@media (min-width: 640px) {
		.menu-header h3 {
			font-size: 16px;
		}
	}

	.role-options {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	@media (min-width: 640px) {
		.role-options {
			padding: 16px;
			gap: 10px;
		}
	}

	.role-option {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border: 1px solid transparent;
		border-radius: 12px;
		background: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		width: 100%;
	}

	@media (min-width: 640px) {
		.role-option {
			gap: 16px;
			padding: 18px;
			border-radius: 16px;
		}
	}

	.role-option:hover {
		background: var(--primary-color, #3b82f6)08;
		border-color: var(--primary-color, #3b82f6)20;
		transform: translateY(-1px);
	}

	.option-icon {
		width: 40px;
		height: 40px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 18px;
		flex-shrink: 0;
	}

	@media (min-width: 640px) {
		.option-icon {
			width: 48px;
			height: 48px;
			border-radius: 12px;
			font-size: 20px;
		}
	}

	.option-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.option-name {
		font-size: 16px;
		font-weight: 700;
		color: #1f2937;
		line-height: 1.2;
	}

	@media (min-width: 640px) {
		.option-name {
			font-size: 18px;
		}
	}

	.option-title {
		font-size: 13px;
		font-weight: 600;
		color: #6b7280;
		line-height: 1.2;
	}

	@media (min-width: 640px) {
		.option-title {
			font-size: 14px;
		}
	}

	.option-description {
		font-size: 12px;
		font-weight: 400;
		color: #9ca3af;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@media (min-width: 640px) {
		.option-description {
			font-size: 13px;
			-webkit-line-clamp: 1;
		}
	}

	/* Mobile optimizations */
	@media (max-width: 480px) {
		.current-role-display {
			padding: 12px;
			border-radius: 12px;
		}

		.dropdown-trigger {
			padding: 14px 16px;
			border-radius: 12px;
		}

		.dropdown-menu {
			border-radius: 12px;
		}

		.role-option {
			padding: 14px 12px;
			gap: 10px;
		}

		.option-icon {
			width: 36px;
			height: 36px;
			font-size: 16px;
		}

		.option-name {
			font-size: 15px;
		}

		.option-title {
			font-size: 12px;
		}

		.option-description {
			font-size: 11px;
		}
	}
</style> 