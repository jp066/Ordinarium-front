<script lang="ts">
	import { onMount, setContext } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import './layout.css';
	import { Clock, MapPin, Heart, Navigation, BookOpen } from '@lucide/svelte';
	import { theme } from '$lib/theme.svelte';
	import logo from '$lib/assets/logo-removebg.png';
	
	// Svelte 5 Runes for children prop
	let { children, data } = $props<{ children: any, data: { churches: any[], schedules: any[] } }>();

	// Share navigation state via context (contains activeRoute and globally shared selectedChurchId)
	const navState = $state({
		activeRoute: 'Início',
		selectedChurchId: 'c1'
	});
	setContext('navigation', navState);

	// Core Devotional and Support navigation items (pill styling)
	const menuItems = [
		{ name: 'Horários', icon: Clock, href: '/horarios' },
		{ name: 'Paróquias', icon: MapPin, href: '/paroquias' },
		{ name: 'Liturgia', icon: BookOpen, href: '/liturgia' },
		{ name: 'Colaborar', icon: Heart, href: '/colaborar' }
	];

	// Synchronize navState.activeRoute with SvelteKit pathname
	$effect(() => {
		const path = $page.url.pathname;
		if (path === '/horarios') {
			navState.activeRoute = 'Horários';
		} else if (path === '/paroquias') {
			navState.activeRoute = 'Paróquias';
		} else if (path === '/liturgia') {
			navState.activeRoute = 'Liturgia';
		} else if (path === '/colaborar') {
			navState.activeRoute = 'Colaborar';
		} else if (path === '/api') {
			navState.activeRoute = 'API';
		} else {
			navState.activeRoute = 'Início';
		}
	});

	// Initialize theme on client mount
	onMount(() => {
		theme.init();
	});

	// Mobile menu open state
	let showMobileMenu = $state(false);

	// Nearest church geolocation state
	let geoLoading = $state(false);
	let geoError = $state<string | null>(null);

	function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // km
		const dLat = (lat2 - lat1) * Math.PI / 180;
		const dLng = (lng2 - lng1) * Math.PI / 180;
		const a = Math.sin(dLat / 2) ** 2 +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			Math.sin(dLng / 2) ** 2;
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
				geoError = err.code === 1 ? 'Permissão de localização negada.' : 'Não foi possível obter sua localização.';
			},
			{ timeout: 8000, maximumAge: 60000 }
		);
	}
</script>

{#if $page.url.pathname === '/' || $page.url.pathname === '/api'}
	<!-- Home route and API documentation route are rendered outside of the main application header layout -->
	{@render children()}
{:else}
	<div class="flex flex-col h-screen w-screen overflow-hidden bg-bg-dark text-text-main transition-colors duration-200 relative">
		<!-- Animated Background Texture (Giphy) -->
		<div class="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.08] overflow-hidden">
			<img 
				src="/bg_texture.gif" 
				alt="" 
				class="w-full h-full object-cover"
			/>
		</div>

		<!-- Top Horizontal Navbar (Estilo Pílulas Ordinarium - Fixo/Sticky no Mobile e Desktop) -->
		<header class="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-border-dark bg-bg-sidebar/95 backdrop-blur-md px-6 sm:px-12 transition-all duration-200 shrink-0">
			<!-- Left Side: Logo & Brand -->
			<a 
				href="/"
				onclick={() => showMobileMenu = false} 
				class="flex items-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all bg-transparent border-0 p-0 cursor-pointer focus:outline-none"
			>
				<div class="flex h-9 w-9 items-center justify-center rounded-xl shrink-0">
					<img src={logo} alt="Logo Ordinarium" class="h-8 w-8 object-contain">
				</div>
				<h1 class="text-2xl font-bold tracking-wide text-brand-gold font-gothic select-none">Ordinarium</h1>
			</a>

			<!-- Middle Side: Horizontal Navigation Links (Visible on Desktop) -->
			<nav class="hidden md:flex items-center gap-3">
				<!-- Pill Navigation for Core Sections -->
				<div class="flex items-center gap-2">
					{#each menuItems as item}
						<a
							href={item.href}
							class="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 shadow-sm border
							{navState.activeRoute === item.name 
								? 'bg-brand-wine text-white border-transparent font-bold' 
								: 'bg-bg-card text-text-muted hover:text-text-main border-border-dark hover:border-brand-gold/30 hover:bg-bg-card/90'}"
						>
							<item.icon size={13} strokeWidth={navState.activeRoute === item.name ? 2.5 : 2} />
							<span>{item.name}</span>
						</a>
					{/each}
				</div>
			</nav>

			<!-- Right Side: Liturgical Hamburger Menu Trigger (Visible on Mobile) -->
			<div class="flex md:hidden items-center gap-3">
				<button
					onclick={() => showMobileMenu = !showMobileMenu}
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-border-dark bg-bg-card hover:bg-bg-card/90 hover:border-brand-gold/30 shadow-sm transition-all duration-200 cursor-pointer"
					title="Menu"
				>
					<!-- Custom Liturgical Hamburger: Paten, Purificator (Sanguíneo) & Chalice -->
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6 text-brand-gold" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
						<!-- Patena (Top Plate) -->
						<ellipse cx="12" cy="5" rx="7" ry="1.5" />
						
						<!-- Sanguíneo (Linen Cloth) -->
						<path d="M 4 11 C 7 10, 17 10, 20 11 M 7 11 V 14.5 M 17 11 V 14.5" />
						
						<!-- Cálice (Chalice Bowl, Stem, Base) -->
						<path d="M 8.5 11 C 8.5 15.5, 15.5 15.5, 15.5 11" />
						<path d="M 12 14.8 V 19.5 M 9.5 19.5 H 14.5" />
					</svg>
				</button>
			</div>
		</header>

		<!-- Mobile Dropdown Menu (Visible on Mobile when open) -->
		{#if showMobileMenu}
			<div class="fixed top-16 left-0 w-full bg-bg-sidebar/95 backdrop-blur-lg border-b border-border-dark flex flex-col p-4 gap-2.5 z-[1002] animate-fade-in md:hidden select-none shadow-2xl">
				<a
					href="/"
					onclick={() => showMobileMenu = false}
					class="w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors border cursor-pointer
					{navState.activeRoute === 'Início'
						? 'bg-brand-gold text-bg-dark border-transparent font-bold'
						: 'bg-bg-card border-border-dark text-text-muted hover:text-text-main'}"
				>
					<span>Página Inicial</span>
				</a>
				
				{#each menuItems as item}
					<a
						href={item.href}
						onclick={() => showMobileMenu = false}
						class="w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-colors border cursor-pointer
						{navState.activeRoute === item.name
							? 'bg-brand-wine text-white border-transparent font-bold'
							: 'bg-bg-card border-border-dark text-text-muted hover:text-text-main'}"
					>
						<item.icon size={13} strokeWidth={navState.activeRoute === item.name ? 2.5 : 2} />
						<span>{item.name}</span>
					</a>
				{/each}

				<!-- Divider -->
				<div class="h-[1px] w-full bg-border-dark/40 my-0.5"></div>

				<!-- Paróquia mais perto (Geolocation) -->
				<button
					onclick={goToNearestChurch}
					disabled={geoLoading}
					class="w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-3 transition-all border cursor-pointer
					{geoLoading
						? 'bg-bg-card border-border-dark text-text-muted opacity-60 cursor-wait'
						: 'bg-bg-card border-brand-gold/20 text-brand-gold hover:bg-brand-gold/10 hover:border-brand-gold/40'}"
				>
					{#if geoLoading}
						<span class="inline-block h-3 w-3 rounded-full border-2 border-brand-gold/40 border-t-brand-gold animate-spin shrink-0"></span>
					{:else}
						<Navigation size={13} class="shrink-0" />
					{/if}
					<span>{geoLoading ? 'Localizando...' : 'Paróquia mais perto'}</span>
				</button>

				<!-- Geolocation error feedback -->
				{#if geoError}
					<p class="text-[10px] text-red-400/80 px-4 -mt-1 leading-relaxed">{geoError}</p>
				{/if}
			</div>
		{/if}

		<!-- Main Content area -->
		<main class="flex-1 flex flex-col overflow-hidden w-full relative z-10">
			{@render children()}
		</main>
	</div>
{/if}
