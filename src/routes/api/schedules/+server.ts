import { json } from '@sveltejs/kit';
import { schedules } from '$lib/mockData';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(schedules);
};
