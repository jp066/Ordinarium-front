import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, fetch }) => {
	const dia = url.searchParams.get('dia');
	const mes = url.searchParams.get('mes');
	const ano = url.searchParams.get('ano');

	const liturgiaBaseUrl =
		import.meta.env.VITE_LITURGIA_API_URL || 'https://liturgia.up.railway.app/v3';
	let apiUrl = `${liturgiaBaseUrl}/`;
	if (dia) {
		const queryParams = new URLSearchParams();
		queryParams.set('dia', dia);
		if (mes) queryParams.set('mes', mes);
		if (ano) queryParams.set('ano', ano);
		apiUrl += `?${queryParams.toString()}`;
	}

	try {
		const res = await fetch(apiUrl);
		if (!res.ok) {
			return {
				success: false,
				error: `Falha ao buscar liturgia (${res.status})`
			};
		}
		const data = await res.json();
		return {
			success: true,
			liturgiaData: data,
			dateParams: { dia, mes, ano }
		};
	} catch (err: any) {
		return {
			success: false,
			error: 'Não foi possível conectar ao servidor de Liturgia.'
		};
	}
};
