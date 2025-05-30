<script lang="ts">
	import { selectedRole, setRole, roles, type RoleId } from '$lib/stores/roleStore';
	import { ChevronDown } from 'lucide-svelte';

	let isOpen = $state(false);
	let dropdownRef: HTMLDivElement;

	function handleRoleSelect(roleId: RoleId) {
		setRole(roleId);
		isOpen = false;
	}

	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

<svelte:window on:click={handleClickOutside} on:keydown={handleKeydown} />

<div class="role-selector" bind:this={dropdownRef}>
	<button
		class="role-selector-button"
		class:open={isOpen}
		onclick={() => isOpen = !isOpen}
		aria-expanded={isOpen}
		aria-haspopup="listbox"
		type="button"
	>
		<div class="role-info">
			<span class="role-icon">{$selectedRole.icon}</span>
			<div class="role-text">
				<span class="role-name">{$selectedRole.name}</span>
				<span class="role-description">{$selectedRole.description}</span>
			</div>
		</div>
		<div class="chevron" class:rotated={isOpen}>
			<ChevronDown size={20} />
		</div>
	</button>

	{#if isOpen}
		<div class="dropdown-menu" role="listbox">
			{#each roles as role (role.id)}
				<button
					class="dropdown-item"
					class:selected={$selectedRole.id === role.id}
					onclick={() => handleRoleSelect(role.id)}
					role="option"
					aria-selected={$selectedRole.id === role.id}
					type="button"
				>
					<div class="role-info">
						<span class="role-icon">{role.icon}</span>
						<div class="role-text">
							<span class="role-name">{role.name}</span>
							<span class="role-description">{role.description}</span>
							<span class="role-focus">{role.focus}</span>
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.role-selector {
		position: relative;
		z-index: 50;
	}

	.role-selector-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-width: 320px;
		padding: 12px 16px;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow: 
			0 8px 32px rgba(0, 0, 0, 0.1),
			0 2px 8px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.8);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.role-selector-button:hover {
		background: rgba(255, 255, 255, 0.98);
		border-color: rgba(124, 179, 66, 0.3);
		box-shadow: 
			0 12px 40px rgba(0, 0, 0, 0.15),
			0 4px 12px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		transform: translateY(-2px);
	}

	.role-selector-button.open {
		background: rgba(255, 255, 255, 1);
		border-color: rgba(124, 179, 66, 0.4);
		box-shadow: 
			0 16px 48px rgba(0, 0, 0, 0.2),
			0 6px 16px rgba(0, 0, 0, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 1);
	}

	.role-info {
		display: flex;
		align-items: center;
		gap: 12px;
		flex: 1;
	}

	.role-icon {
		font-size: 24px;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(124, 179, 66, 0.1) 0%, rgba(85, 139, 47, 0.1) 100%);
		border-radius: 8px;
		border: 1px solid rgba(124, 179, 66, 0.2);
	}

	.role-text {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
	}

	.role-name {
		font-size: 16px;
		font-weight: 600;
		color: #1a1a1a;
		line-height: 1.2;
	}

	.role-description {
		font-size: 13px;
		font-weight: 400;
		color: #666;
		line-height: 1.3;
	}

	.role-focus {
		font-size: 11px;
		font-weight: 500;
		color: #7CB342;
		line-height: 1.2;
		margin-top: 2px;
	}

	.chevron {
		color: #666;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		left: 0;
		right: 0;
		background: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(24px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 20px;
		box-shadow: 
			0 20px 60px rgba(0, 0, 0, 0.15),
			0 8px 24px rgba(0, 0, 0, 0.08),
			inset 0 1px 0 rgba(255, 255, 255, 0.9);
		padding: 8px;
		animation: dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		max-height: 400px;
		overflow-y: auto;
	}

	@keyframes dropdownSlide {
		from {
			opacity: 0;
			transform: translateY(-8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
		text-align: left;
	}

	.dropdown-item:hover {
		background: rgba(124, 179, 66, 0.08);
		transform: translateX(4px);
	}

	.dropdown-item.selected {
		background: linear-gradient(135deg, rgba(124, 179, 66, 0.15) 0%, rgba(85, 139, 47, 0.1) 100%);
		border: 1px solid rgba(124, 179, 66, 0.2);
	}

	.dropdown-item.selected .role-name {
		color: #558B2F;
		font-weight: 700;
	}

	.dropdown-item.selected .role-icon {
		background: linear-gradient(135deg, rgba(124, 179, 66, 0.2) 0%, rgba(85, 139, 47, 0.15) 100%);
		border-color: rgba(124, 179, 66, 0.3);
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.role-selector-button {
			min-width: 280px;
			padding: 10px 14px;
		}

		.role-icon {
			font-size: 20px;
			width: 28px;
			height: 28px;
		}

		.role-name {
			font-size: 15px;
		}

		.role-description {
			font-size: 12px;
		}

		.role-focus {
			font-size: 10px;
		}

		.dropdown-item {
			padding: 10px 14px;
		}
	}

	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.role-selector-button {
			background: rgba(30, 30, 30, 0.95);
			border-color: rgba(255, 255, 255, 0.1);
		}

		.role-selector-button:hover {
			background: rgba(40, 40, 40, 0.98);
		}

		.role-name {
			color: #f5f5f5;
		}

		.role-description {
			color: #a0a0a0;
		}

		.dropdown-menu {
			background: rgba(30, 30, 30, 0.98);
			border-color: rgba(255, 255, 255, 0.1);
		}

		.dropdown-item:hover {
			background: rgba(124, 179, 66, 0.15);
		}
	}
</style> 