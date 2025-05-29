<script lang="ts">
	import { page } from '$app/stores';
	import DryDriveLogo from './DryDriveLogo.svelte';
	
	interface NavItem {
		href: string;
		label: string;
		icon: string;
	}
	
	const navItems: NavItem[] = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/fleet', label: 'Fleet Operations', icon: '🚛' },
		{ href: '/documents', label: 'Documents', icon: '📄' },
		{ href: '/hauls', label: 'Haul History', icon: '📋' },
		{ href: '/admin', label: 'Analytics', icon: '📈' }
	];
	
	let mobileMenuOpen = false;
	
	function isActive(href: string): boolean {
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

<!-- Desktop Navigation -->
<nav class="nav-glass bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50 px-3 sm:px-6 py-2 sm:py-4">
	<div class="flex items-center justify-between">
		<!-- Logo and Brand -->
		<div class="flex items-center space-x-2 sm:space-x-3">
			<div class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
				<DryDriveLogo size={32} />
			</div>
			<div class="flex flex-col">
				<h1 class="text-sm sm:text-lg font-bold text-oil-black leading-tight">DryDrive</h1>
				<p class="text-xs text-oil-gray leading-tight hidden sm:block">Oil Field Monitoring</p>
			</div>
		</div>

		<!-- Desktop Navigation Links -->
		<div class="hidden md:flex items-center space-x-1 lg:space-x-2">
			{#each navItems as item}
				<a 
					href={item.href}
					class="flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-xl font-medium text-sm lg:text-base transition-all duration-200
						{isActive(item.href) 
							? 'bg-drydrive-green text-white shadow-lg' 
							: 'text-oil-gray hover:bg-white/40 hover:text-oil-black'}"
				>
					<span class="text-base lg:text-lg">{item.icon}</span>
					<span class="hidden lg:block">{item.label}</span>
				</a>
			{/each}
		</div>

		<!-- Mobile Menu Button -->
		<button 
			onclick={toggleMobileMenu}
			class="md:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors touch-manipulation"
			aria-label="Toggle mobile menu"
		>
			<svg class="w-5 h-5 text-oil-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
			</svg>
		</button>
	</div>
</nav>

<!-- Mobile Navigation Menu -->
{#if mobileMenuOpen}
	<div 
		class="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" 
		role="dialog"
		aria-modal="true"
		aria-labelledby="mobile-menu-title"
		tabindex="0"
		onclick={closeMobileMenu}
		onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
	>
		<div 
			class="absolute top-0 right-0 w-72 h-full bg-white/95 backdrop-blur-xl shadow-2xl" 
			role="document"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
		>
			<!-- Mobile Menu Header -->
			<div class="flex items-center justify-between p-4 border-b border-gray-200">
				<div class="flex items-center space-x-3">
					<div class="w-8 h-8 flex items-center justify-center">
						<DryDriveLogo size={32} />
					</div>
					<div>
						<h2 id="mobile-menu-title" class="text-lg font-bold text-oil-black">DryDrive</h2>
						<p class="text-xs text-oil-gray">Oil Field Monitoring</p>
					</div>
				</div>
				<button 
					onclick={closeMobileMenu}
					class="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors touch-manipulation"
					aria-label="Close mobile menu"
				>
					<svg class="w-5 h-5 text-oil-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<!-- Mobile Menu Items -->
			<div class="p-4 space-y-2">
				{#each navItems as item}
					<a 
						href={item.href}
						onclick={closeMobileMenu}
						class="flex items-center space-x-3 px-4 py-4 rounded-xl font-medium text-base transition-all duration-200 touch-manipulation
							{isActive(item.href) 
								? 'bg-drydrive-green text-white shadow-lg' 
								: 'text-oil-gray hover:bg-white/40 hover:text-oil-black'}"
					>
						<span class="text-xl">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}

<!-- Spacer to prevent content overlap -->
<div class="h-16"></div> 