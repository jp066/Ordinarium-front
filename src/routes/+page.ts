import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const [churchesRes, schedulesRes] = await Promise.all([
		fetch('/api/churches'),
		fetch('/api/schedules')
	]);

	if (!churchesRes.ok || !schedulesRes.ok) {
		throw new Error('Falha ao carregar dados litúrgicos da API');
	}

	const churches = await churchesRes.json();
	const schedules = await schedulesRes.json();

	// Fetch today's liturgical data for the dashboard widget
	let liturgiaData = null;
	try {
		const liturgiaRes = await fetch('https://liturgia.up.railway.app/v3/');
		if (liturgiaRes.ok) {
			liturgiaData = await liturgiaRes.json();
		}
	} catch (e) {
		console.error('Failed to fetch liturgy data for home page widget:', e);
	}

	return {
		churches,
		schedules,
		liturgiaData
	};
};
