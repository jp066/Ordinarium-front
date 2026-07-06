import { Network } from '@capacitor/network';
import { isNative } from '$lib/api/platform';

export type NetworkStatus = {
	connected: boolean;
	connectionType: string;
};

let currentStatus: NetworkStatus = { connected: true, connectionType: 'unknown' };
const listeners: ((status: NetworkStatus) => void)[] = [];

export async function initNetworkListener(): Promise<void> {
	if (!isNative()) return;

	const status = await Network.getStatus();
	currentStatus = { connected: status.connected, connectionType: status.connectionType };

	Network.addListener('networkStatusChange', (status) => {
		currentStatus = { connected: status.connected, connectionType: status.connectionType };
		listeners.forEach((fn) => fn(currentStatus));
	});
}

export function getNetworkStatus(): NetworkStatus {
	return currentStatus;
}

export function onNetworkChange(callback: (status: NetworkStatus) => void): () => void {
	listeners.push(callback);
	return () => {
		const idx = listeners.indexOf(callback);
		if (idx >= 0) listeners.splice(idx, 1);
	};
}
