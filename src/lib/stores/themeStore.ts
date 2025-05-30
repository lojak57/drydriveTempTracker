import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// Create the theme mode store with persistence
function createThemeStore() {
	const defaultMode: ThemeMode = 'system';
	
	// Initialize from localStorage or default to system
	const initialMode = browser 
		? (localStorage.getItem('theme-mode') as ThemeMode) || defaultMode
		: defaultMode;

	const { subscribe, set, update } = writable<ThemeMode>(initialMode);

	return {
		subscribe,
		set: (mode: ThemeMode) => {
			if (browser) {
				localStorage.setItem('theme-mode', mode);
			}
			set(mode);
		},
		toggle: () => {
			update(current => {
				const newMode = current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light';
				if (browser) {
					localStorage.setItem('theme-mode', newMode);
				}
				return newMode;
			});
		},
		reset: () => {
			if (browser) {
				localStorage.removeItem('theme-mode');
			}
			set(defaultMode);
		}
	};
}

export const themeMode = createThemeStore();

// Derived store that resolves the actual theme (light/dark) based on mode and system preference
export const resolvedTheme = derived<typeof themeMode, ResolvedTheme>(
	themeMode,
	($themeMode, set) => {
		if (!browser) {
			set('light');
			return;
		}

		if ($themeMode === 'system') {
			// Watch for system preference changes
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const updateTheme = () => set(mediaQuery.matches ? 'dark' : 'light');
			
			updateTheme();
			mediaQuery.addEventListener('change', updateTheme);
			
			return () => mediaQuery.removeEventListener('change', updateTheme);
		} else {
			set($themeMode as ResolvedTheme);
		}
	},
	'light' // default value
);

// Helper to apply theme to document
export function applyTheme(theme: ResolvedTheme) {
	if (!browser) return;
	
	document.documentElement.classList.toggle('dark', theme === 'dark');
	document.documentElement.setAttribute('data-theme', theme);
}

// Auto-apply theme changes
if (browser) {
	resolvedTheme.subscribe(applyTheme);
} 