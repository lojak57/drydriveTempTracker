import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel adapter for seamless deployment
		adapter: adapter({
			// Enable Edge Runtime for better performance
			runtime: 'nodejs18.x',
			// Configure regions for global distribution
			regions: ['iad1', 'cle1', 'pdx1'],
			// Memory allocation for serverless functions
			memory: 1024
		})
	}
};

export default config;
