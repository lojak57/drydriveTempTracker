<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to the admin page
		goto('/admin', { replaceState: true });
	});
</script>

<svelte:head>
	<title>System Admin - Redirecting...</title>
	<meta http-equiv="refresh" content="0; url=/admin" />
</svelte:head>

<div class="redirect-page">
	<div class="redirect-content">
		<div class="loading-spinner"></div>
		<h1>Redirecting to System Admin...</h1>
		<p>If you are not automatically redirected, <a href="/admin">click here</a>.</p>
	</div>
</div>

<style>
	.redirect-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
	}

	.redirect-content {
		text-align: center;
		padding: 40px;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		margin: 0 auto 20px auto;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	h1 {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 16px 0;
	}

	p {
		color: #64748b;
		margin: 0;
	}

	a {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}

	a:hover {
		text-decoration: underline;
	}
</style> 