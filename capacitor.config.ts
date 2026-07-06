import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'br.com.ordinarium.app',
	appName: 'Ordinarium',
	webDir: 'build-mobile',
	server: {
		...(process.env.NODE_ENV === 'development' && {
			url: 'http://10.0.2.2:5173',
			cleartext: true
		})
	},
	plugins: {
		SplashScreen: {
			launchAutoHide: false,
			backgroundColor: '#0f0f11',
			showSpinner: false
		},
		StatusBar: {
			style: 'DARK',
			backgroundColor: '#0f0f11'
		}
	}
};

export default config;
