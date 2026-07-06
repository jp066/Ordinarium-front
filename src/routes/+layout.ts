import type { LayoutLoad } from './$types';

// Desativa SSR quando compilando para mobile (SPA)
export const ssr = import.meta.env.VITE_BUILD_TARGET !== 'mobile';
export const prerender = false;

export const load: LayoutLoad = async ({ data, fetch }) => {
	// No modo mobile (SPA), buscar dados via API HTTP
	if (import.meta.env.VITE_BUILD_TARGET === 'mobile') {
		const apiUrl = import.meta.env.VITE_API_URL || 'https://api.ordinarium.org/v1';
		try {
			const [churchesRes, schedulesRes] = await Promise.all([
				fetch(`${apiUrl}/churches`),
				fetch(`${apiUrl}/schedules`)
			]);
			return {
				churches: churchesRes.ok ? await churchesRes.json() : [],
				schedules: schedulesRes.ok ? await schedulesRes.json() : [],
				user: {
					name: 'João Pedro',
					avatar:
						'https://media-for2-1.cdn.whatsapp.net/v/t61.24694-24/509743322_24081543871502697_4154529774923046930_n.jpg?ccb=11-4&oh=01_Q5Aa4wF0A8kGAD42U78zNlgjMLqW3rEwC_bdVD6bX2A79Lv3hw&oe=6A543601&_nc_sid=5e03e0&_nc_cat=106',
					email: 'joao.gabriel@exemplo.com'
				}
			};
		} catch {
			return {
				churches: [],
				schedules: [],
				user: {
					name: 'João Pedro',
					avatar:
						'https://media-for2-1.cdn.whatsapp.net/v/t61.24694-24/509743322_24081543871502697_4154529774923046930_n.jpg?ccb=11-4&oh=01_Q5Aa4wF0A8kGAD42U78zNlgjMLqW3rEwC_bdVD6bX2A79Lv3hw&oe=6A543601&_nc_sid=5e03e0&_nc_cat=106',
					email: 'joao.gabriel@exemplo.com'
				}
			};
		}
	}

	// No modo web, passa adiante os dados retornados do +layout.server.ts
	return {
		...data
	};
};
