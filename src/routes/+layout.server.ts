import type { LayoutServerLoad } from './$types';
import { churches, schedules } from '$lib/mockData';

export const load: LayoutServerLoad = async () => {
	return {
		churches,
		schedules,
		user: {
			name: 'João Gabriel',
			avatar:
				'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
			email: 'joao.gabriel@exemplo.com'
		}
	};
};
