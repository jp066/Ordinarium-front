import { Capacitor } from '@capacitor/core';

export function isNative(): boolean {
	return Capacitor.isNativePlatform();
}

export function isAndroid(): boolean {
	return Capacitor.getPlatform() === 'android';
}

export function isIOS(): boolean {
	return Capacitor.getPlatform() === 'ios';
}

export function isWeb(): boolean {
	return Capacitor.getPlatform() === 'web';
}

export function isMobileBuild(): boolean {
	return import.meta.env.VITE_BUILD_TARGET === 'mobile';
}
