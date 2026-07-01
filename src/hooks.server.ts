import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Se a rota for da API pública, aplica cabeçalhos de CORS
	if (event.url.pathname.startsWith('/api')) {
		// Trata requisição prévia (preflight / OPTIONS)
		if (event.request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization, *',
					'Access-Control-Max-Age': '86400'
				}
			});
		}

		// Processa a requisição normal
		const response = await resolve(event);

		// Clona a resposta para permitir modificação de cabeçalhos
		const corsResponse = new Response(response.body, response);
		corsResponse.headers.set('Access-Control-Allow-Origin', '*');
		corsResponse.headers.set(
			'Access-Control-Allow-Methods',
			'GET, POST, PUT, DELETE, PATCH, OPTIONS'
		);
		corsResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, *');

		return corsResponse;
	}

	return resolve(event);
};
