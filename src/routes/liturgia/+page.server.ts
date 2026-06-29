import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const dia = url.searchParams.get('dia');
	const mes = url.searchParams.get('mes');
	const ano = url.searchParams.get('ano');

	let apiUrl = 'https://liturgia.up.railway.app/v3/';
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
