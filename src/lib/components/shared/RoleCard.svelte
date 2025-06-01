<script lang="ts">
	export let role: string;
	export let href: string;
	export let icon: string;
	export let description: string;
</script>

<a 
	{href} 
	class="role-card group"
	data-sveltekit-preload-data="hover"
>
	<div class="role-icon">
		{icon}
	</div>
	<div class="role-content">
		<h2 class="role-title">{role}</h2>
		<p class="role-description">{description}</p>
	</div>
	<div class="role-arrow">
		→
	</div>
</a>

<style>
	.role-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 24px;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		text-decoration: none;
		color: inherit;
		transition: all 0.2s ease;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.role-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
		border-color: #cbd5e1;
	}

	.role-icon {
		font-size: 32px;
		width: 60px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f8fafc;
		border-radius: 12px;
		flex-shrink: 0;
	}

	.role-content {
		flex: 1;
		min-width: 0;
	}

	.role-title {
		font-size: 18px;
		font-weight: 700;
		color: #0f172a;
		margin: 0 0 4px 0;
		line-height: 1.3;
	}

	.role-description {
		font-size: 14px;
		color: #64748b;
		margin: 0;
		line-height: 1.4;
	}

	.role-arrow {
		font-size: 20px;
		color: #94a3b8;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.group:hover .role-arrow {
		color: #3b82f6;
		transform: translateX(4px);
	}

	@media (max-width: 640px) {
		.role-card {
			padding: 20px;
			gap: 12px;
		}

		.role-icon {
			font-size: 28px;
			width: 50px;
			height: 50px;
		}

		.role-title {
			font-size: 16px;
		}

		.role-description {
			font-size: 13px;
		}
	}
</style> 