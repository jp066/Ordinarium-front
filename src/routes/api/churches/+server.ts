import { json } from '@sveltejs/kit';
import { churches } from '$lib/mockData';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json(churches);
};
