class ThemeState {
	isDark = $state(true);

	toggle() {
		// Dark mode only: toggling is disabled
	}

	init() {
		if (typeof document !== 'undefined') {
			this.isDark = true;
			document.documentElement.classList.add('dark');
		}
	}
}

export const theme = new ThemeState();
