import type { LayoutServerLoad } from './$types';
import { churches, schedules } from '$lib/mockData';

export const load: LayoutServerLoad = async () => {
	return {
		churches,
		schedules,
		user: {
			name: 'João Pedro',
			avatar:
				'https://media-for2-1.cdn.whatsapp.net/v/t61.24694-24/509743322_24081543871502697_4154529774923046930_n.jpg?ccb=11-4&oh=01_Q5Aa4wF0A8kGAD42U78zNlgjMLqW3rEwC_bdVD6bX2A79Lv3hw&oe=6A543601&_nc_sid=5e03e0&_nc_cat=106',
			email: 'joao.gabriel@exemplo.com'
		}
	};
};
