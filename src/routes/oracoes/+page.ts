import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const baseUrl = import.meta.env.VITE_PRAYERS_API_URL || 'http://127.0.0.1:8080/api/v1';

	try {
		const [prayersRes, randomRes, examinationRes] = await Promise.all([
			fetch(`${baseUrl}/prayers`),
			fetch(`${baseUrl}/prayers/random`).catch(() => null),
			fetch(`${baseUrl}/examination`).catch(() => null)
		]);

		if (!prayersRes.ok) {
			return {
				success: false,
				error: `Falha ao obter as orações da base de dados (${prayersRes.status}).`
			};
		}

		const prayers = await prayersRes.json();

		let randomPrayer = null;
		if (randomRes && randomRes.ok) {
			randomPrayer = await randomRes.json();
		}

		let examination: any[] = [];
		if (examinationRes && examinationRes.ok) {
			examination = await examinationRes.json();
		}

		return {
			success: true,
			prayers,
			randomPrayer,
			examination
		};
	} catch (err) {
		console.error('Erro ao conectar com a API de orações:', err);
		return {
			success: false,
			error:
				'Não foi possível estabelecer conexão com o servidor de orações. Certifique-se de que o backend está ativo.'
		};
	}
};
