import type { LayoutServerLoad } from './$types';
import { churches, schedules } from '$lib/mockData';

export const load: LayoutServerLoad = async () => {
	return {
		churches,
		schedules
	};
};
