import { Capacitor } from '@capacitor/core';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.ordinarium.org/v1';

export async function getAuthToken(): Promise<string | null> {
	if (Capacitor.isNativePlatform()) {
		const { Preferences } = await import('@capacitor/preferences');
		const { value } = await Preferences.get({ key: 'auth_token' });
		return value;
	}
	return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

export async function setAuthToken(token: string): Promise<void> {
	if (Capacitor.isNativePlatform()) {
		const { Preferences } = await import('@capacitor/preferences');
		await Preferences.set({ key: 'auth_token', value: token });
	} else if (typeof localStorage !== 'undefined') {
		localStorage.setItem('auth_token', token);
	}
}

export async function removeAuthToken(): Promise<void> {
	if (Capacitor.isNativePlatform()) {
		const { Preferences } = await import('@capacitor/preferences');
		await Preferences.remove({ key: 'auth_token' });
	} else if (typeof localStorage !== 'undefined') {
		localStorage.removeItem('auth_token');
	}
}

export async function apiRequest<T = unknown>(
	endpoint: string,
	options: RequestInit = {}
): Promise<T> {
	const url = `${API_BASE_URL}${endpoint}`;
	const token = await getAuthToken();

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, { ...options, headers });

	if (!response.ok) {
		throw new Error(`API Error: ${response.status}`);
	}

	return response.json() as Promise<T>;
}
