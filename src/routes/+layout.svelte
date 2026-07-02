<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import './layout.css';
	import {
		Home,
		Clock,
		MapPin,
		BookOpen,
		Book,
		Sparkles,
		Flame,
		CheckSquare,
		Star,
		User,
		Heart,
		MessageSquare,
		Navigation,
		X,
		ChevronRight
	} from '@lucide/svelte';
	import { theme } from '$lib/theme.svelte';
	import logo from '$lib/assets/logo-removebg.png';

	// Svelte 5 Runes for children and layout data
	let { children, data } = $props<{
		children: any;
		data: {
			churches: any[];
			schedules: any[];
			user?: { name: string; avatar: string; email: string };
		};
	}>();

	// Share navigation state via context (contains activeRoute and globally shared selectedChurchId)
	const navState = $state({
		activeRoute: 'Início',
		selectedChurchId: 'c1'
	});
	setContext('navigation', navState);

	// Desktop Sidebar collapse state
	let sidebarCollapsed = $state(false);

	// Synchronize navState.activeRoute with SvelteKit pathname and search params
	$effect(() => {
		const path = $page.url.pathname;
		const tab = $page.url.searchParams.get('tab');

		if (path === '/horarios') {
			navState.activeRoute = 'Horários';
		} else if (path === '/paroquias') {
			navState.activeRoute = 'Paróquias';
		} else if (path === '/liturgia') {
			navState.activeRoute = 'Liturgia';
		} else if (path === '/biblia') {
			navState.activeRoute = 'Bíblia Sagrada';
		} else if (path === '/oracoes') {
			if (tab === 'exame' || tab === 'examination') {
				navState.activeRoute = 'Exame de Consciência';
			} else {
				navState.activeRoute = 'Orações e Devoções';
			}
		} else if (path === '/apoiar') {
			navState.activeRoute = 'Contribuir';
		} else if (path === '/sugerir') {
			navState.activeRoute = 'Sugerir';
		} else if (path === '/api') {
			navState.activeRoute = 'API';
		} else {
			navState.activeRoute = 'Página inicial';
		}
	});

	// Desktop / Mobile Navigation Items
	const menuItems = $derived([
		{
			name: 'Página inicial',
			icon: Home,
			href: '/',
			isActive: navState.activeRoute === 'Página inicial'
		},
		{
			name: 'Horários',
			icon: Clock,
			href: '/horarios',
			isActive: navState.activeRoute === 'Horários'
		},
		{
			name: 'Paróquias',
			icon: MapPin,
			href: '/paroquias',
			isActive: navState.activeRoute === 'Paróquias'
		},
		{
			name: 'Liturgia',
			icon: BookOpen,
			href: '/liturgia',
			isActive: navState.activeRoute === 'Liturgia'
		},
		{
			name: 'Bíblia Sagrada',
			icon: Book,
			href: '/biblia',
			isActive: navState.activeRoute === 'Bíblia Sagrada'
		},
		{
			name: 'Orações e Devoções',
			icon: Flame,
			href: '/oracoes?tab=prayers',
			isActive: navState.activeRoute === 'Orações e Devoções'
		},
		{
			name: 'Exame de Consciência',
			icon: CheckSquare,
			href: '/oracoes?tab=exame',
			isActive: navState.activeRoute === 'Exame de Consciência'
		}
	]);

	// Toast/Alert to represent the "Em Breve" feature
	let showToast = $state(false);
	let toastMessage = $state('');

	function handleComingSoon(featureName: string) {
		toastMessage = `${featureName} estará disponível em breve!`;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000);
	}

	const outrosItems = [
		{
			name: 'Favoritos',
			icon: Star,
			onclick: () => handleComingSoon('Módulo de Favoritos'),
			badge: 'Em breve'
		},
		{
			name: 'Santos do dia',
			icon: User,
			onclick: () => handleComingSoon('Módulo de Santos do Dia'),
			badge: 'Em breve'
		}
	];

	const apoieItems = $derived([
		{
			name: 'Contribuir',
			icon: Heart,
			href: '/apoiar',
			isActive: navState.activeRoute === 'Contribuir'
		},
		{
			name: 'Sugerir',
			icon: MessageSquare,
			href: '/sugerir',
			isActive: navState.activeRoute === 'Sugerir'
		}
	]);

	// Initialize theme on client mount
	onMount(() => {
		theme.init();
	});

	// Mobile menu open state
	let showMobileMenu = $state(false);

	// Geolocation state for locating nearest church
	let geoLoading = $state(false);
	let geoError = $state<string | null>(null);

	function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // km
		const dLat = ((lat2 - lat1) * Math.PI) / 180;
		const dLng = ((lng2 - lng1) * Math.PI) / 180;
		const a =
			Math.sin(dLat / 2) ** 2 +
			Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
		return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	}

	function goToNearestChurch() {
		if (!navigator.geolocation) {
			geoError = 'Geolocalização não suportada neste dispositivo.';
			return;
		}
		geoLoading = true;
		geoError = null;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude, longitude } = pos.coords;
				const churches = data?.churches ?? [];
				if (!churches.length) {
					geoError = 'Nenhuma paróquia encontrada.';
					geoLoading = false;
					return;
				}
				const nearest = churches.reduce((best: any, church: any) => {
					const d = haversineDistance(latitude, longitude, church.lat, church.lng);
					return !best || d < best.dist ? { church, dist: d } : best;
				}, null as any);
				navState.selectedChurchId = nearest.church.id;
				geoLoading = false;
				showMobileMenu = false;
				goto('/paroquias');
			},
			(err) => {
				geoLoading = false;
				geoError =
					err.code === 1
						? 'Permissão de localização negada.'
						: 'Não foi possível obter sua localização.';
			},
			{ timeout: 8000, maximumAge: 60000 }
		);
	}
</script>

{#if $page.url.pathname === '/api'}
	<!-- API documentation route is rendered outside of the main application layout -->
	{@render children()}
{:else}
	<div
		class="flex h-screen w-screen overflow-hidden bg-transparent text-text-main font-sans transition-colors duration-200 relative"
	>
		<!-- Toast Notification for "Em Breve" features -->
		{#if showToast}
			<div
				class="fixed top-6 right-6 z-[2000] bg-bg-card border border-brand-gold/30 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-fade-in"
			>
				<Sparkles size={16} class="text-brand-gold animate-pulse-slow" />
				<span class="text-xs font-bold text-text-main">{toastMessage}</span>
			</div>
		{/if}

		<!-- Desktop Sidebar Navigation (Collapsible left panel) -->
		<aside
			class="hidden md:flex flex-col {sidebarCollapsed
				? 'w-20 p-3'
				: 'w-64 p-5'} bg-bg-sidebar border-r border-border-dark select-none shrink-0 h-full justify-between relative z-20 transition-all duration-300 ease-in-out"
		>
			<div class="flex flex-col gap-6">
				<!-- Brand Logo & Gothic Title -->
				<div
					class="flex {sidebarCollapsed
						? 'flex-col items-center gap-4'
						: 'items-center justify-between'}"
				>
					<a
						href="/"
						class="flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all bg-transparent"
					>
						<img
							src={logo}
							alt="Emblema Ordinarium"
							class="h-7 w-7 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.15)]"
						/>
						{#if !sidebarCollapsed}
							<span class="text-xl font-bold tracking-wide text-brand-gold font-gothic"
								>Ordinarium</span
							>
						{/if}
					</a>
					<button
						onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
						class="text-text-muted/40 hover:text-brand-gold transition-colors cursor-pointer"
						title={sidebarCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
					>
						{#if sidebarCollapsed}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-3.5 w-3.5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2.2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13 5l7 7-7 7M5 5l7 7-7 7"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-3 w-3"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
								/>
							</svg>
						{/if}
					</button>
				</div>

				<!-- Divider -->
				<div
					class="h-[1px] bg-gradient-to-r from-transparent via-border-dark/60 to-transparent"
				></div>

				<!-- Main Navigation Group -->
				<nav class="flex flex-col gap-1">
					{#each menuItems as item (item.name)}
						<a
							href={item.href}
							class="flex items-center {sidebarCollapsed
								? 'justify-center px-2'
								: 'justify-between px-4'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer
							{item.isActive
								? 'bg-brand-wine/10 text-brand-gold border-brand-gold/20'
								: 'bg-transparent text-text-muted hover:text-text-main border-transparent hover:bg-bg-card/40'}"
							title={sidebarCollapsed ? item.name : undefined}
						>
							<div class="flex items-center gap-3">
								<item.icon
									size={14}
									class={item.isActive ? 'text-brand-gold' : 'text-text-muted'}
								/>
								{#if !sidebarCollapsed}
									<span>{item.name}</span>
								{/if}
							</div>
						</a>
					{/each}
				</nav>

				<!-- Outros Group -->
				<div class="flex flex-col gap-1 mt-2">
					{#if !sidebarCollapsed}
						<span
							class="text-[9px] uppercase font-bold tracking-widest text-text-muted/40 px-4 mb-1"
							>Outros</span
						>
					{:else}
						<div class="h-[1px] bg-border-dark/30 my-2 mx-2"></div>
					{/if}
					{#each outrosItems as item (item.name)}
						<button
							onclick={item.onclick}
							class="w-full flex items-center {sidebarCollapsed
								? 'justify-center px-2'
								: 'justify-between px-4'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/40 cursor-pointer"
							title={sidebarCollapsed
								? `${item.name}${item.badge ? ' (' + item.badge + ')' : ''}`
								: undefined}
						>
							<div class="flex items-center gap-3">
								<item.icon size={14} class="text-text-muted" />
								{#if !sidebarCollapsed}
									<span>{item.name}</span>
								{/if}
							</div>
							{#if item.badge && !sidebarCollapsed}
								<span
									class="text-[8px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-wine/15 text-brand-gold border border-brand-wine/25 uppercase tracking-wide"
								>
									{item.badge}
								</span>
							{/if}
						</button>
					{/each}
				</div>

				<!-- Apoio Group -->
				<div class="flex flex-col gap-1 mt-2">
					{#if !sidebarCollapsed}
						<span
							class="text-[9px] uppercase font-bold tracking-widest text-text-muted/40 px-4 mb-1"
							>Apoie o projeto</span
						>
					{:else}
						<div class="h-[1px] bg-border-dark/30 my-2 mx-2"></div>
					{/if}
					{#each apoieItems as item (item.name)}
						<a
							href={item.href}
							class="flex items-center {sidebarCollapsed
								? 'justify-center px-2'
								: 'justify-between px-4'} py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/40 cursor-pointer"
							title={sidebarCollapsed ? item.name : undefined}
						>
							<div class="flex items-center gap-3">
								<item.icon size={14} class="text-text-muted" />
								{#if !sidebarCollapsed}
									<span>{item.name}</span>
								{/if}
							</div>
						</a>
					{/each}
				</div>

				<!-- Geolocation Group -->
				<div class="flex flex-col gap-1 mt-2">
					<button
						onclick={goToNearestChurch}
						disabled={geoLoading}
						class="w-full text-left py-2.5 {sidebarCollapsed
							? 'justify-center px-2'
							: 'px-4'} rounded-xl text-xs font-bold flex items-center gap-3 transition-all border cursor-pointer
						{geoLoading
							? 'bg-bg-card border-border-dark text-text-muted opacity-60 cursor-wait'
							: 'bg-bg-card border-brand-gold/20 text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/40'}"
						title={sidebarCollapsed
							? geoLoading
								? 'Localizando...'
								: 'Paróquia mais perto'
							: undefined}
					>
						{#if geoLoading}
							<span
								class="inline-block h-3 w-3 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin shrink-0"
							></span>
						{:else}
							<Navigation size={13} class="shrink-0" />
						{/if}
						{#if !sidebarCollapsed}
							<span>{geoLoading ? 'Localizando...' : 'Paróquia mais perto'}</span>
						{/if}
					</button>
					{#if geoError && !sidebarCollapsed}
						<p class="text-[9px] text-red-400/80 px-4 mt-0.5 leading-relaxed">{geoError}</p>
					{/if}
				</div>

				<!-- User Profile Card -->
				{#if data.user}
					<div class="mt-auto pt-4 border-t border-border-dark/30 shrink-0">
						{#if sidebarCollapsed}
							<button
								onclick={() => handleComingSoon(`Perfil de ${data.user.name}`)}
								class="w-full flex items-center justify-center p-1 hover:bg-bg-card/45 rounded-xl transition-all duration-200 cursor-pointer"
								title="{data.user.name} - Ver perfil"
							>
								<img
									src={data.user.avatar}
									alt="{data.user.name} Avatar"
									class="h-9 w-9 rounded-full object-cover border border-border-dark bg-bg-dark"
								/>
							</button>
						{:else}
							<button
								onclick={() => handleComingSoon(`Perfil de ${data.user.name}`)}
								class="w-full flex items-center justify-between p-2 hover:bg-bg-card/45 rounded-xl transition-all duration-200 cursor-pointer group text-left"
							>
								<div class="flex items-center gap-3 min-w-0">
									<img
										src={data.user.avatar}
										alt="{data.user.name} Avatar"
										class="h-9 w-9 rounded-full object-cover border border-border-dark bg-bg-dark shrink-0"
									/>
									<div class="flex flex-col min-w-0 select-none">
										<span class="text-xs font-bold text-text-main truncate">{data.user.name}</span>
										<span class="text-[10px] text-text-muted mt-0.5 group-hover:text-brand-gold transition-colors">Ver perfil</span>
									</div>
								</div>
								<ChevronRight size={13} class="text-text-muted/40 group-hover:text-text-main group-hover:translate-x-0.5 transition-all shrink-0" />
							</button>
						{/if}
					</div>
				{/if}
			</div>
		</aside>

		<!-- Main Workspace (Houses Topbar on mobile, and the dynamic pages) -->
		<div class="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
			<!-- Mobile Topbar Header -->
			<header
				class="flex md:hidden h-16 w-full items-center justify-between border-b border-border-dark bg-bg-sidebar/95 backdrop-blur-md px-6 shrink-0 z-40"
			>
				<!-- Brand Header -->
				<a href="/" class="flex items-center gap-3">
					<img src={logo} alt="Logo" class="h-7 w-7 object-contain" />
					<h1 class="text-xl font-bold tracking-wide text-brand-gold font-gothic select-none">
						Ordinarium
					</h1>
				</a>

				<!-- Hamburger menu icon -->
				<button
					onclick={() => (showMobileMenu = !showMobileMenu)}
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-border-dark bg-bg-card hover:bg-bg-card/90 hover:border-brand-gold/30 shadow-sm transition-all duration-200 cursor-pointer"
					title="Menu"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						class="h-6 w-6 text-brand-gold"
						fill="none"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<ellipse cx="12" cy="5" rx="7" ry="1.5" />
						<path d="M 4 11 C 7 10, 17 10, 20 11 M 7 11 V 14.5 M 17 11 V 14.5" />
						<path d="M 8.5 11 C 8.5 15.5, 15.5 15.5, 15.5 11" />
						<path d="M 12 14.8 V 19.5 M 9.5 19.5 H 14.5" />
					</svg>
				</button>
			</header>

			<!-- Mobile Navigation Drawer Overlay -->
			{#if showMobileMenu}
				<div class="fixed inset-0 z-[1050] md:hidden flex">
					<!-- Backdrop -->
					<button
						onclick={() => (showMobileMenu = false)}
						class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
						aria-label="Fechar menu"
					></button>

					<!-- Drawer container slide-out from the left -->
					<aside
						class="relative flex flex-col w-64 bg-bg-sidebar border-r border-border-dark h-full p-5 justify-between z-10 animate-fade-in"
					>
						<div class="flex flex-col gap-6">
							<!-- Header -->
							<div class="flex items-center justify-between">
								<a
									href="/"
									onclick={() => (showMobileMenu = false)}
									class="flex items-center gap-3"
								>
									<img src={logo} alt="Logo" class="h-7 w-7 object-contain" />
									<span class="text-xl font-bold tracking-wide text-brand-gold font-gothic"
										>Ordinarium</span
									>
								</a>
								<button
									onclick={() => (showMobileMenu = false)}
									class="text-text-muted hover:text-text-main cursor-pointer"
								>
									<X size={18} />
								</button>
							</div>

							<!-- Divider -->
							<div
								class="h-[1px] bg-gradient-to-r from-transparent via-border-dark/60 to-transparent"
							></div>

							<!-- Navigation links -->
							<nav class="flex flex-col gap-1">
								{#each menuItems as item (item.name)}
									<a
										href={item.href}
										onclick={() => (showMobileMenu = false)}
										class="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 border cursor-pointer
										{item.isActive
											? 'bg-brand-wine/10 text-brand-gold border-brand-gold/20'
											: 'bg-transparent text-text-muted hover:text-text-main border-transparent hover:bg-bg-card/40'}"
									>
										<div class="flex items-center gap-3">
											<item.icon
												size={14}
												class={item.isActive ? 'text-brand-gold' : 'text-text-muted'}
											/>
											<span>{item.name}</span>
										</div>
									</a>
								{/each}
							</nav>

							<!-- Outros -->
							<div class="flex flex-col gap-1 mt-2">
								<span
									class="text-[9px] uppercase font-bold tracking-widest text-text-muted/40 px-4 mb-1"
									>Outros</span
								>
								{#each outrosItems as item (item.name)}
									<button
										onclick={() => {
											item.onclick();
											showMobileMenu = false;
										}}
										class="w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 border border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/40 cursor-pointer"
									>
										<div class="flex items-center gap-3">
											<item.icon size={14} class="text-text-muted" />
											<span>{item.name}</span>
										</div>
										{#if item.badge}
											<span
												class="text-[8px] font-semibold px-1.5 py-0.5 rounded-md bg-brand-wine/15 text-brand-gold border border-brand-wine/25 uppercase tracking-wide"
											>
												{item.badge}
											</span>
										{/if}
									</button>
								{/each}
							</div>

							<!-- Apoio -->
							<div class="flex flex-col gap-1 mt-2">
								<span
									class="text-[9px] uppercase font-bold tracking-widest text-text-muted/40 px-4 mb-1"
									>Apoie o projeto</span
								>
								{#each apoieItems as item (item.name)}
									<a
										href={item.href}
										onclick={() => (showMobileMenu = false)}
										class="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 border border-transparent text-text-muted hover:text-text-main hover:bg-bg-card/40 cursor-pointer"
									>
										<div class="flex items-center gap-3">
											<item.icon size={14} class="text-text-muted" />
											<span>{item.name}</span>
										</div>
									</a>
								{/each}
							</div>

							<!-- Geolocation -->
							<div class="flex flex-col gap-1 mt-2">
								<button
									onclick={() => {
										goToNearestChurch();
										showMobileMenu = false;
									}}
									disabled={geoLoading}
									class="w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-all border cursor-pointer
									{geoLoading
										? 'bg-bg-card border-border-dark text-text-muted opacity-60 cursor-wait'
										: 'bg-bg-card border-brand-gold/20 text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/40'}"
								>
									{#if geoLoading}
										<span
											class="inline-block h-3 w-3 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin shrink-0"
										></span>
									{:else}
										<Navigation size={13} class="shrink-0" />
									{/if}
									<span>{geoLoading ? 'Localizando...' : 'Paróquia mais perto'}</span>
								</button>
								{#if geoError}
									<p class="text-[9px] text-red-400/80 px-4 mt-0.5 leading-relaxed">{geoError}</p>
								{/if}
							</div>
						</div>

						<!-- Mobile User Profile Card -->
						{#if data.user}
							<div class="mt-auto pt-4 border-t border-border-dark/30 shrink-0">
								<button
									onclick={() => {
										handleComingSoon(`Perfil de ${data.user.name}`);
										showMobileMenu = false;
									}}
									class="w-full flex items-center justify-between p-2 hover:bg-bg-card/45 rounded-xl transition-all duration-200 cursor-pointer group text-left"
								>
									<div class="flex items-center gap-3 min-w-0">
										<img
											src={data.user.avatar}
											alt="{data.user.name} Avatar"
											class="h-9 w-9 rounded-full object-cover border border-border-dark bg-bg-dark shrink-0"
										/>
										<div class="flex flex-col min-w-0 select-none">
											<span class="text-xs font-bold text-text-main truncate">{data.user.name}</span>
											<span class="text-[10px] text-text-muted mt-0.5 group-hover:text-brand-gold transition-colors">Ver perfil</span>
										</div>
									</div>
									<ChevronRight size={13} class="text-text-muted/40 group-hover:text-text-main group-hover:translate-x-0.5 transition-all shrink-0" />
								</button>
							</div>
						{/if}
					</aside>
				</div>
			{/if}

			<!-- Pages container -->
			<main class="flex-1 flex flex-col overflow-hidden w-full relative z-10">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
