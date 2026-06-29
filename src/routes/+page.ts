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

	return {
		churches,
		schedules
	};
};
