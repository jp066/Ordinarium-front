import tailwindcss from '@tailwindcss/vite';
import nodeAdapter from '@sveltejs/adapter-node';
import vercelAdapter from '@sveltejs/adapter-vercel';
import staticAdapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const isVercel = process.env.VERCEL === '1';
const isMobile = process.env.BUILD_TARGET === 'mobile';

function getAdapter() {
	if (isMobile) {
		return staticAdapter({
			pages: 'build-mobile',
			assets: 'build-mobile',
			fallback: 'index.html',
			precompress: false,
			strict: true
		});
	}
	return isVercel ? vercelAdapter() : nodeAdapter();
}

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: getAdapter()
		})
	],
	server: {
		allowedHosts: ['d048-179-189-113-18.ngrok-free.app']
	}
});
