<script lang="ts">
	import { page } from '$app/stores';
	
	interface NavItem {
		href: string;
		label: string;
		icon: string;
	}
	
	const navItems: NavItem[] = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/haul', label: 'Active Haul', icon: '🚚' },
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

<nav class="nav-glass fixed top-0 left-0 right-0 z-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-16">
					<!-- Logo and Brand -->
		<div class="flex items-center space-x-2 sm:space-x-3">
			<div class="w-8 h-8 bg-oil-orange rounded-xl flex items-center justify-center shadow-lg">
				<span class="text-white font-bold text-lg">🛢️</span>
			</div>
			<div class="flex flex-col">
				<h1 class="text-base sm:text-lg font-bold text-oil-black leading-tight">Oil Field Tracker</h1>
				<p class="text-xs text-oil-gray leading-tight hidden sm:block">Temperature Monitoring</p>
			</div>
		</div>

			<!-- Navigation Links -->
			<div class="hidden md:flex items-center space-x-1">
				{#each navItems as item}
					<a 
						href={item.href}
						class="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
							{isActive(item.href) 
								? 'bg-white/40 text-oil-black shadow-sm' 
								: 'text-oil-gray hover:bg-white/20 hover:text-oil-black'}"
					>
						<span class="text-lg">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</div>

			<!-- System Status -->
			<div class="flex items-center space-x-2 sm:space-x-4">
				<div class="hidden lg:flex items-center space-x-2">
					<div class="status-dot status-normal"></div>
					<span class="text-sm font-medium text-oil-gray">System Online</span>
				</div>
				
				<!-- Mobile menu button -->
				<button 
					class="md:hidden btn-ghost p-2 relative z-50"
					onclick={toggleMobileMenu}
					aria-label="Toggle mobile menu"
				>
					<span class="text-lg">{mobileMenuOpen ? '✕' : '☰'}</span>
				</button>
			</div>
		</div>
	</div>
	
	<!-- Mobile Menu Overlay -->
	{#if mobileMenuOpen}
		<div 
			class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" 
			onclick={closeMobileMenu}
			onkeydown={(e) => e.key === 'Escape' && closeMobileMenu()}
			role="button"
			tabindex="-1"
			aria-label="Close mobile menu"
		></div>
		
		<!-- Mobile Menu -->
		<div class="fixed top-16 left-0 right-0 bg-white/90 backdrop-blur-xl border-b border-white/20 shadow-xl z-40 md:hidden">
			<div class="px-4 py-6 space-y-1">
				{#each navItems as item}
					<a 
						href={item.href}
						onclick={closeMobileMenu}
						class="flex items-center space-x-3 px-4 py-4 rounded-xl font-medium text-lg transition-all duration-200
							{isActive(item.href) 
								? 'bg-oil-orange text-white shadow-lg' 
								: 'text-oil-gray hover:bg-white/40 hover:text-oil-black'}"
					>
						<span class="text-2xl">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
				
				<!-- Mobile System Status -->
				<div class="mt-6 pt-4 border-t border-white/20">
					<div class="flex items-center justify-center space-x-2 px-4 py-2">
						<div class="status-dot status-normal"></div>
						<span class="text-sm font-medium text-oil-gray">System Online</span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</nav>

<!-- Spacer to prevent content overlap -->
<div class="h-16"></div> 